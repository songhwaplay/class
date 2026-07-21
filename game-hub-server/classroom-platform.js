const crypto = require("crypto");
const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const { Pool } = require("pg");

const SESSION_COOKIE = "class_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_STUDENT_PASSWORD = "123456";
const STUDENT_PASSWORD_PATTERN = /^\d{6}$/;

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
      `CREATE TABLE IF NOT EXISTS classroom_classes (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES classroom_schools(id),
        teacher_user_id BIGINT NOT NULL UNIQUE REFERENCES classroom_users(id),
        academic_year INTEGER NOT NULL,
        grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 6),
        class_number INTEGER NOT NULL CHECK (class_number BETWEEN 1 AND 30),
        teacher_name TEXT NOT NULL,
        join_code TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
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
      `CREATE INDEX IF NOT EXISTS classroom_students_class_idx
        ON classroom_students (class_id)`,
      `CREATE TABLE IF NOT EXISTS classroom_settings (
        setting_key TEXT PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`,
      `INSERT INTO classroom_settings (setting_key, setting_value)
        VALUES ('site_access_mode', 'open')
        ON CONFLICT (setting_key) DO NOTHING`
    ];

    try {
      for (const statement of statements) await pool.query(statement);
      await pool.query("DELETE FROM classroom_sessions WHERE expires_at <= NOW()");
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
    return user;
  }

  async function requireAdmin(req) {
    const user = await requireUser(req);
    if (user.role !== "admin") {
      throw new HttpError(403, "ADMIN_REQUIRED", "This page is for the site administrator only.");
    }
    return user;
  }

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

  router.get("/site/access", asyncRoute(async (req, res) => {
    const mode = await getSiteAccessMode();
    res.json({ mode });
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

  router.get("/teacher/class", asyncRoute(async (req, res) => {
    const teacher = await requireTeacher(req);
    const classResult = await pool.query(
      `SELECT c.*, sc.name AS school_name
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
      `SELECT student_number, roster_name, user_id IS NOT NULL AS linked,
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
        academicYear: classroom.academic_year,
        grade: classroom.grade,
        classNumber: classroom.class_number,
        teacherName: classroom.teacher_name,
        joinCode: classroom.join_code,
        students: studentsResult.rows.map((student) => ({
          number: student.student_number,
          name: student.roster_name,
          linked: student.linked,
          passwordConfigured: student.password_configured
        }))
      }
    });
  }));

  router.put("/teacher/class", asyncRoute(async (req, res) => {
    const teacher = await requireTeacher(req);
    const schoolName = String(req.body?.schoolName || "").trim();
    const academicYear = Number(req.body?.academicYear);
    const grade = Number(req.body?.grade);
    const classNumber = Number(req.body?.classNumber);
    const teacherName = String(req.body?.teacherName || "").trim();
    const students = Array.isArray(req.body?.students) ? req.body.students : [];
    const currentYear = new Date().getFullYear();

    if (!schoolName || schoolName.length > 80) {
      throw new HttpError(400, "INVALID_SCHOOL", "Enter a school name.");
    }
    if (![currentYear - 1, currentYear, currentYear + 1].includes(academicYear)) {
      throw new HttpError(400, "INVALID_ACADEMIC_YEAR", "Choose one of the three available school years.");
    }
    if (!Number.isInteger(grade) || grade < 1 || grade > 6) {
      throw new HttpError(400, "INVALID_GRADE", "Grade must be between 1 and 6.");
    }
    if (!Number.isInteger(classNumber) || classNumber < 1 || classNumber > 30) {
      throw new HttpError(400, "INVALID_CLASS_NUMBER", "Class number must be between 1 and 30.");
    }
    if (!teacherName || teacherName.length > 30) {
      throw new HttpError(400, "INVALID_TEACHER_NAME", "Enter the homeroom teacher name.");
    }
    if (students.length < 1 || students.length > 60) {
      throw new HttpError(400, "INVALID_ROSTER_SIZE", "The roster must contain 1 to 60 students.");
    }

    const cleanStudents = students.map((student) => ({
      number: String(student?.number || "").trim(),
      name: String(student?.name || "").normalize("NFC").trim(),
      password: String(student?.password || "").trim()
    }));
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
      const schoolResult = await client.query(
        `INSERT INTO classroom_schools (name, google_domain)
         VALUES ($1, $2)
         ON CONFLICT (name, google_domain) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [schoolName, teacher.google_domain]
      );
      const schoolId = schoolResult.rows[0].id;
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
          `INSERT INTO classroom_students (class_id, student_number, roster_name, password_hash)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (class_id, student_number) DO UPDATE SET
             roster_name = EXCLUDED.roster_name,
             password_hash = EXCLUDED.password_hash,
             updated_at = NOW()`,
          [classroom.id, student.number, student.name, passwordHash]
        );
      }
      await client.query("COMMIT");
      return res.json({ ok: true, joinCode: classroom.join_code, studentCount: cleanStudents.length });
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
    const joinCode = String(req.body?.joinCode || "").trim().toUpperCase();
    const studentNumber = String(req.body?.studentNumber || "").trim();
    const password = String(req.body?.password || "").trim();
    if (!/^[A-Z2-9]{6}$/.test(joinCode) || !/^\d{1,3}$/.test(studentNumber) || !STUDENT_PASSWORD_PATTERN.test(password)) {
      throw new HttpError(400, "INVALID_JOIN_DETAILS", "Check the class code, student number, and password.");
    }

    const slotResult = await pool.query(
      `SELECT s.id, s.roster_name, s.user_id, s.password_hash, c.id AS class_id,
              sc.name AS school_name, sc.google_domain,
              c.academic_year, c.grade, c.class_number
       FROM classroom_students s
       JOIN classroom_classes c ON c.id = s.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE c.join_code = $1 AND s.student_number = $2`,
      [joinCode, studentNumber]
    );
    const slot = slotResult.rows[0];
    if (!slot) throw new HttpError(404, "STUDENT_NOT_FOUND", "No matching student was found in that class.");
    if (!slot.password_hash || !verifyStudentPassword(password, slot.password_hash)) {
      throw new HttpError(403, "INVALID_STUDENT_PASSWORD", "Check the class code, student number, and password.");
    }
    if (slot.google_domain !== user.google_domain) {
      throw new HttpError(403, "SCHOOL_ACCOUNT_MISMATCH", "Use the Google account issued by this school.");
    }
    if (normalizePersonName(slot.roster_name) !== normalizePersonName(user.display_name)) {
      throw new HttpError(403, "NAME_MISMATCH", "Your Google account name does not match the class roster.");
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

  router.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof HttpError) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    console.error("Classroom API error:", error);
    return res.status(500).json({ error: "INTERNAL_ERROR", message: "The server could not complete the request." });
  });

  return { router, initialize, configuration };
}

module.exports = {
  createClassroomPlatform,
  hashStudentPassword,
  normalizePersonName,
  parseTeacherEmails,
  verifyStudentPassword
};
