const crypto = require("crypto");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");
const { createReadingBank } = require("./reading-bank");

const SESSION_COOKIE = "class_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_STUDENT_PASSWORD = "123456";
const STUDENT_PASSWORD_PATTERN = /^\d{6}$/;
const DEFAULT_TEACHER_PASSWORD = "123456";

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePersonName(value) {
  return String(value || "").normalize("NFC").replace(/[^가-힣]/g, "");
}

function parseTeacherEmails(value) {
  return new Set(
    String(value || "")
      .split(",")
      .map(normalizeEmail)
      .filter(Boolean)
  );
}

function readCookie(req, name) {
  const source = String(req.headers.cookie || "");
  for (const part of source.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch (_) {
      return "";
    }
  }
  return "";
}

function hashSessionToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function hashStudentPassword(password) {
  const normalized = String(password || "").trim();
  if (!STUDENT_PASSWORD_PATTERN.test(normalized)) {
    throw new Error("Student passwords must contain exactly 6 digits.");
  }
  const salt = crypto.randomBytes(16);
  const derivedKey = crypto.scryptSync(normalized, salt, 32);
  return `scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

function verifyStudentPassword(password, encodedHash) {
  const [algorithm, saltHex, keyHex] = String(encodedHash || "").split("$");
  if (algorithm !== "scrypt" || !saltHex || !keyHex || !STUDENT_PASSWORD_PATTERN.test(String(password || ""))) {
    return false;
  }
  try {
    const expected = Buffer.from(keyHex, "hex");
    const actual = crypto.scryptSync(String(password), Buffer.from(saltHex, "hex"), expected.length);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch (_) {
    return false;
  }
}

function makeJoinCode() {
  const bytes = crypto.randomBytes(6);
  let code = "";
  for (const byte of bytes) code += JOIN_CODE_ALPHABET[byte % JOIN_CODE_ALPHABET.length];
  return code;
}

function publicUser(row) {
  return {
    email: row.email,
    name: row.display_name,
    pictureUrl: row.picture_url || null,
    domain: row.google_domain,
    role: row.role || null
  };
}

function createClassroomPlatform(options = {}) {
  const databaseUrl = String(options.databaseUrl || "").trim();
  const googleClientId = String(options.googleClientId || "").trim();
  const teacherEmails = parseTeacherEmails(options.teacherEmails);
  const adminEmails = parseTeacherEmails(options.adminEmails);
  const isProduction = options.nodeEnv === "production";
  const pool = databaseUrl
    ? new Pool({
        connectionString: databaseUrl,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      })
    : null;
  const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
  const museumPresenceSecret = crypto.randomBytes(32);
  const router = express.Router();
  let databaseReady = false;
  let initializationError = null;

  if (pool) {
    pool.on("error", (error) => {
      databaseReady = false;
      initializationError = error;
      console.error("Classroom database pool error:", error);
    });
  }

  function configuration() {
    const missing = [];
    if (!databaseUrl) missing.push("DATABASE_URL");
    if (!googleClientId) missing.push("GOOGLE_CLIENT_ID");
    if (databaseUrl && !databaseReady) missing.push("DATABASE_NOT_READY");
    return {
      enabled: missing.length === 0,
      clientId: googleClientId || null,
      missing,
      adminConfigured: adminEmails.size > 0,
      databaseError: initializationError ? "DATABASE_NOT_READY" : null
    };
  }

  function requireConfigured() {
    const current = configuration();
    if (!current.enabled) {
      throw new HttpError(503, "LOGIN_NOT_CONFIGURED", "Google sign-in is not configured yet.");
    }
  }

  function setSessionCookie(res, token) {
    const attributes = [
      `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      `Max-Age=${SESSION_MAX_AGE_SECONDS}`
    ];
    if (isProduction) attributes.push("Secure");
    res.append("Set-Cookie", attributes.join("; "));
  }

  function clearSessionCookie(res) {
    const attributes = [
      `${SESSION_COOKIE}=`,
      "Path=/",
      "HttpOnly",
      "SameSite=Lax",
      "Max-Age=0"
    ];
    if (isProduction) attributes.push("Secure");
    res.append("Set-Cookie", attributes.join("; "));
  }

  async function initialize() {
    if (!pool) return;

    const statements = [
      `CREATE TABLE IF NOT EXISTS classroom_users (
        id BIGSERIAL PRIMARY KEY,
        google_sub TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        display_name TEXT NOT NULL,
        picture_url TEXT,
        google_domain TEXT NOT NULL,
        role TEXT CHECK (role IN ('admin', 'teacher', 'student')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS classroom_users_email_idx
        ON classroom_users (LOWER(email))`,
      `ALTER TABLE classroom_users
        DROP CONSTRAINT IF EXISTS classroom_users_role_check`,
      `ALTER TABLE classroom_users
        ADD CONSTRAINT classroom_users_role_check
        CHECK (role IN ('admin', 'teacher', 'student'))`,
      `CREATE TABLE IF NOT EXISTS classroom_sessions (
        token_hash TEXT PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES classroom_users(id) ON DELETE CASCADE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE INDEX IF NOT EXISTS classroom_sessions_user_idx
        ON classroom_sessions (user_id)`,
      `CREATE TABLE IF NOT EXISTS classroom_schools (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        google_domain TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (name, google_domain)
      )`,
      `ALTER TABLE classroom_schools
        ADD COLUMN IF NOT EXISTS school_code TEXT`,
      `ALTER TABLE classroom_schools
        ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE`,
      `ALTER TABLE classroom_schools
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
      `CREATE UNIQUE INDEX IF NOT EXISTS classroom_schools_code_idx
        ON classroom_schools (UPPER(school_code))
        WHERE school_code IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS classroom_teachers (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES classroom_schools(id),
        teacher_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        google_email TEXT,
        user_id BIGINT UNIQUE REFERENCES classroom_users(id) ON DELETE SET NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (school_id, teacher_name)
      )`,
      `ALTER TABLE classroom_teachers
        ADD COLUMN IF NOT EXISTS academic_year INTEGER`,
      `ALTER TABLE classroom_teachers
        ADD COLUMN IF NOT EXISTS grade INTEGER`,
      `ALTER TABLE classroom_teachers
        ADD COLUMN IF NOT EXISTS class_number INTEGER`,
      `CREATE UNIQUE INDEX IF NOT EXISTS classroom_teachers_class_assignment_idx
        ON classroom_teachers (school_id, academic_year, grade, class_number)
        WHERE academic_year IS NOT NULL AND grade IS NOT NULL AND class_number IS NOT NULL`,
      `CREATE UNIQUE INDEX IF NOT EXISTS classroom_teachers_email_idx
        ON classroom_teachers (LOWER(google_email))
        WHERE google_email IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS classroom_classes (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES classroom_schools(id),
        teacher_user_id BIGINT NOT NULL UNIQUE REFERENCES classroom_users(id),
        academic_year INTEGER NOT NULL,
        grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 12),
        class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 30),
        teacher_name TEXT NOT NULL,
        join_code TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS classroom_classes_identity_idx
        ON classroom_classes (school_id, academic_year, grade, class_number)`,
      `UPDATE classroom_teachers t
       SET academic_year = c.academic_year,
           grade = c.grade,
           class_number = c.class_number,
           updated_at = NOW()
       FROM classroom_classes c
       WHERE t.user_id = c.teacher_user_id
         AND (t.academic_year IS NULL OR t.grade IS NULL OR t.class_number IS NULL)`,
      `CREATE TABLE IF NOT EXISTS classroom_students (
        id BIGSERIAL PRIMARY KEY,
        class_id BIGINT NOT NULL REFERENCES classroom_classes(id) ON DELETE CASCADE,
        student_number TEXT NOT NULL,
        roster_name TEXT NOT NULL,
        user_id BIGINT UNIQUE REFERENCES classroom_users(id) ON DELETE SET NULL,
        claimed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (class_id, student_number)
      )`,
      `ALTER TABLE classroom_students
        ADD COLUMN IF NOT EXISTS password_hash TEXT`,
      `ALTER TABLE classroom_students
        ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT '남'`,
      `CREATE INDEX IF NOT EXISTS classroom_students_class_idx
        ON classroom_students (class_id)`,
      `ALTER TABLE classroom_classes
        DROP CONSTRAINT IF EXISTS classroom_classes_grade_check`,
      `ALTER TABLE classroom_classes
        ADD CONSTRAINT classroom_classes_grade_check
        CHECK (grade BETWEEN 1 AND 12)`,
      `CREATE TABLE IF NOT EXISTS classroom_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `INSERT INTO classroom_settings (setting_key, setting_value)
        VALUES ('site_access_mode', 'open')
        ON CONFLICT (setting_key) DO NOTHING`,
      `WITH first_login_upgrade AS (
        INSERT INTO classroom_settings (setting_key, setting_value)
        VALUES ('school_login_v2_enabled', 'true')
        ON CONFLICT (setting_key) DO NOTHING
        RETURNING setting_key
      )
      UPDATE classroom_settings
      SET setting_value = 'restricted', updated_at = NOW()
      WHERE setting_key = 'site_access_mode'
        AND EXISTS (SELECT 1 FROM first_login_upgrade)`
    ];

    try {
      for (const statement of statements) await pool.query(statement);
      await pool.query("DELETE FROM classroom_sessions WHERE expires_at <= NOW()");
      await readingBank.initialize();
      databaseReady = true;
      initializationError = null;
      console.log("Classroom database is ready.");
    } catch (error) {
      databaseReady = false;
      initializationError = error;
      console.error("Failed to initialize classroom database:", error);
    }
  }

  async function sessionUser(req) {
    if (!databaseReady) return null;
    const token = readCookie(req, SESSION_COOKIE);
    if (!token) return null;

    const result = await pool.query(
      `SELECT u.*
       FROM classroom_sessions s
       JOIN classroom_users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [hashSessionToken(token)]
    );
    return result.rows[0] || null;
  }

  async function requireUser(req) {
    requireConfigured();
    const user = await sessionUser(req);
    if (!user) throw new HttpError(401, "AUTH_REQUIRED", "Please sign in with Google.");
    return user;
  }

  function requireDatabase() {
    if (!databaseReady) {
      throw new HttpError(503, "DATABASE_NOT_READY", "The classroom database is not ready.");
    }
  }

  async function requireTeacher(req) {
    const user = await requireUser(req);
    if (user.role !== "teacher") {
      throw new HttpError(403, "TEACHER_REQUIRED", "This page is for teachers only.");
    }
    const registration = await pool.query(
      `SELECT 1
       FROM classroom_teachers t
       JOIN classroom_schools sc ON sc.id = t.school_id
       WHERE t.user_id = $1 AND t.active = TRUE AND sc.enabled = TRUE`,
      [user.id]
    );
    if (!registration.rows[0]) {
      throw new HttpError(403, "TEACHER_REGISTRATION_REQUIRED", "Ask the administrator to register this teacher account.");
    }
    return user;
  }

  async function requireAdmin(req) {
    const user = await requireUser(req);
    if (user.role !== "admin") {
      throw new HttpError(403, "ADMIN_REQUIRED", "This page is for the site administrator only.");
    }
    return user;
  }

  const readingBank = createReadingBank({
    pool,
    requireUser,
    requireAdmin,
    requireDatabase,
    HttpError,
    asyncRoute
  });

  async function getSiteAccessMode() {
    requireDatabase();
    const result = await pool.query(
      "SELECT setting_value FROM classroom_settings WHERE setting_key = 'site_access_mode'"
    );
    return result.rows[0]?.setting_value === "restricted" ? "restricted" : "open";
  }

  async function studentMembership(userId) {
    const result = await pool.query(
      `SELECT s.student_number, s.roster_name,
              c.academic_year, c.grade, c.class_number,
              sc.name AS school_name
       FROM classroom_students s
       JOIN classroom_classes c ON c.id = s.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE s.user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT 1`,
      [userId]
    );
    const row = result.rows[0];
    if (!row) return null;
    return {
      studentNumber: row.student_number,
      name: row.roster_name,
      schoolName: row.school_name,
      academicYear: row.academic_year,
      grade: row.grade,
      classNumber: row.class_number
    };
  }

  function signMuseumPresence(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto.createHmac("sha256", museumPresenceSecret).update(body).digest("base64url");
    return `${body}.${signature}`;
  }

  function verifyMuseumPresenceTicket(ticket) {
    const [body, signature] = String(ticket || "").split(".");
    if (!body || !signature) return null;
    const expected = crypto.createHmac("sha256", museumPresenceSecret).update(body).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    try {
      const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
      return payload.exp > Date.now() && payload.kind === "museum-presence" ? payload : null;
    } catch (_) { return null; }
  }

  router.get("/auth/config", (req, res) => {
    res.json(configuration());
  });

  router.get("/auth/me", asyncRoute(async (req, res) => {
    const current = configuration();
    if (!current.enabled) {
      return res.json({ signedIn: false, configured: false, missing: current.missing });
    }
    const user = await sessionUser(req);
    if (!user) return res.json({ signedIn: false, configured: true });
    const membership = user.role === "student" ? await studentMembership(user.id) : null;
    return res.json({
      signedIn: true,
      configured: true,
      user: publicUser(user),
      membership
    });
  }));

  router.get("/museum/presence-ticket", asyncRoute(async (req, res) => {
    const accessMode = await getSiteAccessMode();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    if (accessMode === "open") {
      const name = normalizePersonName(req.query?.name);
      const clientId = String(req.query?.clientId || "").trim();
      if (name.length < 2 || name.length > 6) {
        throw new HttpError(400, "VALID_NAME_REQUIRED", "Enter a Korean name with 2 to 6 characters.");
      }
      if (!/^[a-zA-Z0-9-]{12,80}$/.test(clientId)) {
        throw new HttpError(400, "VALID_CLIENT_REQUIRED", "The museum visitor ID is not valid.");
      }
      const userId = `guest-${crypto.createHash("sha256").update(clientId).digest("hex").slice(0, 16)}`;
      const ticket = signMuseumPresence({
        kind: "museum-presence", exp: expiresAt, userId, name, classKey: "open"
      });
      return res.json({ ticket, expiresAt, scope: "open" });
    }

    const user = await requireUser(req);
    if (user.role !== "student") throw new HttpError(403, "STUDENT_REQUIRED", "Museum presence is for student accounts only.");
    const membership = await studentMembership(user.id);
    if (!membership) throw new HttpError(403, "CLASS_MEMBERSHIP_REQUIRED", "Join your class before entering the museum.");
    const ticket = signMuseumPresence({
      kind: "museum-presence", exp: expiresAt, userId: String(user.id), name: membership.name,
      classKey: `${membership.schoolName}|${membership.academicYear}|${membership.grade}|${membership.classNumber}`
    });
    res.json({ ticket, expiresAt, scope: "class" });
  }));

  router.get("/site/access", asyncRoute(async (req, res) => {
    const mode = await getSiteAccessMode();
    res.json({ mode });
  }));

  router.get("/schools", asyncRoute(async (req, res) => {
    requireDatabase();
    const result = await pool.query(
      `SELECT id, name
       FROM classroom_schools
       WHERE enabled = TRUE
       ORDER BY name, id`
    );
    res.json({ schools: result.rows.map((school) => ({ id: String(school.id), name: school.name })) });
  }));

  router.post("/auth/google", asyncRoute(async (req, res) => {
    requireConfigured();
    const credential = String(req.body?.credential || "");
    if (!credential || credential.length > 10000) {
      throw new HttpError(400, "INVALID_GOOGLE_CREDENTIAL", "Google did not return a valid sign-in credential.");
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
      payload = ticket.getPayload();
    } catch (_) {
      throw new HttpError(401, "INVALID_GOOGLE_CREDENTIAL", "Google sign-in could not be verified.");
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      throw new HttpError(401, "UNVERIFIED_GOOGLE_ACCOUNT", "Use a verified Google account.");
    }
    const email = normalizeEmail(payload.email);
    const isAdmin = adminEmails.has(email);
    const isTeacher = teacherEmails.has(email);
    if (!payload.hd && !isAdmin) {
      throw new HttpError(403, "SCHOOL_ACCOUNT_REQUIRED", "Use the Google Workspace account issued by your school.");
    }
    const userResult = await pool.query(
      `INSERT INTO classroom_users
        (google_sub, email, display_name, picture_url, google_domain, role)
       VALUES ($1, $2, $3, $4, $5,
         CASE WHEN $6 THEN 'admin' WHEN $7 THEN 'teacher' ELSE NULL END)
       ON CONFLICT (google_sub) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         picture_url = EXCLUDED.picture_url,
         google_domain = EXCLUDED.google_domain,
         role = CASE
           WHEN $6 THEN 'admin'
           WHEN classroom_users.role = 'admin' THEN 'admin'
           WHEN $7 THEN 'teacher'
           ELSE classroom_users.role
         END,
         updated_at = NOW()
       RETURNING *`,
      [
        payload.sub,
        email,
        String(payload.name || email).trim().slice(0, 100),
        payload.picture ? String(payload.picture).slice(0, 500) : null,
        String(payload.hd || email.split("@")[1] || "personal").trim().toLowerCase(),
        isAdmin,
        isTeacher
      ]
    );
    const user = userResult.rows[0];

    const sessionToken = crypto.randomBytes(32).toString("base64url");
    await pool.query(
      `INSERT INTO classroom_sessions (token_hash, user_id, expires_at)
       VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 second'))`,
      [hashSessionToken(sessionToken), user.id, SESSION_MAX_AGE_SECONDS]
    );
    setSessionCookie(res, sessionToken);
    const membership = user.role === "student" ? await studentMembership(user.id) : null;
    return res.json({ ok: true, user: publicUser(user), membership });
  }));

  router.post("/auth/logout", asyncRoute(async (req, res) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (pool && databaseReady && token) {
      await pool.query("DELETE FROM classroom_sessions WHERE token_hash = $1", [hashSessionToken(token)]);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  }));

  router.get("/admin/site-access", asyncRoute(async (req, res) => {
    const admin = await requireAdmin(req);
    const mode = await getSiteAccessMode();
    res.json({ mode, user: publicUser(admin) });
  }));

  router.put("/admin/site-access", asyncRoute(async (req, res) => {
    const admin = await requireAdmin(req);
    const mode = String(req.body?.mode || "").trim().toLowerCase();
    if (!["open", "restricted"].includes(mode)) {
      throw new HttpError(400, "INVALID_ACCESS_MODE", "Choose open or restricted access.");
    }
    await pool.query(
      `INSERT INTO classroom_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES ('site_access_mode', $1, $2, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET
         setting_value = EXCLUDED.setting_value,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()`,
      [mode, admin.id]
    );
    res.json({ ok: true, mode });
  }));

  router.get("/admin/schools", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const schoolsResult = await pool.query(
      `SELECT id, name, google_domain, enabled
       FROM classroom_schools
       ORDER BY name, id`
    );
    const teachersResult = await pool.query(
      `SELECT t.id, t.school_id, t.teacher_name, t.google_email, t.active,
              t.user_id IS NOT NULL AS linked,
              t.academic_year AS assigned_academic_year,
              t.grade AS assigned_grade,
              t.class_number AS assigned_class_number,
              c.id AS saved_class_id,
              COUNT(s.id)::INTEGER AS student_count
       FROM classroom_teachers t
       LEFT JOIN classroom_classes c ON c.teacher_user_id = t.user_id
       LEFT JOIN classroom_students s ON s.class_id = c.id
       GROUP BY t.id, c.id
       ORDER BY t.teacher_name, t.id`
    );
    const teachersBySchool = new Map();
    for (const teacher of teachersResult.rows) {
      const schoolId = String(teacher.school_id);
      if (!teachersBySchool.has(schoolId)) teachersBySchool.set(schoolId, []);
      teachersBySchool.get(schoolId).push({
        id: String(teacher.id),
        name: teacher.teacher_name,
        email: teacher.google_email || "",
        active: teacher.active,
        linked: teacher.linked,
        classroom: teacher.assigned_academic_year ? {
          academicYear: teacher.assigned_academic_year,
          grade: teacher.assigned_grade,
          classNumber: teacher.assigned_class_number,
          studentCount: teacher.student_count,
          rosterSaved: Boolean(teacher.saved_class_id)
        } : null
      });
    }
    res.json({
      schools: schoolsResult.rows.map((school) => ({
        id: String(school.id),
        name: school.name,
        domain: school.google_domain || "",
        enabled: school.enabled,
        teachers: teachersBySchool.get(String(school.id)) || []
      }))
    });
  }));

  router.post("/admin/schools", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const name = String(req.body?.name || "").trim();
    if (!name || name.length > 80) {
      throw new HttpError(400, "INVALID_SCHOOL", "Enter a school name.");
    }
    const existing = await pool.query(
      `UPDATE classroom_schools
       SET enabled = TRUE, updated_at = NOW()
       WHERE id = (SELECT id FROM classroom_schools WHERE name = $1 ORDER BY id LIMIT 1)
       RETURNING id, name, enabled`,
      [name]
    );
    const result = existing.rows[0] ? existing : await pool.query(
      `INSERT INTO classroom_schools (name, google_domain, enabled)
       VALUES ($1, '', TRUE)
       RETURNING id, name, enabled`,
      [name]
    );
    res.json({ ok: true, school: { id: String(result.rows[0].id), name: result.rows[0].name, enabled: result.rows[0].enabled } });
  }));

  router.patch("/admin/schools/:schoolId", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const schoolId = Number(req.params.schoolId);
    const name = String(req.body?.name || "").trim();
    const enabled = req.body?.enabled;
    if (!Number.isInteger(schoolId) || schoolId < 1 || !name || name.length > 80 || typeof enabled !== "boolean") {
      throw new HttpError(400, "INVALID_SCHOOL", "Check the school name and access setting.");
    }
    const result = await pool.query(
      `UPDATE classroom_schools
       SET name = $1, enabled = $2
       WHERE id = $3
       RETURNING id`,
      [name, enabled, schoolId]
    );
    if (!result.rows[0]) throw new HttpError(404, "SCHOOL_NOT_FOUND", "School not found.");
    res.json({ ok: true });
  }));

  router.post("/admin/schools/:schoolId/teachers", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const schoolId = Number(req.params.schoolId);
    const teacherName = String(req.body?.name || "").normalize("NFC").trim();
    const password = String(req.body?.password || DEFAULT_TEACHER_PASSWORD).trim();
    const academicYear = Number(req.body?.academicYear);
    const grade = Number(req.body?.grade);
    const classNumber = Number(req.body?.classNumber);
    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(schoolId) || schoolId < 1 ||
      !teacherName || teacherName.length > 30 ||
      ![currentYear - 1, currentYear, currentYear + 1].includes(academicYear) ||
      !Number.isInteger(grade) || grade < 1 || grade > 12 ||
      !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 30
    ) {
      throw new HttpError(400, "INVALID_TEACHER", "Check the school year, grade, class, and teacher name.");
    }
    if (!STUDENT_PASSWORD_PATTERN.test(password)) {
      throw new HttpError(400, "INVALID_TEACHER_PASSWORD", "Teacher passwords must contain exactly 6 digits.");
    }
    let result;
    try {
      result = await pool.query(
      `INSERT INTO classroom_teachers
        (school_id, teacher_name, password_hash, academic_year, grade, class_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [schoolId, teacherName, hashStudentPassword(password), academicYear, grade, classNumber]
      );
    } catch (error) {
      if (error.code === "23505") {
        if (error.constraint === "classroom_teachers_school_id_teacher_name_key") {
          throw new HttpError(409, "TEACHER_ALREADY_EXISTS", "That teacher is already registered. Edit the existing row instead.");
        }
        throw new HttpError(409, "CLASS_ALREADY_ASSIGNED", "That school year, grade, and class already have a homeroom teacher.");
      }
      throw error;
    }
    res.json({ ok: true, teacherId: String(result.rows[0].id) });
  }));

  router.patch("/admin/teachers/:teacherId", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const teacherId = Number(req.params.teacherId);
    const teacherName = String(req.body?.name || "").normalize("NFC").trim();
    const password = String(req.body?.password || "").trim();
    const active = req.body?.active;
    const academicYear = Number(req.body?.academicYear);
    const grade = Number(req.body?.grade);
    const classNumber = Number(req.body?.classNumber);
    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(teacherId) || teacherId < 1 ||
      !teacherName || teacherName.length > 30 || typeof active !== "boolean" ||
      ![currentYear - 1, currentYear, currentYear + 1].includes(academicYear) ||
      !Number.isInteger(grade) || grade < 1 || grade > 12 ||
      !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 30
    ) {
      throw new HttpError(400, "INVALID_TEACHER", "Check the teacher information.");
    }
    if (password && !STUDENT_PASSWORD_PATTERN.test(password)) {
      throw new HttpError(400, "INVALID_TEACHER_PASSWORD", "Teacher passwords must contain exactly 6 digits.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `UPDATE classroom_teachers
         SET teacher_name = $1,
             password_hash = CASE WHEN $2 = '' THEN password_hash ELSE $3 END,
             active = $4,
             academic_year = $5,
             grade = $6,
             class_number = $7,
             updated_at = NOW()
         WHERE id = $8
         RETURNING id, user_id`,
        [teacherName, password, password ? hashStudentPassword(password) : null, active,
          academicYear, grade, classNumber, teacherId]
      );
      const updated = result.rows[0];
      if (!updated) throw new HttpError(404, "TEACHER_NOT_FOUND", "Teacher not found.");
      if (updated.user_id) {
        await client.query(
          `UPDATE classroom_classes
           SET academic_year = $1, grade = $2, class_number = $3,
               teacher_name = $4, updated_at = NOW()
           WHERE teacher_user_id = $5`,
          [academicYear, grade, classNumber, teacherName, updated.user_id]
        );
      }
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        throw new HttpError(409, "CLASS_ALREADY_ASSIGNED", "That school year, grade, and class already have a homeroom teacher.");
      }
      throw error;
    } finally {
      client.release();
    }
  }));

  router.delete("/admin/teachers/:teacherId", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const teacherId = Number(req.params.teacherId);
    if (!Number.isInteger(teacherId) || teacherId < 1) {
      throw new HttpError(400, "INVALID_TEACHER", "Teacher not found.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        "SELECT user_id FROM classroom_teachers WHERE id = $1 FOR UPDATE",
        [teacherId]
      );
      const teacher = result.rows[0];
      if (!teacher) throw new HttpError(404, "TEACHER_NOT_FOUND", "Teacher not found.");
      if (teacher.user_id) {
        await client.query("DELETE FROM classroom_classes WHERE teacher_user_id = $1", [teacher.user_id]);
        await client.query(
          "UPDATE classroom_users SET role = NULL, updated_at = NOW() WHERE id = $1 AND role = 'teacher'",
          [teacher.user_id]
        );
      }
      await client.query("DELETE FROM classroom_teachers WHERE id = $1", [teacherId]);
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/admin/teachers/:teacherId/unlink", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const teacherId = Number(req.params.teacherId);
    if (!Number.isInteger(teacherId) || teacherId < 1) {
      throw new HttpError(400, "INVALID_TEACHER", "Teacher not found.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query("SELECT user_id FROM classroom_teachers WHERE id = $1 FOR UPDATE", [teacherId]);
      const teacher = result.rows[0];
      if (!teacher) throw new HttpError(404, "TEACHER_NOT_FOUND", "Teacher not found.");
      if (teacher.user_id) {
        await client.query("UPDATE classroom_users SET role = NULL, updated_at = NOW() WHERE id = $1 AND role = 'teacher'", [teacher.user_id]);
        await client.query("UPDATE classroom_teachers SET user_id = NULL, google_email = NULL, updated_at = NOW() WHERE id = $1", [teacherId]);
      }
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.delete("/admin/schools/:schoolId", asyncRoute(async (req, res) => {
    await requireAdmin(req);
    const schoolId = Number(req.params.schoolId);
    if (!Number.isInteger(schoolId) || schoolId < 1) {
      throw new HttpError(400, "INVALID_SCHOOL", "School not found.");
    }
    const usage = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM classroom_teachers WHERE school_id = $1)::INTEGER AS teacher_count,
         (SELECT COUNT(*) FROM classroom_classes WHERE school_id = $1)::INTEGER AS class_count`,
      [schoolId]
    );
    if (usage.rows[0].teacher_count > 0 || usage.rows[0].class_count > 0) {
      throw new HttpError(409, "SCHOOL_IN_USE", "Delete this school's teachers and classes first.");
    }
    const result = await pool.query("DELETE FROM classroom_schools WHERE id = $1 RETURNING id", [schoolId]);
    if (!result.rows[0]) throw new HttpError(404, "SCHOOL_NOT_FOUND", "School not found.");
    res.json({ ok: true });
  }));

  router.get("/teacher/profile", asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    if (user.role === "admin" || user.role === "student") {
      throw new HttpError(403, "TEACHER_REQUIRED", "This page is for teachers only.");
    }
    const result = await pool.query(
      `SELECT t.id, t.teacher_name, t.active, t.academic_year, t.grade, t.class_number,
              sc.enabled AS school_enabled,
              sc.id AS school_id, sc.name AS school_name
       FROM classroom_teachers t
       JOIN classroom_schools sc ON sc.id = t.school_id
       WHERE t.user_id = $1`,
      [user.id]
    );
    const profile = result.rows[0];
    res.json({
      registered: Boolean(profile?.active && profile?.school_enabled),
      profile: profile ? {
        id: String(profile.id),
        name: profile.teacher_name,
        schoolId: String(profile.school_id),
        schoolName: profile.school_name,
        academicYear: profile.academic_year,
        grade: profile.grade,
        classNumber: profile.class_number,
        active: profile.active
      } : null
    });
  }));

  router.post("/teacher/claim", asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    if (user.role === "admin" || user.role === "student") {
      throw new HttpError(403, "TEACHER_REQUIRED", "This account cannot claim a teacher profile.");
    }
    const schoolId = Number(req.body?.schoolId);
    const teacherName = String(req.body?.name || "").normalize("NFC").trim();
    const password = String(req.body?.password || "").trim();
    if (!Number.isInteger(schoolId) || schoolId < 1 || !teacherName || !STUDENT_PASSWORD_PATTERN.test(password)) {
      throw new HttpError(400, "INVALID_TEACHER_DETAILS", "Check the school, teacher name, and 6-digit password.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(
        `SELECT t.*, sc.enabled, sc.google_domain
         FROM classroom_teachers t
         JOIN classroom_schools sc ON sc.id = t.school_id
         WHERE t.school_id = $1 AND t.teacher_name = $2
         FOR UPDATE`,
        [schoolId, teacherName]
      );
      const teacher = result.rows[0];
      if (
        !teacher || !teacher.active || !teacher.enabled ||
        !teacher.academic_year || !teacher.grade || !teacher.class_number ||
        !verifyStudentPassword(password, teacher.password_hash)
      ) {
        throw new HttpError(403, "INVALID_TEACHER_DETAILS", "Check the school, teacher name, and 6-digit password.");
      }
      if (teacher.user_id && String(teacher.user_id) !== String(user.id)) {
        throw new HttpError(409, "TEACHER_ALREADY_LINKED", "This teacher profile is already linked to another Google account.");
      }
      if (teacher.google_domain && teacher.google_domain !== user.google_domain) {
        throw new HttpError(403, "SCHOOL_ACCOUNT_MISMATCH", "Use the Google account issued by this school.");
      }
      await client.query(
        `UPDATE classroom_schools
         SET google_domain = CASE WHEN google_domain = '' THEN $1 ELSE google_domain END
         WHERE id = $2`,
        [user.google_domain, schoolId]
      );
      await client.query(
        `UPDATE classroom_teachers
         SET user_id = $1, google_email = $2, updated_at = NOW()
         WHERE id = $3`,
        [user.id, user.email, teacher.id]
      );
      await client.query("UPDATE classroom_users SET role = 'teacher', updated_at = NOW() WHERE id = $1", [user.id]);
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.get("/teacher/class", asyncRoute(async (req, res) => {
    const teacher = await requireTeacher(req);
    const classResult = await pool.query(
      `SELECT c.*, sc.name AS school_name, sc.school_code
       FROM classroom_classes c
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE c.teacher_user_id = $1
       ORDER BY c.updated_at DESC
       LIMIT 1`,
      [teacher.id]
    );
    const classroom = classResult.rows[0];
    if (!classroom) return res.json({ classroom: null });

    const studentsResult = await pool.query(
      `SELECT student_number, roster_name, COALESCE(gender, '남') AS gender, user_id IS NOT NULL AS linked,
              password_hash IS NOT NULL AS password_configured
       FROM classroom_students
       WHERE class_id = $1
       ORDER BY CASE WHEN student_number ~ '^[0-9]+$' THEN student_number::INTEGER END,
                student_number`,
      [classroom.id]
    );
    return res.json({
      classroom: {
        schoolName: classroom.school_name,
        schoolCode: classroom.school_code,
        academicYear: classroom.academic_year,
        grade: classroom.grade,
        classNumber: classroom.class_number,
        teacherName: classroom.teacher_name,
        students: studentsResult.rows.map((student) => ({
          number: student.student_number,
          name: student.roster_name,
          gender: student.gender === '여' ? '여' : '남',
          linked: student.linked,
          passwordConfigured: student.password_configured
        }))
      }
    });
  }));

  router.put("/teacher/class", asyncRoute(async (req, res) => {
    const teacher = await requireTeacher(req);
    const assignmentResult = await pool.query(
      `SELECT t.school_id, t.teacher_name, t.academic_year, t.grade, t.class_number,
              sc.name AS school_name, sc.school_code
       FROM classroom_teachers t
       JOIN classroom_schools sc ON sc.id = t.school_id
       WHERE t.user_id = $1 AND t.active = TRUE AND sc.enabled = TRUE`,
      [teacher.id]
    );
    const assignment = assignmentResult.rows[0];
    if (!assignment) {
      throw new HttpError(403, "TEACHER_REGISTRATION_REQUIRED", "Ask the administrator to register this teacher account.");
    }
    const schoolName = assignment.school_name;
    const schoolCode = assignment.school_code || `SCH${assignment.school_id}`;
    const academicYear = Number(assignment.academic_year);
    const grade = Number(assignment.grade);
    const classNumber = Number(assignment.class_number);
    const teacherName = assignment.teacher_name;
    const students = Array.isArray(req.body?.students) ? req.body.students : [];
    const currentYear = new Date().getFullYear();

    if (![currentYear - 1, currentYear, currentYear + 1].includes(academicYear)) {
      throw new HttpError(400, "INVALID_ACADEMIC_YEAR", "Choose one of the three available school years.");
    }
    if (!Number.isInteger(grade) || grade < 1 || grade > 12) {
      throw new HttpError(400, "INVALID_GRADE", "Grade must be between 1 and 12.");
    }
    if (!Number.isInteger(classNumber) || classNumber < 1 || classNumber > 30) {
      throw new HttpError(400, "INVALID_CLASS_NUMBER", "Class number must be between 1 and 30.");
    }
    if (students.length < 1 || students.length > 60) {
      throw new HttpError(400, "INVALID_ROSTER_SIZE", "The roster must contain 1 to 60 students.");
    }

    const cleanStudents = students.map((student) => {
      const rawGender = String(student?.gender || "").trim().toLowerCase();
      const gender = (rawGender.includes("여") || rawGender === "f" || rawGender === "female") ? "여" : "남";
      return {
        number: String(student?.number || "").trim(),
        name: String(student?.name || "").normalize("NFC").trim(),
        gender,
        password: String(student?.password || "").trim()
      };
    });
    if (cleanStudents.some((student) => !/^\d{1,3}$/.test(student.number))) {
      throw new HttpError(400, "INVALID_STUDENT_NUMBER", "Student numbers must contain digits only.");
    }
    if (cleanStudents.some((student) => !/^[가-힣]{2,6}$/.test(student.name))) {
      throw new HttpError(400, "INVALID_STUDENT_NAME", "Student names must be 2 to 6 Korean characters.");
    }
    if (new Set(cleanStudents.map((student) => student.number)).size !== cleanStudents.length) {
      throw new HttpError(400, "DUPLICATE_STUDENT_NUMBER", "Student numbers must be unique.");
    }
    if (cleanStudents.some((student) => student.password && !STUDENT_PASSWORD_PATTERN.test(student.password))) {
      throw new HttpError(400, "INVALID_STUDENT_PASSWORD", "Student passwords must contain exactly 6 digits.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const schoolId = assignment.school_id;
      await client.query(
        `UPDATE classroom_schools
         SET school_code = COALESCE(school_code, $1), updated_at = NOW()
         WHERE id = $2`,
        [schoolCode, schoolId]
      );
      const assignedClassResult = await client.query(
        `SELECT 1
         FROM classroom_classes
         WHERE school_id = $1 AND academic_year = $2 AND grade = $3 AND class_number = $4
           AND teacher_user_id <> $5
         FOR UPDATE`,
        [schoolId, academicYear, grade, classNumber, teacher.id]
      );
      if (assignedClassResult.rowCount > 0) {
        throw new HttpError(409, "CLASS_ALREADY_ASSIGNED", "That school year, grade, and class already have a homeroom teacher.");
      }
      const existingResult = await client.query(
        "SELECT id, join_code FROM classroom_classes WHERE teacher_user_id = $1 FOR UPDATE",
        [teacher.id]
      );

      let classroom;
      if (existingResult.rows[0]) {
        const result = await client.query(
          `UPDATE classroom_classes SET
             school_id = $1,
             academic_year = $2,
             grade = $3,
             class_number = $4,
             teacher_name = $5,
             updated_at = NOW()
           WHERE id = $6
           RETURNING id, join_code`,
          [schoolId, academicYear, grade, classNumber, teacherName, existingResult.rows[0].id]
        );
        classroom = result.rows[0];
      } else {
        let candidate;
        for (let attempt = 0; attempt < 8; attempt += 1) {
          candidate = makeJoinCode();
          const collision = await client.query(
            "SELECT 1 FROM classroom_classes WHERE join_code = $1",
            [candidate]
          );
          if (collision.rowCount === 0) break;
        }
        const result = await client.query(
          `INSERT INTO classroom_classes
            (school_id, teacher_user_id, academic_year, grade, class_number, teacher_name, join_code)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, join_code`,
          [schoolId, teacher.id, academicYear, grade, classNumber, teacherName, candidate]
        );
        classroom = result.rows[0];
      }

      const numbers = cleanStudents.map((student) => student.number);
      await client.query(
        `DELETE FROM classroom_students
         WHERE class_id = $1 AND NOT (student_number = ANY($2::TEXT[]))`,
        [classroom.id, numbers]
      );
      const existingPasswordsResult = await client.query(
        `SELECT student_number, password_hash
         FROM classroom_students
         WHERE class_id = $1 AND student_number = ANY($2::TEXT[])`,
        [classroom.id, numbers]
      );
      const existingPasswords = new Map(
        existingPasswordsResult.rows.map((student) => [student.student_number, student.password_hash])
      );
      for (const student of cleanStudents) {
        const passwordHash = student.password
          ? hashStudentPassword(student.password)
          : existingPasswords.get(student.number) || hashStudentPassword(DEFAULT_STUDENT_PASSWORD);
        await client.query(
          `INSERT INTO classroom_students (class_id, student_number, roster_name, gender, password_hash)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (class_id, student_number) DO UPDATE SET
             roster_name = EXCLUDED.roster_name,
             gender = EXCLUDED.gender,
             password_hash = EXCLUDED.password_hash,
             updated_at = NOW()`,
          [classroom.id, student.number, student.name, student.gender, passwordHash]
        );
      }
      await client.query("COMMIT");
      return res.json({ ok: true, schoolCode, studentCount: cleanStudents.length });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/student/join", asyncRoute(async (req, res) => {
    const user = await requireUser(req);
    if (user.role === "teacher") {
      throw new HttpError(403, "STUDENT_REQUIRED", "Teacher accounts cannot join a student roster.");
    }
    const schoolId = Number(req.body?.schoolId);
    const grade = Number(req.body?.grade);
    const classNumber = Number(req.body?.classNumber);
    const studentNumber = String(req.body?.studentNumber || "").trim();
    const studentName = String(req.body?.name || "").normalize("NFC").trim();
    const password = String(req.body?.password || "").trim();
    const currentYear = new Date().getFullYear();
    if (
      !Number.isInteger(schoolId) || schoolId < 1 ||
      !Number.isInteger(grade) || grade < 1 || grade > 12 ||
      !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 30 ||
      !/^\d{1,3}$/.test(studentNumber) ||
      !/^[가-힣]{2,6}$/.test(studentName) ||
      !STUDENT_PASSWORD_PATTERN.test(password)
    ) {
      throw new HttpError(400, "INVALID_JOIN_DETAILS", "Check the school, grade, class, number, name, and password.");
    }

    const slotResult = await pool.query(
      `SELECT s.id, s.roster_name, s.user_id, s.password_hash, c.id AS class_id,
              sc.name AS school_name, sc.google_domain,
              c.academic_year, c.grade, c.class_number
       FROM classroom_students s
       JOIN classroom_classes c ON c.id = s.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE sc.id = $1 AND sc.enabled = TRUE
         AND c.academic_year = $2
         AND c.grade = $3
         AND c.class_number = $4
         AND s.student_number = $5`,
      [schoolId, currentYear, grade, classNumber, studentNumber]
    );
    const slot = slotResult.rows[0];
    if (!slot) throw new HttpError(404, "STUDENT_NOT_FOUND", "No matching student was found in that class.");
    if (!slot.password_hash || !verifyStudentPassword(password, slot.password_hash)) {
      throw new HttpError(403, "INVALID_STUDENT_PASSWORD", "Check the school, grade, class, number, name, and password.");
    }
    if (slot.google_domain !== user.google_domain) {
      throw new HttpError(403, "SCHOOL_ACCOUNT_MISMATCH", "Use the Google account issued by this school.");
    }
    if (normalizePersonName(slot.roster_name) !== normalizePersonName(studentName)) {
      throw new HttpError(403, "NAME_MISMATCH", "Check the school, grade, class, number, name, and password.");
    }
    if (slot.user_id && String(slot.user_id) !== String(user.id)) {
      throw new HttpError(409, "STUDENT_ALREADY_LINKED", "This student number is already linked to another account.");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "UPDATE classroom_students SET user_id = NULL, claimed_at = NULL, updated_at = NOW() WHERE user_id = $1",
        [user.id]
      );
      await client.query(
        "UPDATE classroom_students SET user_id = $1, claimed_at = NOW(), updated_at = NOW() WHERE id = $2",
        [user.id, slot.id]
      );
      await client.query(
        "UPDATE classroom_users SET role = 'student', updated_at = NOW() WHERE id = $1",
        [user.id]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    return res.json({
      ok: true,
      membership: {
        studentNumber,
        name: slot.roster_name,
        schoolName: slot.school_name,
        academicYear: slot.academic_year,
        grade: slot.grade,
        classNumber: slot.class_number
      }
    });
  }));

  router.use("/reading", readingBank.router);

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) {
      return res.status(error.status).json({
        error: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {})
      });
    }
    console.error("Classroom API error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "The server could not complete the request." });
  });

  return { router, initialize, configuration, verifyMuseumPresenceTicket };
}

module.exports = {
  createClassroomPlatform,
  hashStudentPassword,
  normalizePersonName,
  parseTeacherEmails,
  verifyStudentPassword
};
