"use strict";

const crypto = require("crypto");
const express = require("express");
const fs = require("fs");
const path = require("path");

const MIGRATION_NAMES = ["001-reading-bank", "002-reading-reviews", "003-reading-pilots"];
const CHECKER_VERSION = "reading-bank-v1";
const SAMPLE_SEED_PATH = path.join(__dirname, "data", "reading-bank-seed-v1.json");
const DOMAINS = new Set([
  "science",
  "math_data",
  "society_economy",
  "technology_information",
  "health_life",
  "ethics_citizenship",
  "arts_language",
  "environment"
]);
const SOURCE_KINDS = new Set(["primary", "official", "systematic_review", "secondary"]);
const TOPIC_STATUSES = new Set(["draft", "active", "retired"]);
const TRACKS = new Set(["ko", "en"]);
const QUESTION_TYPES = new Set([
  "explicit",
  "main_idea",
  "title",
  "purpose",
  "inference",
  "blank",
  "order",
  "insertion",
  "implication",
  "vocabulary",
  "summary",
  "content_match",
  "data_interpretation"
]);
const REVIEW_RUBRIC_KEYS = [
  "factAccuracy",
  "selfContained",
  "uniqueAnswer",
  "answerEvidence",
  "distractorQuality",
  "levelFit",
  "naturalLanguage",
  "educationalValue",
  "safety",
  "explanationQuality"
];
const CRITICAL_REVIEW_KEYS = new Set(["factAccuracy", "selfContained", "uniqueAnswer", "safety"]);

function text(value, maxLength = 10000) {
  return String(value ?? "").normalize("NFC").trim().slice(0, maxLength);
}

function stringList(value, maxItems = 20, maxLength = 1000) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, maxItems)
    .map((item) => text(item, maxLength))
    .filter(Boolean);
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function positiveId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function expectedChoiceCount(level) {
  if (level <= 2) return 3;
  if (level <= 4) return 4;
  return 5;
}

function expectedEnglishWordRange(level) {
  return [
    [10, 25],
    [25, 45],
    [40, 70],
    [70, 100],
    [90, 130],
    [110, 150],
    [130, 170],
    [140, 190]
  ][level - 1];
}

function wordCount(source) {
  const matches = text(source, 30000).match(/[A-Za-z]+(?:['’-][A-Za-z]+)*/g);
  return matches ? matches.length : 0;
}

function normalizedChoice(value) {
  return text(value, 1000).toLocaleLowerCase().replace(/\s+/g, " ");
}

function validateTopicInput(body) {
  const topicKey = text(body?.topicKey, 64).toUpperCase();
  const title = text(body?.title, 120);
  const primaryDomain = text(body?.primaryDomain, 40);
  const coreQuestion = text(body?.coreQuestion, 1000);
  const relatedDomains = stringList(body?.relatedDomains, 8, 40);
  const coreFacts = stringList(body?.coreFacts, 12, 2000);
  const misconceptions = stringList(body?.misconceptions, 12, 2000);
  const practicalUse = text(body?.practicalUse, 4000);
  const ageScope = objectValue(body?.ageScope);
  const uncertaintyNotes = text(body?.uncertaintyNotes, 4000);
  const status = text(body?.status || "draft", 20).toLowerCase();
  const errors = [];

  if (!/^[A-Z0-9][A-Z0-9_-]{2,63}$/.test(topicKey)) errors.push("주제 키는 영문 대문자, 숫자, - 또는 _로 3~64자여야 합니다.");
  if (!title) errors.push("주제명을 입력하세요.");
  if (!DOMAINS.has(primaryDomain)) errors.push("주교과 영역이 올바르지 않습니다.");
  if (relatedDomains.some((domain) => !DOMAINS.has(domain))) errors.push("연계 교과 영역이 올바르지 않습니다.");
  if (!coreQuestion) errors.push("핵심 질문을 입력하세요.");
  if (coreFacts.length === 0) errors.push("검증된 핵심 사실을 하나 이상 입력하세요.");
  if (!TOPIC_STATUSES.has(status)) errors.push("주제 상태가 올바르지 않습니다.");

  return {
    errors,
    value: {
      topicKey,
      title,
      primaryDomain,
      relatedDomains: [...new Set(relatedDomains.filter((domain) => domain !== primaryDomain))],
      coreQuestion,
      coreFacts,
      misconceptions,
      practicalUse,
      ageScope,
      uncertaintyNotes,
      status
    }
  };
}

function validateSourceInput(body) {
  const title = text(body?.title, 300);
  const publisher = text(body?.publisher, 200);
  const sourceUrl = text(body?.sourceUrl, 2000);
  const sourceKind = text(body?.sourceKind || "secondary", 30).toLowerCase();
  const publishedOn = text(body?.publishedOn, 10) || null;
  const expiresAt = text(body?.expiresAt, 40) || null;
  const notes = text(body?.notes, 4000);
  const errors = [];
  let parsedUrl;

  try {
    parsedUrl = new URL(sourceUrl);
  } catch (_) {
    parsedUrl = null;
  }

  if (!title) errors.push("출처 제목을 입력하세요.");
  if (!publisher) errors.push("발행 기관을 입력하세요.");
  if (!parsedUrl || !["http:", "https:"].includes(parsedUrl.protocol)) errors.push("올바른 http 또는 https 출처 URL을 입력하세요.");
  if (!SOURCE_KINDS.has(sourceKind)) errors.push("출처 유형이 올바르지 않습니다.");
  if (publishedOn && !/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) errors.push("발행일은 YYYY-MM-DD 형식이어야 합니다.");
  if (expiresAt && !Number.isFinite(Date.parse(expiresAt))) errors.push("재검수일이 올바르지 않습니다.");

  return { errors, value: { title, publisher, sourceUrl, sourceKind, publishedOn, expiresAt, notes } };
}

function cleanVersionInput(body) {
  return {
    passageText: text(body?.passageText, 30000),
    promptText: text(body?.promptText, 3000),
    choices: stringList(body?.choices, 5, 1000),
    correctIndex: Number(body?.correctIndex),
    answerEvidence: text(body?.answerEvidence, 5000),
    explanation: text(body?.explanation, 8000),
    distractorReasons: Array.isArray(body?.distractorReasons)
      ? body.distractorReasons.slice(0, 5).map((item) => text(item, 3000))
      : [],
    difficultyMeta: objectValue(body?.difficultyMeta)
  };
}

function storableVersionErrors(value) {
  const errors = [];
  if (!value.passageText) errors.push("지문을 입력하세요.");
  if (!value.promptText) errors.push("발문을 입력하세요.");
  if (value.choices.length < 3 || value.choices.length > 5) errors.push("선지는 3~5개여야 합니다.");
  if (!Number.isInteger(value.correctIndex) || value.correctIndex < 0 || value.correctIndex >= value.choices.length) {
    errors.push("정답 번호가 선지 범위를 벗어났습니다.");
  }
  return errors;
}

function runAutoChecks({ track, targetLevel, ...input }) {
  const value = cleanVersionInput(input);
  const errors = [];
  const warnings = [];
  const requiredChoices = expectedChoiceCount(targetLevel);

  if (!TRACKS.has(track)) errors.push({ code: "INVALID_TRACK", message: "국어 또는 영어 트랙을 선택하세요." });
  if (!Number.isInteger(targetLevel) || targetLevel < 1 || targetLevel > 8) errors.push({ code: "INVALID_LEVEL", message: "레벨은 1~8이어야 합니다." });
  if (!value.passageText) errors.push({ code: "MISSING_PASSAGE", message: "지문을 입력하세요." });
  if (!value.promptText) errors.push({ code: "MISSING_PROMPT", message: "발문을 입력하세요." });
  if (value.choices.length !== requiredChoices) {
    errors.push({ code: "CHOICE_COUNT", message: `이 레벨은 ${requiredChoices}개의 선지가 필요합니다.` });
  }
  if (new Set(value.choices.map(normalizedChoice)).size !== value.choices.length) {
    errors.push({ code: "DUPLICATE_CHOICES", message: "의미가 같은 중복 선지가 있습니다." });
  }
  if (!Number.isInteger(value.correctIndex) || value.correctIndex < 0 || value.correctIndex >= value.choices.length) {
    errors.push({ code: "INVALID_ANSWER", message: "정답 번호가 선지 범위를 벗어났습니다." });
  }
  if (!value.answerEvidence) errors.push({ code: "MISSING_EVIDENCE", message: "정답 근거를 입력하세요." });
  if (!value.explanation) errors.push({ code: "MISSING_EXPLANATION", message: "해설을 입력하세요." });
  if (value.distractorReasons.length !== value.choices.length) {
    errors.push({ code: "DISTRACTOR_REASON_COUNT", message: "각 선지와 같은 수의 선지별 이유가 필요합니다." });
  } else {
    value.distractorReasons.forEach((reason, index) => {
      if (index !== value.correctIndex && !reason) {
        errors.push({ code: "MISSING_DISTRACTOR_REASON", message: `${index + 1}번 오답의 이유를 입력하세요.` });
      }
    });
  }

  const choiceLengths = value.choices.map((choice) => choice.length).filter((length) => length > 0).sort((a, b) => a - b);
  if (choiceLengths.length > 1 && Number.isInteger(value.correctIndex) && value.choices[value.correctIndex]) {
    const median = choiceLengths[Math.floor(choiceLengths.length / 2)];
    if (median > 0 && value.choices[value.correctIndex].length > median * 1.8) {
      warnings.push({ code: "LONG_CORRECT_CHOICE", message: "정답 선지가 다른 선지보다 지나치게 깁니다." });
    }
  }

  const metrics = {
    characterCount: value.passageText.length,
    wordCount: track === "en" ? wordCount(value.passageText) : null,
    choiceCount: value.choices.length
  };
  if (track === "en" && Number.isInteger(targetLevel) && targetLevel >= 1 && targetLevel <= 8) {
    const [minimum, maximum] = expectedEnglishWordRange(targetLevel);
    if (metrics.wordCount < minimum || metrics.wordCount > maximum) {
      warnings.push({
        code: "ENGLISH_WORD_RANGE",
        message: `E${targetLevel} 권장 분량은 ${minimum}~${maximum}단어이며 현재 ${metrics.wordCount}단어입니다.`
      });
    }
  }

  return { passed: errors.length === 0, errors, warnings, metrics, value };
}

function loadSampleSeed() {
  const seed = JSON.parse(fs.readFileSync(SAMPLE_SEED_PATH, "utf8"));
  if (seed?.schemaVersion !== 1 || !Array.isArray(seed.topics)) {
    throw new Error("Reading sample seed has an unsupported schema.");
  }
  return seed;
}

function validateReviewInput(body, choiceCount) {
  const reviewerAnswerIndex = Number(body?.reviewerAnswerIndex);
  const rubricInput = objectValue(body?.rubric);
  const rubric = {};
  const errors = [];
  for (const key of REVIEW_RUBRIC_KEYS) {
    const score = Number(rubricInput[key]);
    if (!Number.isInteger(score) || score < 0 || score > 2) {
      errors.push(`${key} 점수는 0~2여야 합니다.`);
    } else {
      rubric[key] = score;
    }
  }
  if (!Number.isInteger(reviewerAnswerIndex) || reviewerAnswerIndex < 0 || reviewerAnswerIndex >= choiceCount) {
    errors.push("검수자가 판단한 정답을 선택하세요.");
  }
  const requestedDecision = text(body?.decision, 30);
  if (!["pass", "changes_requested"].includes(requestedDecision)) {
    errors.push("검수 결정을 선택하세요.");
  }
  const comment = text(body?.comment, 5000);
  if (requestedDecision === "changes_requested" && !comment) {
    errors.push("수정 요청 사유를 입력하세요.");
  }
  const totalScore = Object.values(rubric).reduce((sum, score) => sum + score, 0);
  return { errors, value: { reviewerAnswerIndex, rubric, totalScore, requestedDecision, comment } };
}

function evaluateReview(review, correctIndex) {
  const answerMatches = review.reviewerAnswerIndex === Number(correctIndex);
  const criticalScoresPassed = [...CRITICAL_REVIEW_KEYS]
    .every((key) => review.rubric[key] === 2);
  const scorePassed = review.totalScore >= 17;
  const passCriteriaMet = review.requestedDecision === "pass"
    && answerMatches
    && criticalScoresPassed
    && scorePassed;
  return {
    answerMatches,
    criticalScoresPassed,
    scorePassed,
    passCriteriaMet,
    effectiveDecision: passCriteriaMet ? "pass" : "changes_requested"
  };
}

function createReadingBank(options = {}) {
  const pool = options.pool;
  const requireAdmin = options.requireAdmin;
  const requireUser = options.requireUser;
  const requireDatabase = options.requireDatabase;
  const HttpError = options.HttpError;
  const asyncRoute = options.asyncRoute;
  const router = express.Router();

  function fail(status, code, message, details) {
    const error = new HttpError(status, code, message);
    if (details) error.details = details;
    return error;
  }

  async function initialize() {
    if (!pool) return;
    await pool.query(`CREATE TABLE IF NOT EXISTS classroom_migrations (
      migration_name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);

    const client = await pool.connect();
    try {
      for (const migrationName of MIGRATION_NAMES) {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [migrationName]);
        const applied = await client.query(
          "SELECT 1 FROM classroom_migrations WHERE migration_name = $1",
          [migrationName]
        );
        if (applied.rowCount === 0) {
          const migrationPath = path.join(__dirname, "migrations", `${migrationName}.sql`);
          await client.query(fs.readFileSync(migrationPath, "utf8"));
          await client.query(
            "INSERT INTO classroom_migrations (migration_name) VALUES ($1)",
            [migrationName]
          );
        }
        await client.query("COMMIT");
      }
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async function admin(req) {
    requireDatabase();
    return requireAdmin(req);
  }

  async function accessFor(req, requirePermission = false) {
    requireDatabase();
    const user = await requireUser(req);
    if (user.role === "admin") {
      return { user, canEdit: true, canReview: true, canPublish: true, isAdmin: true };
    }
    const result = await pool.query(
      `SELECT can_edit, can_review, can_publish
       FROM reading_reviewer_permissions WHERE user_id = $1`,
      [user.id]
    );
    const row = result.rows[0] || {};
    const access = {
      user,
      canEdit: row.can_edit === true,
      canReview: row.can_review === true,
      canPublish: row.can_publish === true,
      isAdmin: false
    };
    if (requirePermission && !access.canEdit && !access.canReview && !access.canPublish) {
      throw fail(403, "READING_ACCESS_REQUIRED", "독해 문제은행 권한이 없습니다.");
    }
    return access;
  }

  async function reader(req) {
    return accessFor(req, true);
  }

  async function editor(req) {
    const access = await accessFor(req, true);
    if (!access.canEdit) throw fail(403, "READING_EDITOR_REQUIRED", "문항 편집 권한이 필요합니다.");
    return access.user;
  }

  async function reviewer(req) {
    const access = await accessFor(req, true);
    if (!access.canReview) throw fail(403, "READING_REVIEWER_REQUIRED", "문항 검수 권한이 필요합니다.");
    if (access.canEdit) {
      throw fail(409, "INDEPENDENT_REVIEW_REQUIRED", "정답을 볼 수 있는 출제 계정은 독립 검수에 참여할 수 없습니다.");
    }
    return access.user;
  }

  async function student(req) {
    requireDatabase();
    const user = await requireUser(req);
    if (user.role !== "student") {
      throw fail(403, "STUDENT_REQUIRED", "학급에 연결된 학생 계정이 필요합니다.");
    }
    const result = await pool.query(
      `SELECT s.class_id, s.student_number, s.roster_name,
              c.grade, c.class_number, sc.name AS school_name
       FROM classroom_students s
       JOIN classroom_classes c ON c.id = s.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE s.user_id = $1
       ORDER BY c.updated_at DESC LIMIT 1`,
      [user.id]
    );
    const membership = result.rows[0];
    if (!membership) {
      throw fail(403, "STUDENT_MEMBERSHIP_REQUIRED", "먼저 학급 코드와 학생 번호를 연결해 주세요.");
    }
    return { user, membership };
  }

  async function classForEditor(user, classId, client = pool) {
    const result = await client.query(
      `SELECT c.id, c.academic_year, c.grade, c.class_number, c.teacher_user_id,
              c.teacher_name, sc.name AS school_name,
              COUNT(s.id)::INTEGER AS roster_count
       FROM classroom_classes c
       JOIN classroom_schools sc ON sc.id = c.school_id
       LEFT JOIN classroom_students s ON s.class_id = c.id
       WHERE c.id = $1 AND ($2 = 'admin' OR c.teacher_user_id = $3)
       GROUP BY c.id, sc.name`,
      [classId, user.role, user.id]
    );
    return result.rows[0] || null;
  }

  async function pilotForEditor(user, pilotId, client = pool, lock = false) {
    const result = await client.query(
      `SELECT p.*, c.academic_year, c.grade, c.class_number, c.teacher_user_id,
              c.teacher_name, sc.name AS school_name
       FROM reading_pilots p
       JOIN classroom_classes c ON c.id = p.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       WHERE p.id = $1 AND ($2 = 'admin' OR c.teacher_user_id = $3)
       ${lock ? "FOR UPDATE" : ""}`,
      [pilotId, user.role, user.id]
    );
    return result.rows[0] || null;
  }

  async function audit(client, actorId, entityType, entityId, action, previousState, nextState) {
    await client.query(
      `INSERT INTO reading_audit_events
        (actor_user_id, entity_type, entity_id, action, previous_state, next_state)
       VALUES ($1, $2, $3, $4, $5::JSONB, $6::JSONB)`,
      [actorId, entityType, entityId, action, JSON.stringify(previousState ?? null), JSON.stringify(nextState ?? null)]
    );
  }

  function topicResponse(row) {
    return {
      id: Number(row.id),
      topicKey: row.topic_key,
      title: row.title_ko,
      primaryDomain: row.primary_domain,
      relatedDomains: row.related_domains || [],
      coreQuestion: row.core_question,
      coreFacts: row.core_facts || [],
      misconceptions: row.misconceptions || [],
      practicalUse: row.practical_use,
      ageScope: row.age_scope || {},
      uncertaintyNotes: row.uncertainty_notes,
      status: row.status,
      sourceCount: Number(row.source_count || 0),
      itemCount: Number(row.item_count || 0),
      updatedAt: row.updated_at
    };
  }

  function versionResponse(row, options = {}) {
    const redactAnswers = options.redactAnswers === true;
    const choices = row.choices || [];
    return {
      id: Number(row.id),
      itemId: Number(row.item_id),
      versionNo: Number(row.version_no),
      passageText: row.passage_text,
      promptText: row.prompt_text,
      choices,
      correctIndex: redactAnswers ? null : Number(row.correct_index),
      answerEvidence: redactAnswers ? "" : row.answer_evidence,
      explanation: redactAnswers ? "" : row.explanation,
      distractorReasons: redactAnswers ? choices.map(() => "") : (row.distractor_reasons || []),
      difficultyMeta: row.difficulty_meta || {},
      status: row.status,
      updatedAt: row.updated_at
    };
  }

  async function fetchItem(itemId) {
    const result = await pool.query(
      `SELECT i.*, t.topic_key, t.title_ko AS topic_title
       FROM reading_items i
       JOIN reading_topics t ON t.id = i.topic_id
       WHERE i.id = $1`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  router.get("/access", asyncRoute(async (req, res) => {
    const access = await accessFor(req, false);
    res.json({
      allowed: access.canEdit || access.canReview || access.canPublish,
      canEdit: access.canEdit,
      canReview: access.canReview,
      canPublish: access.canPublish,
      isAdmin: access.isAdmin,
      user: {
        id: Number(access.user.id),
        email: access.user.email,
        name: access.user.display_name,
        role: access.user.role || null
      }
    });
  }));

  router.get("/admin/summary", asyncRoute(async (req, res) => {
    await reader(req);
    const [statusResult, expiryResult] = await Promise.all([
      pool.query(`WITH latest AS (
          SELECT DISTINCT ON (item_id) item_id, status
          FROM reading_item_versions
          ORDER BY item_id, version_no DESC
        )
        SELECT COUNT(*) FILTER (WHERE status = 'draft') AS draft_count,
               COUNT(*) FILTER (WHERE status = 'auto_checked') AS checked_count,
               COUNT(*) FILTER (WHERE status = 'review_pending') AS review_count,
               COUNT(*) FILTER (WHERE status = 'published') AS published_count
        FROM latest`),
      pool.query(`SELECT COUNT(*) AS expired_count
                  FROM reading_sources
                  WHERE expires_at IS NOT NULL AND expires_at <= NOW()`)
    ]);
    const counts = statusResult.rows[0] || {};
    res.json({
      draft: Number(counts.draft_count || 0),
      autoChecked: Number(counts.checked_count || 0),
      reviewPending: Number(counts.review_count || 0),
      published: Number(counts.published_count || 0),
      expiredSources: Number(expiryResult.rows[0]?.expired_count || 0)
    });
  }));

  router.get("/admin/reviewers", asyncRoute(async (req, res) => {
    await admin(req);
    const result = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.role,
              COALESCE(p.can_edit, FALSE) AS can_edit,
              COALESCE(p.can_review, FALSE) AS can_review,
              COALESCE(p.can_publish, FALSE) AS can_publish,
              p.updated_at
       FROM classroom_users u
       LEFT JOIN reading_reviewer_permissions p ON p.user_id = u.id
       WHERE u.role IN ('admin', 'teacher') OR p.user_id IS NOT NULL
       ORDER BY CASE u.role WHEN 'admin' THEN 0 ELSE 1 END, LOWER(u.email)`
    );
    res.json({ reviewers: result.rows.map((row) => ({
      userId: Number(row.id), email: row.email, name: row.display_name,
      role: row.role, canEdit: row.role === "admin" || row.can_edit,
      canReview: row.role === "admin" || row.can_review,
      canPublish: row.role === "admin" || row.can_publish,
      isAdmin: row.role === "admin", updatedAt: row.updated_at
    })) });
  }));

  router.put("/admin/reviewers/:userId", asyncRoute(async (req, res) => {
    const currentAdmin = await admin(req);
    const userId = positiveId(req.params.userId);
    if (!userId) throw fail(400, "INVALID_USER_ID", "사용자 번호가 올바르지 않습니다.");
    const userResult = await pool.query(
      "SELECT id, email, display_name, role FROM classroom_users WHERE id = $1",
      [userId]
    );
    const target = userResult.rows[0];
    if (!target) throw fail(404, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다.");
    if (target.role === "admin") throw fail(409, "ADMIN_PERMISSIONS_FIXED", "관리자는 항상 모든 문제은행 권한을 가집니다.");
    if (target.role !== "teacher") throw fail(400, "TEACHER_REQUIRED", "교사 계정에만 콘텐츠 권한을 부여할 수 있습니다.");
    const permissions = {
      canEdit: req.body?.canEdit === true,
      canReview: req.body?.canReview === true,
      canPublish: req.body?.canPublish === true
    };
    if (permissions.canEdit && permissions.canReview) {
      throw fail(400, "SEPARATE_REVIEW_ROLE_REQUIRED", "독립 검수를 위해 한 계정에 출제와 검수 권한을 함께 줄 수 없습니다.");
    }
    const before = await pool.query("SELECT * FROM reading_reviewer_permissions WHERE user_id = $1", [userId]);
    const result = await pool.query(
      `INSERT INTO reading_reviewer_permissions
        (user_id, can_edit, can_review, can_publish, granted_by, granted_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         can_edit = EXCLUDED.can_edit,
         can_review = EXCLUDED.can_review,
         can_publish = EXCLUDED.can_publish,
         granted_by = EXCLUDED.granted_by,
         updated_at = NOW()
       RETURNING *`,
      [userId, permissions.canEdit, permissions.canReview, permissions.canPublish, currentAdmin.id]
    );
    await audit(pool, currentAdmin.id, "reviewer_permission", userId, "update", before.rows[0] || null, result.rows[0]);
    res.json({
      reviewer: {
        userId, email: target.email, name: target.display_name, role: target.role,
        ...permissions, isAdmin: false, updatedAt: result.rows[0].updated_at
      }
    });
  }));

  router.post("/admin/sample-import", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const seed = loadSampleSeed();
    const counts = {
      topicsCreated: 0,
      sourcesCreated: 0,
      itemsCreated: 0,
      itemsSkipped: 0
    };
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      for (const topicInput of seed.topics) {
        const parsedTopic = validateTopicInput(topicInput);
        if (parsedTopic.errors.length) {
          throw fail(500, "INVALID_SAMPLE_TOPIC", parsedTopic.errors[0], parsedTopic.errors);
        }
        const topic = parsedTopic.value;
        const insertedTopic = await client.query(
          `INSERT INTO reading_topics
            (topic_key, title_ko, primary_domain, related_domains, core_question,
             core_facts, misconceptions, practical_use, age_scope, uncertainty_notes,
             status, created_by, updated_by)
           VALUES ($1, $2, $3, $4::TEXT[], $5, $6::JSONB, $7::JSONB, $8,
                   $9::JSONB, $10, $11, $12, $12)
           ON CONFLICT (topic_key) DO NOTHING
           RETURNING *`,
          [
            topic.topicKey, topic.title, topic.primaryDomain, topic.relatedDomains,
            topic.coreQuestion, JSON.stringify(topic.coreFacts), JSON.stringify(topic.misconceptions),
            topic.practicalUse, JSON.stringify(topic.ageScope), topic.uncertaintyNotes,
            topic.status, currentAdmin.id
          ]
        );
        let topicRow = insertedTopic.rows[0];
        if (topicRow) {
          counts.topicsCreated += 1;
          await audit(client, currentAdmin.id, "topic", topicRow.id, "sample_import", null, topicRow);
        } else {
          const existingTopic = await client.query("SELECT * FROM reading_topics WHERE topic_key = $1", [topic.topicKey]);
          topicRow = existingTopic.rows[0];
        }

        for (const sourceInput of topicInput.sources || []) {
          const parsedSource = validateSourceInput(sourceInput);
          if (parsedSource.errors.length) {
            throw fail(500, "INVALID_SAMPLE_SOURCE", parsedSource.errors[0], parsedSource.errors);
          }
          const source = parsedSource.value;
          const sourceResult = await client.query(
            `INSERT INTO reading_sources
              (topic_id, title, publisher, source_url, source_kind, published_on,
               verified_at, expires_at, notes, created_by)
             VALUES ($1, $2, $3, $4, $5, $6::DATE, NOW(), $7::TIMESTAMPTZ, $8, $9)
             ON CONFLICT (topic_id, source_url) DO NOTHING
             RETURNING *`,
            [topicRow.id, source.title, source.publisher, source.sourceUrl, source.sourceKind,
              source.publishedOn, source.expiresAt, source.notes, currentAdmin.id]
          );
          if (sourceResult.rows[0]) {
            counts.sourcesCreated += 1;
            await audit(client, currentAdmin.id, "source", sourceResult.rows[0].id, "sample_import", null, sourceResult.rows[0]);
          }
        }

        for (const itemInput of topicInput.items || []) {
          if (!TRACKS.has(itemInput.track) || !QUESTION_TYPES.has(itemInput.questionType)) {
            throw fail(500, "INVALID_SAMPLE_ITEM", `${itemInput.itemKey}의 문항 정보가 올바르지 않습니다.`);
          }
          const checked = runAutoChecks(itemInput);
          const storageErrors = storableVersionErrors(checked.value);
          if (!checked.passed || storageErrors.length) {
            const messages = [...checked.errors.map((error) => error.message), ...storageErrors];
            throw fail(500, "INVALID_SAMPLE_ITEM", `${itemInput.itemKey}: ${messages[0]}`, messages);
          }
          const insertedItem = await client.query(
            `INSERT INTO reading_items
              (item_key, topic_id, track, target_level, question_type, created_by)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (item_key) DO NOTHING
             RETURNING *`,
            [itemInput.itemKey, topicRow.id, itemInput.track, itemInput.targetLevel,
              itemInput.questionType, currentAdmin.id]
          );
          const itemRow = insertedItem.rows[0];
          if (!itemRow) {
            counts.itemsSkipped += 1;
            continue;
          }
          const value = checked.value;
          await client.query(
            `INSERT INTO reading_item_versions
              (item_id, version_no, passage_text, prompt_text, choices, correct_index,
               answer_evidence, explanation, distractor_reasons, difficulty_meta, status, created_by)
             VALUES ($1, 1, $2, $3, $4::JSONB, $5, $6, $7, $8::JSONB, $9::JSONB, 'draft', $10)`,
            [itemRow.id, value.passageText, value.promptText, JSON.stringify(value.choices),
              value.correctIndex, value.answerEvidence, value.explanation,
              JSON.stringify(value.distractorReasons), JSON.stringify(value.difficultyMeta), currentAdmin.id]
          );
          counts.itemsCreated += 1;
          await audit(client, currentAdmin.id, "item", itemRow.id, "sample_import", null, itemRow);
        }
      }
      await client.query("COMMIT");
      res.json({ ok: true, ...counts, totalSampleItems: 32 });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.get("/admin/topics", asyncRoute(async (req, res) => {
    await reader(req);
    const query = text(req.query.q, 100);
    const domain = text(req.query.domain, 40);
    const status = text(req.query.status, 20);
    const values = [];
    const conditions = [];
    if (query) {
      values.push(`%${query}%`);
      conditions.push(`(t.title_ko ILIKE $${values.length} OR t.topic_key ILIKE $${values.length})`);
    }
    if (domain && DOMAINS.has(domain)) {
      values.push(domain);
      conditions.push(`t.primary_domain = $${values.length}`);
    }
    if (status && TOPIC_STATUSES.has(status)) {
      values.push(status);
      conditions.push(`t.status = $${values.length}`);
    }
    const result = await pool.query(
      `SELECT t.*,
              COUNT(DISTINCT s.id) AS source_count,
              COUNT(DISTINCT i.id) AS item_count
       FROM reading_topics t
       LEFT JOIN reading_sources s ON s.topic_id = t.id
       LEFT JOIN reading_items i ON i.topic_id = t.id
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       GROUP BY t.id
       ORDER BY t.updated_at DESC
       LIMIT 200`,
      values
    );
    res.json({ topics: result.rows.map(topicResponse) });
  }));

  router.post("/admin/topics", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const parsed = validateTopicInput(req.body);
    if (parsed.errors.length) throw fail(400, "INVALID_TOPIC", parsed.errors[0], parsed.errors);
    const value = parsed.value;
    try {
      const result = await pool.query(
        `INSERT INTO reading_topics
          (topic_key, title_ko, primary_domain, related_domains, core_question,
           core_facts, misconceptions, practical_use, age_scope, uncertainty_notes,
           status, created_by, updated_by)
         VALUES ($1, $2, $3, $4::TEXT[], $5, $6::JSONB, $7::JSONB, $8,
                 $9::JSONB, $10, $11, $12, $12)
         RETURNING *`,
        [
          value.topicKey, value.title, value.primaryDomain, value.relatedDomains,
          value.coreQuestion, JSON.stringify(value.coreFacts), JSON.stringify(value.misconceptions),
          value.practicalUse, JSON.stringify(value.ageScope), value.uncertaintyNotes,
          value.status, currentAdmin.id
        ]
      );
      await audit(pool, currentAdmin.id, "topic", result.rows[0].id, "create", null, result.rows[0]);
      res.status(201).json({ topic: topicResponse(result.rows[0]) });
    } catch (error) {
      if (error.code === "23505") throw fail(409, "DUPLICATE_TOPIC_KEY", "이미 사용 중인 주제 키입니다.");
      throw error;
    }
  }));

  router.get("/admin/topics/:topicId", asyncRoute(async (req, res) => {
    await reader(req);
    const topicId = positiveId(req.params.topicId);
    if (!topicId) throw fail(400, "INVALID_TOPIC_ID", "주제 번호가 올바르지 않습니다.");
    const [topicResult, sourceResult, itemResult] = await Promise.all([
      pool.query(`SELECT t.*,
                    (SELECT COUNT(*) FROM reading_sources s WHERE s.topic_id = t.id) AS source_count,
                    (SELECT COUNT(*) FROM reading_items i WHERE i.topic_id = t.id) AS item_count
                  FROM reading_topics t WHERE t.id = $1`, [topicId]),
      pool.query(`SELECT * FROM reading_sources WHERE topic_id = $1 ORDER BY created_at DESC`, [topicId]),
      pool.query(`SELECT i.*, v.id AS version_id, v.version_no, v.status AS version_status
                  FROM reading_items i
                  LEFT JOIN LATERAL (
                    SELECT id, version_no, status FROM reading_item_versions
                    WHERE item_id = i.id ORDER BY version_no DESC LIMIT 1
                  ) v ON TRUE
                  WHERE i.topic_id = $1
                  ORDER BY i.track, i.target_level, i.created_at`, [topicId])
    ]);
    if (!topicResult.rows[0]) throw fail(404, "TOPIC_NOT_FOUND", "주제를 찾을 수 없습니다.");
    res.json({
      topic: topicResponse(topicResult.rows[0]),
      sources: sourceResult.rows.map((row) => ({
        id: Number(row.id), title: row.title, publisher: row.publisher,
        sourceUrl: row.source_url, sourceKind: row.source_kind,
        publishedOn: row.published_on, verifiedAt: row.verified_at,
        expiresAt: row.expires_at, notes: row.notes
      })),
      items: itemResult.rows.map((row) => ({
        id: Number(row.id), itemKey: row.item_key, track: row.track,
        targetLevel: Number(row.target_level), questionType: row.question_type,
        versionId: row.version_id ? Number(row.version_id) : null,
        versionNo: row.version_no ? Number(row.version_no) : null,
        status: row.version_status || null
      }))
    });
  }));

  router.put("/admin/topics/:topicId", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const topicId = positiveId(req.params.topicId);
    if (!topicId) throw fail(400, "INVALID_TOPIC_ID", "주제 번호가 올바르지 않습니다.");
    const parsed = validateTopicInput(req.body);
    if (parsed.errors.length) throw fail(400, "INVALID_TOPIC", parsed.errors[0], parsed.errors);
    const before = await pool.query("SELECT * FROM reading_topics WHERE id = $1", [topicId]);
    if (!before.rows[0]) throw fail(404, "TOPIC_NOT_FOUND", "주제를 찾을 수 없습니다.");
    const value = parsed.value;
    try {
      const result = await pool.query(
        `UPDATE reading_topics SET
           topic_key = $1, title_ko = $2, primary_domain = $3, related_domains = $4::TEXT[],
           core_question = $5, core_facts = $6::JSONB, misconceptions = $7::JSONB,
           practical_use = $8, age_scope = $9::JSONB, uncertainty_notes = $10,
           status = $11, updated_by = $12, updated_at = NOW()
         WHERE id = $13 RETURNING *`,
        [
          value.topicKey, value.title, value.primaryDomain, value.relatedDomains,
          value.coreQuestion, JSON.stringify(value.coreFacts), JSON.stringify(value.misconceptions),
          value.practicalUse, JSON.stringify(value.ageScope), value.uncertaintyNotes,
          value.status, currentAdmin.id, topicId
        ]
      );
      await audit(pool, currentAdmin.id, "topic", topicId, "update", before.rows[0], result.rows[0]);
      res.json({ topic: topicResponse(result.rows[0]) });
    } catch (error) {
      if (error.code === "23505") throw fail(409, "DUPLICATE_TOPIC_KEY", "이미 사용 중인 주제 키입니다.");
      throw error;
    }
  }));

  router.post("/admin/topics/:topicId/sources", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const topicId = positiveId(req.params.topicId);
    if (!topicId) throw fail(400, "INVALID_TOPIC_ID", "주제 번호가 올바르지 않습니다.");
    const parsed = validateSourceInput(req.body);
    if (parsed.errors.length) throw fail(400, "INVALID_SOURCE", parsed.errors[0], parsed.errors);
    const value = parsed.value;
    try {
      const result = await pool.query(
        `INSERT INTO reading_sources
          (topic_id, title, publisher, source_url, source_kind, published_on,
           verified_at, expires_at, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6::DATE, NOW(), $7::TIMESTAMPTZ, $8, $9)
         RETURNING *`,
        [topicId, value.title, value.publisher, value.sourceUrl, value.sourceKind,
          value.publishedOn, value.expiresAt, value.notes, currentAdmin.id]
      );
      await audit(pool, currentAdmin.id, "source", result.rows[0].id, "create", null, result.rows[0]);
      res.status(201).json({ source: result.rows[0] });
    } catch (error) {
      if (error.code === "23503") throw fail(404, "TOPIC_NOT_FOUND", "주제를 찾을 수 없습니다.");
      if (error.code === "23505") throw fail(409, "DUPLICATE_SOURCE", "이 주제에 이미 등록된 출처입니다.");
      throw error;
    }
  }));

  router.put("/admin/sources/:sourceId", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const sourceId = positiveId(req.params.sourceId);
    if (!sourceId) throw fail(400, "INVALID_SOURCE_ID", "출처 번호가 올바르지 않습니다.");
    const parsed = validateSourceInput(req.body);
    if (parsed.errors.length) throw fail(400, "INVALID_SOURCE", parsed.errors[0], parsed.errors);
    const before = await pool.query("SELECT * FROM reading_sources WHERE id = $1", [sourceId]);
    if (!before.rows[0]) throw fail(404, "SOURCE_NOT_FOUND", "출처를 찾을 수 없습니다.");
    const value = parsed.value;
    const result = await pool.query(
      `UPDATE reading_sources SET title = $1, publisher = $2, source_url = $3,
         source_kind = $4, published_on = $5::DATE, verified_at = NOW(),
         expires_at = $6::TIMESTAMPTZ, notes = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [value.title, value.publisher, value.sourceUrl, value.sourceKind,
        value.publishedOn, value.expiresAt, value.notes, sourceId]
    );
    await audit(pool, currentAdmin.id, "source", sourceId, "update", before.rows[0], result.rows[0]);
    res.json({ source: result.rows[0] });
  }));

  router.get("/admin/items", asyncRoute(async (req, res) => {
    await reader(req);
    const values = [];
    const conditions = [];
    const query = text(req.query.q, 100);
    const track = text(req.query.track, 2);
    const level = Number(req.query.level);
    const topicId = positiveId(req.query.topicId);
    const status = text(req.query.status, 30);
    if (query) {
      values.push(`%${query}%`);
      conditions.push(`(i.item_key ILIKE $${values.length} OR t.title_ko ILIKE $${values.length})`);
    }
    if (TRACKS.has(track)) { values.push(track); conditions.push(`i.track = $${values.length}`); }
    if (Number.isInteger(level) && level >= 1 && level <= 8) { values.push(level); conditions.push(`i.target_level = $${values.length}`); }
    if (topicId) { values.push(topicId); conditions.push(`i.topic_id = $${values.length}`); }
    if (status) { values.push(status); conditions.push(`v.status = $${values.length}`); }
    const result = await pool.query(
      `SELECT i.*, t.topic_key, t.title_ko AS topic_title,
              v.id AS version_id, v.version_no, v.status AS version_status,
              v.prompt_text, v.updated_at AS version_updated_at
       FROM reading_items i
       JOIN reading_topics t ON t.id = i.topic_id
       LEFT JOIN LATERAL (
         SELECT * FROM reading_item_versions
         WHERE item_id = i.id ORDER BY version_no DESC LIMIT 1
       ) v ON TRUE
       ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
       ORDER BY COALESCE(v.updated_at, i.updated_at) DESC
       LIMIT 300`,
      values
    );
    res.json({ items: result.rows.map((row) => ({
      id: Number(row.id), itemKey: row.item_key, topicId: Number(row.topic_id),
      topicKey: row.topic_key, topicTitle: row.topic_title, track: row.track,
      targetLevel: Number(row.target_level), questionType: row.question_type,
      versionId: row.version_id ? Number(row.version_id) : null,
      versionNo: row.version_no ? Number(row.version_no) : null,
      status: row.version_status || null, promptText: row.prompt_text || "",
      updatedAt: row.version_updated_at || row.updated_at
    })) });
  }));

  router.post("/admin/items", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const topicId = positiveId(req.body?.topicId);
    const track = text(req.body?.track, 2).toLowerCase();
    const targetLevel = Number(req.body?.targetLevel);
    const questionType = text(req.body?.questionType, 40);
    if (!topicId) throw fail(400, "INVALID_TOPIC_ID", "주제를 선택하세요.");
    if (!TRACKS.has(track)) throw fail(400, "INVALID_TRACK", "국어 또는 영어를 선택하세요.");
    if (!Number.isInteger(targetLevel) || targetLevel < 1 || targetLevel > 8) throw fail(400, "INVALID_LEVEL", "레벨은 1~8이어야 합니다.");
    if (!QUESTION_TYPES.has(questionType)) throw fail(400, "INVALID_QUESTION_TYPE", "문항 유형이 올바르지 않습니다.");
    const checked = runAutoChecks({ track, targetLevel, ...req.body });
    const value = checked.value;
    const storageErrors = storableVersionErrors(value);
    if (storageErrors.length) throw fail(400, "INVALID_ITEM_DRAFT", storageErrors[0], storageErrors);
    const topicResult = await pool.query("SELECT topic_key FROM reading_topics WHERE id = $1", [topicId]);
    if (!topicResult.rows[0]) throw fail(404, "TOPIC_NOT_FOUND", "주제를 찾을 수 없습니다.");
    const requestedKey = text(req.body?.itemKey, 100).toUpperCase();
    const itemKey = requestedKey || `${topicResult.rows[0].topic_key}-${track.toUpperCase()}${targetLevel}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    if (!/^[A-Z0-9][A-Z0-9_-]{2,99}$/.test(itemKey)) throw fail(400, "INVALID_ITEM_KEY", "문항 키 형식이 올바르지 않습니다.");

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const itemResult = await client.query(
        `INSERT INTO reading_items
          (item_key, topic_id, track, target_level, question_type, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [itemKey, topicId, track, targetLevel, questionType, currentAdmin.id]
      );
      const item = itemResult.rows[0];
      const versionResult = await client.query(
        `INSERT INTO reading_item_versions
          (item_id, version_no, passage_text, prompt_text, choices, correct_index,
           answer_evidence, explanation, distractor_reasons, difficulty_meta, status, created_by)
         VALUES ($1, 1, $2, $3, $4::JSONB, $5, $6, $7, $8::JSONB, $9::JSONB, 'draft', $10)
         RETURNING *`,
        [item.id, value.passageText, value.promptText, JSON.stringify(value.choices),
          value.correctIndex, value.answerEvidence, value.explanation,
          JSON.stringify(value.distractorReasons), JSON.stringify(value.difficultyMeta), currentAdmin.id]
      );
      await audit(client, currentAdmin.id, "item", item.id, "create", null, item);
      await client.query("COMMIT");
      res.status(201).json({
        item: {
          id: Number(item.id), itemKey: item.item_key, topicId: Number(item.topic_id),
          track: item.track, targetLevel: Number(item.target_level), questionType: item.question_type
        },
        version: versionResponse(versionResult.rows[0]),
        precheck: { passed: checked.passed, errors: checked.errors, warnings: checked.warnings, metrics: checked.metrics }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw fail(409, "DUPLICATE_ITEM_KEY", "이미 사용 중인 문항 키입니다.");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.get("/admin/items/:itemId", asyncRoute(async (req, res) => {
    const access = await reader(req);
    const itemId = positiveId(req.params.itemId);
    if (!itemId) throw fail(400, "INVALID_ITEM_ID", "문항 번호가 올바르지 않습니다.");
    const item = await fetchItem(itemId);
    if (!item) throw fail(404, "ITEM_NOT_FOUND", "문항을 찾을 수 없습니다.");
    const [versionResult, checkResult, reviewResult] = await Promise.all([
      pool.query("SELECT * FROM reading_item_versions WHERE item_id = $1 ORDER BY version_no DESC", [itemId]),
      pool.query(`SELECT c.* FROM reading_auto_checks c
                  JOIN reading_item_versions v ON v.id = c.version_id
                  WHERE v.item_id = $1 ORDER BY c.created_at DESC`, [itemId]),
      pool.query(`SELECT r.* FROM reading_reviews r
                  JOIN reading_item_versions v ON v.id = r.version_id
                  WHERE v.item_id = $1 ORDER BY r.created_at`, [itemId])
    ]);
    const reviewCounts = new Map();
    for (const row of reviewResult.rows) {
      const versionId = Number(row.version_id);
      const counts = reviewCounts.get(versionId) || { pass: 0, changesRequested: 0 };
      if (row.decision === "pass") counts.pass += 1;
      else counts.changesRequested += 1;
      reviewCounts.set(versionId, counts);
    }
    res.json({
      access: {
        canEdit: access.canEdit,
        canReview: access.canReview,
        canPublish: access.canPublish,
        isAdmin: access.isAdmin
      },
      item: {
        id: Number(item.id), itemKey: item.item_key, topicId: Number(item.topic_id),
        topicKey: item.topic_key, topicTitle: item.topic_title, track: item.track,
        targetLevel: Number(item.target_level), questionType: item.question_type,
        currentPublishedVersionId: item.current_published_version_id ? Number(item.current_published_version_id) : null
      },
      versions: versionResult.rows.map((row) => ({
        ...versionResponse(row, { redactAnswers: !access.canEdit }),
        isOwnVersion: String(row.created_by) === String(access.user.id)
      })),
      checks: checkResult.rows.map((row) => ({
        id: Number(row.id), versionId: Number(row.version_id), checkerVersion: row.checker_version,
        passed: row.passed, results: row.results, createdAt: row.created_at
      })),
      reviewCounts: [...reviewCounts.entries()].map(([versionId, counts]) => ({ versionId, ...counts })),
      myReviews: reviewResult.rows
        .filter((row) => String(row.reviewer_user_id) === String(access.user.id))
        .map((row) => ({
          id: Number(row.id), versionId: Number(row.version_id),
          reviewerAnswerIndex: Number(row.reviewer_answer_index), rubric: row.rubric,
          totalScore: Number(row.total_score), decision: row.decision,
          comment: row.comment, createdAt: row.created_at
        })),
      reviewFeedback: access.canEdit
        ? reviewResult.rows.map((row) => ({
            versionId: Number(row.version_id), rubric: row.rubric,
            totalScore: Number(row.total_score), decision: row.decision,
            comment: row.comment, createdAt: row.created_at
          }))
        : []
    });
  }));

  router.post("/admin/items/:itemId/versions", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const itemId = positiveId(req.params.itemId);
    if (!itemId) throw fail(400, "INVALID_ITEM_ID", "문항 번호가 올바르지 않습니다.");
    const baseVersionId = positiveId(req.body?.baseVersionId);
    const baseResult = await pool.query(
      `SELECT * FROM reading_item_versions
       WHERE item_id = $1 ${baseVersionId ? "AND id = $2" : ""}
       ORDER BY version_no DESC LIMIT 1`,
      baseVersionId ? [itemId, baseVersionId] : [itemId]
    );
    const base = baseResult.rows[0];
    if (!base) throw fail(404, "VERSION_NOT_FOUND", "복제할 버전을 찾을 수 없습니다.");
    const nextResult = await pool.query("SELECT COALESCE(MAX(version_no), 0) + 1 AS next_no FROM reading_item_versions WHERE item_id = $1", [itemId]);
    const versionResult = await pool.query(
      `INSERT INTO reading_item_versions
        (item_id, version_no, passage_text, prompt_text, choices, correct_index,
         answer_evidence, explanation, distractor_reasons, difficulty_meta, status, created_by)
       VALUES ($1, $2, $3, $4, $5::JSONB, $6, $7, $8, $9::JSONB, $10::JSONB, 'draft', $11)
       RETURNING *`,
      [itemId, Number(nextResult.rows[0].next_no), base.passage_text, base.prompt_text,
        JSON.stringify(base.choices), base.correct_index, base.answer_evidence, base.explanation,
        JSON.stringify(base.distractor_reasons), JSON.stringify(base.difficulty_meta), currentAdmin.id]
    );
    await audit(pool, currentAdmin.id, "version", versionResult.rows[0].id, "clone", base, versionResult.rows[0]);
    res.status(201).json({ version: versionResponse(versionResult.rows[0]) });
  }));

  router.put("/admin/versions/:versionId", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const versionId = positiveId(req.params.versionId);
    if (!versionId) throw fail(400, "INVALID_VERSION_ID", "버전 번호가 올바르지 않습니다.");
    const beforeResult = await pool.query(
      `SELECT v.*, i.track, i.target_level
       FROM reading_item_versions v JOIN reading_items i ON i.id = v.item_id
       WHERE v.id = $1`, [versionId]
    );
    const before = beforeResult.rows[0];
    if (!before) throw fail(404, "VERSION_NOT_FOUND", "버전을 찾을 수 없습니다.");
    if (before.status !== "draft") throw fail(409, "IMMUTABLE_VERSION", "초안 상태의 버전만 수정할 수 있습니다. 새 버전을 만드세요.");
    const checked = runAutoChecks({ track: before.track, targetLevel: Number(before.target_level), ...req.body });
    const value = checked.value;
    const storageErrors = storableVersionErrors(value);
    if (storageErrors.length) throw fail(400, "INVALID_ITEM_DRAFT", storageErrors[0], storageErrors);
    const result = await pool.query(
      `UPDATE reading_item_versions SET
         passage_text = $1, prompt_text = $2, choices = $3::JSONB, correct_index = $4,
         answer_evidence = $5, explanation = $6, distractor_reasons = $7::JSONB,
         difficulty_meta = $8::JSONB, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [value.passageText, value.promptText, JSON.stringify(value.choices), value.correctIndex,
        value.answerEvidence, value.explanation, JSON.stringify(value.distractorReasons),
        JSON.stringify(value.difficultyMeta), versionId]
    );
    await audit(pool, currentAdmin.id, "version", versionId, "update", before, result.rows[0]);
    res.json({
      version: versionResponse(result.rows[0]),
      precheck: { passed: checked.passed, errors: checked.errors, warnings: checked.warnings, metrics: checked.metrics }
    });
  }));

  router.post("/admin/versions/:versionId/check", asyncRoute(async (req, res) => {
    const currentAdmin = await editor(req);
    const versionId = positiveId(req.params.versionId);
    if (!versionId) throw fail(400, "INVALID_VERSION_ID", "버전 번호가 올바르지 않습니다.");
    const sourceResult = await pool.query(
      `SELECT v.*, i.track, i.target_level
       FROM reading_item_versions v JOIN reading_items i ON i.id = v.item_id
       WHERE v.id = $1`, [versionId]
    );
    const source = sourceResult.rows[0];
    if (!source) throw fail(404, "VERSION_NOT_FOUND", "버전을 찾을 수 없습니다.");
    if (source.status !== "draft" && source.status !== "auto_checked") {
      throw fail(409, "CHECK_NOT_ALLOWED", "초안 또는 자동검사 완료 상태에서만 검사할 수 있습니다.");
    }
    const checked = runAutoChecks({
      track: source.track,
      targetLevel: Number(source.target_level),
      passageText: source.passage_text,
      promptText: source.prompt_text,
      choices: source.choices,
      correctIndex: Number(source.correct_index),
      answerEvidence: source.answer_evidence,
      explanation: source.explanation,
      distractorReasons: source.distractor_reasons,
      difficultyMeta: source.difficulty_meta
    });
    const results = { errors: checked.errors, warnings: checked.warnings, metrics: checked.metrics };
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const checkResult = await client.query(
        `INSERT INTO reading_auto_checks (version_id, checker_version, passed, results)
         VALUES ($1, $2, $3, $4::JSONB)
         ON CONFLICT (version_id, checker_version) DO UPDATE SET
           passed = EXCLUDED.passed, results = EXCLUDED.results, created_at = NOW()
         RETURNING *`,
        [versionId, CHECKER_VERSION, checked.passed, JSON.stringify(results)]
      );
      const status = checked.passed ? "auto_checked" : "draft";
      await client.query("UPDATE reading_item_versions SET status = $1, updated_at = NOW() WHERE id = $2", [status, versionId]);
      await audit(client, currentAdmin.id, "version", versionId, "auto_check", { status: source.status }, { status, ...results });
      await client.query("COMMIT");
      res.json({
        check: {
          id: Number(checkResult.rows[0].id), checkerVersion: CHECKER_VERSION,
          passed: checked.passed, results, createdAt: checkResult.rows[0].created_at
        },
        status
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/admin/versions/:versionId/submit", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const versionId = positiveId(req.params.versionId);
    if (!versionId) throw fail(400, "INVALID_VERSION_ID", "버전 번호가 올바르지 않습니다.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const versionResult = await client.query(
        "SELECT * FROM reading_item_versions WHERE id = $1 FOR UPDATE",
        [versionId]
      );
      const version = versionResult.rows[0];
      if (!version) throw fail(404, "VERSION_NOT_FOUND", "버전을 찾을 수 없습니다.");
      if (version.status !== "auto_checked") {
        throw fail(409, "SUBMIT_NOT_ALLOWED", "자동검사를 통과한 버전만 검수에 제출할 수 있습니다.");
      }
      const checkResult = await client.query(
        `SELECT passed FROM reading_auto_checks
         WHERE version_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [versionId]
      );
      if (!checkResult.rows[0]?.passed) {
        throw fail(409, "PASSING_CHECK_REQUIRED", "통과한 자동검사 결과가 필요합니다.");
      }
      await client.query(
        "UPDATE reading_item_versions SET status = 'review_pending', updated_at = NOW() WHERE id = $1",
        [versionId]
      );
      await audit(
        client,
        currentEditor.id,
        "version",
        versionId,
        "submit_for_review",
        { status: version.status },
        { status: "review_pending" }
      );
      await client.query("COMMIT");
      res.json({ versionId, status: "review_pending" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/admin/versions/:versionId/reviews", asyncRoute(async (req, res) => {
    const currentReviewer = await reviewer(req);
    const versionId = positiveId(req.params.versionId);
    if (!versionId) throw fail(400, "INVALID_VERSION_ID", "버전 번호가 올바르지 않습니다.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const versionResult = await client.query(
        `SELECT id, choices, correct_index, status, created_by
         FROM reading_item_versions WHERE id = $1 FOR UPDATE`,
        [versionId]
      );
      const version = versionResult.rows[0];
      if (!version) throw fail(404, "VERSION_NOT_FOUND", "버전을 찾을 수 없습니다.");
      if (version.status !== "review_pending") {
        throw fail(409, "REVIEW_NOT_ALLOWED", "검수 대기 중인 버전만 검수할 수 있습니다.");
      }
      if (String(version.created_by) === String(currentReviewer.id)) {
        throw fail(409, "SELF_REVIEW_NOT_ALLOWED", "자신이 만든 버전은 직접 검수할 수 없습니다.");
      }
      const existingResult = await client.query(
        "SELECT 1 FROM reading_reviews WHERE version_id = $1 AND reviewer_user_id = $2",
        [versionId, currentReviewer.id]
      );
      if (existingResult.rowCount > 0) {
        throw fail(409, "REVIEW_ALREADY_SUBMITTED", "이 버전의 검수를 이미 제출했습니다.");
      }
      const choiceCount = Array.isArray(version.choices) ? version.choices.length : 0;
      const validated = validateReviewInput(req.body, choiceCount);
      if (validated.errors.length) {
        throw fail(400, "INVALID_REVIEW", validated.errors[0], validated.errors);
      }
      const evaluation = evaluateReview(validated.value, version.correct_index);
      const inserted = await client.query(
        `INSERT INTO reading_reviews
          (version_id, reviewer_user_id, reviewer_answer_index, rubric, total_score, decision, comment)
         VALUES ($1, $2, $3, $4::JSONB, $5, $6, $7)
         RETURNING id, version_id, reviewer_answer_index, rubric, total_score, decision, comment, created_at`,
        [versionId, currentReviewer.id, validated.value.reviewerAnswerIndex,
          JSON.stringify(validated.value.rubric), validated.value.totalScore,
          evaluation.effectiveDecision, validated.value.comment]
      );
      let status = "review_pending";
      let passCount = 0;
      if (evaluation.effectiveDecision === "changes_requested") {
        status = "changes_requested";
      } else {
        const passes = await client.query(
          `SELECT COUNT(DISTINCT reviewer_user_id) AS pass_count
           FROM reading_reviews WHERE version_id = $1 AND decision = 'pass'`,
          [versionId]
        );
        passCount = Number(passes.rows[0]?.pass_count || 0);
        if (passCount >= 2) status = "approved_for_pilot";
      }
      if (status !== "review_pending") {
        await client.query(
          "UPDATE reading_item_versions SET status = $1, updated_at = NOW() WHERE id = $2",
          [status, versionId]
        );
      }
      await audit(
        client,
        currentReviewer.id,
        "version",
        versionId,
        "review",
        { status: version.status },
        { status, decision: evaluation.effectiveDecision, totalScore: validated.value.totalScore }
      );
      await client.query("COMMIT");
      const row = inserted.rows[0];
      res.status(201).json({
        review: {
          id: Number(row.id), versionId: Number(row.version_id),
          reviewerAnswerIndex: Number(row.reviewer_answer_index), rubric: row.rubric,
          totalScore: Number(row.total_score), decision: row.decision,
          comment: row.comment, createdAt: row.created_at
        },
        criteria: {
          criticalScoresPassed: evaluation.criticalScoresPassed,
          scorePassed: evaluation.scorePassed,
          passCriteriaMet: evaluation.passCriteriaMet
        },
        passCount,
        requiredPassCount: 2,
        status
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") {
        throw fail(409, "REVIEW_ALREADY_SUBMITTED", "이 버전의 검수를 이미 제출했습니다.");
      }
      throw error;
    } finally {
      client.release();
    }
  }));

  router.get("/admin/pilot-options", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const [classResult, itemResult] = await Promise.all([
      pool.query(
        `SELECT c.id, c.academic_year, c.grade, c.class_number, c.teacher_name,
                sc.name AS school_name, COUNT(s.id)::INTEGER AS roster_count
         FROM classroom_classes c
         JOIN classroom_schools sc ON sc.id = c.school_id
         LEFT JOIN classroom_students s ON s.class_id = c.id
         WHERE $1 = 'admin' OR c.teacher_user_id = $2
         GROUP BY c.id, sc.name
         ORDER BY c.academic_year DESC, sc.name, c.grade, c.class_number`,
        [currentEditor.role, currentEditor.id]
      ),
      pool.query(
        `SELECT v.id AS version_id, v.version_no, v.prompt_text,
                i.item_key, i.track, i.target_level, i.question_type,
                t.title_ko AS topic_title
         FROM reading_item_versions v
         JOIN reading_items i ON i.id = v.item_id
         JOIN reading_topics t ON t.id = i.topic_id
         WHERE v.status = 'approved_for_pilot'
         ORDER BY i.track, i.target_level, t.title_ko, i.item_key
         LIMIT 500`
      )
    ]);
    res.json({
      classes: classResult.rows.map((row) => ({
        id: Number(row.id), academicYear: Number(row.academic_year),
        grade: Number(row.grade), classNumber: Number(row.class_number),
        teacherName: row.teacher_name, schoolName: row.school_name,
        rosterCount: Number(row.roster_count || 0)
      })),
      items: itemResult.rows.map((row) => ({
        versionId: Number(row.version_id), versionNo: Number(row.version_no),
        itemKey: row.item_key, track: row.track, targetLevel: Number(row.target_level),
        questionType: row.question_type, topicTitle: row.topic_title,
        promptText: row.prompt_text
      }))
    });
  }));

  router.get("/admin/pilots", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const result = await pool.query(
      `SELECT p.id, p.title, p.status, p.opened_at, p.closed_at, p.updated_at,
              c.id AS class_id, c.academic_year, c.grade, c.class_number,
              c.teacher_name, sc.name AS school_name,
              COUNT(DISTINCT pi.version_id)::INTEGER AS item_count,
              COUNT(DISTINCT a.id)::INTEGER AS started_count,
              COUNT(DISTINCT a.id) FILTER (WHERE a.submitted_at IS NOT NULL)::INTEGER AS submitted_count
       FROM reading_pilots p
       JOIN classroom_classes c ON c.id = p.class_id
       JOIN classroom_schools sc ON sc.id = c.school_id
       LEFT JOIN reading_pilot_items pi ON pi.pilot_id = p.id
       LEFT JOIN reading_pilot_attempts a ON a.pilot_id = p.id
       WHERE $1 = 'admin' OR c.teacher_user_id = $2
       GROUP BY p.id, c.id, sc.name
       ORDER BY p.updated_at DESC
       LIMIT 200`,
      [currentEditor.role, currentEditor.id]
    );
    res.json({ pilots: result.rows.map((row) => ({
      id: Number(row.id), title: row.title, status: row.status,
      classId: Number(row.class_id), academicYear: Number(row.academic_year),
      grade: Number(row.grade), classNumber: Number(row.class_number),
      teacherName: row.teacher_name, schoolName: row.school_name,
      itemCount: Number(row.item_count || 0), startedCount: Number(row.started_count || 0),
      submittedCount: Number(row.submitted_count || 0),
      openedAt: row.opened_at, closedAt: row.closed_at, updatedAt: row.updated_at
    })) });
  }));

  router.post("/admin/pilots", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const title = text(req.body?.title, 120);
    const classId = positiveId(req.body?.classId);
    const versionIds = [...new Set((Array.isArray(req.body?.versionIds) ? req.body.versionIds : [])
      .map(positiveId).filter(Boolean))];
    if (!title) throw fail(400, "PILOT_TITLE_REQUIRED", "파일럿 이름을 입력해 주세요.");
    if (!classId) throw fail(400, "INVALID_CLASS_ID", "학급을 선택해 주세요.");
    if (versionIds.length < 1 || versionIds.length > 30) {
      throw fail(400, "INVALID_PILOT_ITEM_COUNT", "파일럿 문항은 1~30개를 선택해 주세요.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const classroom = await classForEditor(currentEditor, classId, client);
      if (!classroom) throw fail(404, "CLASS_NOT_FOUND", "사용할 수 있는 학급을 찾지 못했습니다.");
      const approvedResult = await client.query(
        `SELECT id FROM reading_item_versions
         WHERE id = ANY($1::BIGINT[]) AND status = 'approved_for_pilot'`,
        [versionIds]
      );
      if (approvedResult.rowCount !== versionIds.length) {
        throw fail(409, "APPROVED_ITEMS_REQUIRED", "파일럿 승인 상태인 문항만 배정할 수 있습니다.");
      }
      const pilotResult = await client.query(
        `INSERT INTO reading_pilots (title, class_id, status, created_by)
         VALUES ($1, $2, 'draft', $3) RETURNING *`,
        [title, classId, currentEditor.id]
      );
      const pilot = pilotResult.rows[0];
      for (let index = 0; index < versionIds.length; index += 1) {
        await client.query(
          `INSERT INTO reading_pilot_items (pilot_id, version_id, position)
           VALUES ($1, $2, $3)`,
          [pilot.id, versionIds[index], index + 1]
        );
      }
      await audit(client, currentEditor.id, "pilot", pilot.id, "create", null, {
        title, classId, versionIds
      });
      await client.query("COMMIT");
      res.status(201).json({
        pilot: { id: Number(pilot.id), title: pilot.title, classId, status: pilot.status, itemCount: versionIds.length }
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/admin/pilots/:pilotId/open", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const pilotId = positiveId(req.params.pilotId);
    if (!pilotId) throw fail(400, "INVALID_PILOT_ID", "파일럿 번호가 올바르지 않습니다.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const pilot = await pilotForEditor(currentEditor, pilotId, client, true);
      if (!pilot) throw fail(404, "PILOT_NOT_FOUND", "파일럿을 찾지 못했습니다.");
      if (pilot.status !== "draft") throw fail(409, "PILOT_OPEN_NOT_ALLOWED", "초안 파일럿만 공개할 수 있습니다.");
      const countResult = await client.query("SELECT COUNT(*) AS count FROM reading_pilot_items WHERE pilot_id = $1", [pilotId]);
      if (Number(countResult.rows[0]?.count || 0) < 1) throw fail(409, "PILOT_ITEMS_REQUIRED", "문항이 필요합니다.");
      await client.query(
        "UPDATE reading_pilots SET status = 'open', opened_at = NOW(), updated_at = NOW() WHERE id = $1",
        [pilotId]
      );
      await audit(client, currentEditor.id, "pilot", pilotId, "open", { status: pilot.status }, { status: "open" });
      await client.query("COMMIT");
      res.json({ pilotId, status: "open" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/admin/pilots/:pilotId/close", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const pilotId = positiveId(req.params.pilotId);
    if (!pilotId) throw fail(400, "INVALID_PILOT_ID", "파일럿 번호가 올바르지 않습니다.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const pilot = await pilotForEditor(currentEditor, pilotId, client, true);
      if (!pilot) throw fail(404, "PILOT_NOT_FOUND", "파일럿을 찾지 못했습니다.");
      if (pilot.status !== "open") throw fail(409, "PILOT_CLOSE_NOT_ALLOWED", "진행 중인 파일럿만 종료할 수 있습니다.");
      await client.query(
        "UPDATE reading_pilots SET status = 'closed', closed_at = NOW(), updated_at = NOW() WHERE id = $1",
        [pilotId]
      );
      await audit(client, currentEditor.id, "pilot", pilotId, "close", { status: pilot.status }, { status: "closed" });
      await client.query("COMMIT");
      res.json({ pilotId, status: "closed" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.get("/admin/pilots/:pilotId/results", asyncRoute(async (req, res) => {
    const currentEditor = await editor(req);
    const pilotId = positiveId(req.params.pilotId);
    if (!pilotId) throw fail(400, "INVALID_PILOT_ID", "파일럿 번호가 올바르지 않습니다.");
    const pilot = await pilotForEditor(currentEditor, pilotId);
    if (!pilot) throw fail(404, "PILOT_NOT_FOUND", "파일럿을 찾지 못했습니다.");
    const [completionResult, itemResult, optionResult] = await Promise.all([
      pool.query(
        `SELECT (SELECT COUNT(*) FROM classroom_students WHERE class_id = $1)::INTEGER AS roster_count,
                COUNT(*)::INTEGER AS started_count,
                COUNT(*) FILTER (WHERE submitted_at IS NOT NULL)::INTEGER AS submitted_count
         FROM reading_pilot_attempts WHERE pilot_id = $2`,
        [pilot.class_id, pilotId]
      ),
      pool.query(
        `SELECT pi.position, v.id AS version_id, v.choices,
                i.item_key, i.track, i.target_level, i.question_type,
                t.title_ko AS topic_title, v.prompt_text,
                COUNT(r.id) FILTER (WHERE a.submitted_at IS NOT NULL)::INTEGER AS response_count,
                COUNT(r.id) FILTER (WHERE a.submitted_at IS NOT NULL AND r.is_correct)::INTEGER AS correct_count,
                ROUND(AVG(r.response_ms) FILTER (WHERE a.submitted_at IS NOT NULL))::INTEGER AS average_response_ms,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY r.response_ms)
                  FILTER (WHERE a.submitted_at IS NOT NULL))::INTEGER AS median_response_ms
         FROM reading_pilot_items pi
         JOIN reading_item_versions v ON v.id = pi.version_id
         JOIN reading_items i ON i.id = v.item_id
         JOIN reading_topics t ON t.id = i.topic_id
         LEFT JOIN reading_pilot_responses r
           ON r.pilot_id = pi.pilot_id AND r.version_id = pi.version_id
         LEFT JOIN reading_pilot_attempts a ON a.id = r.attempt_id
         WHERE pi.pilot_id = $1
         GROUP BY pi.position, v.id, i.id, t.id
         ORDER BY pi.position`,
        [pilotId]
      ),
      pool.query(
        `SELECT r.version_id, r.selected_index, COUNT(*)::INTEGER AS choice_count
         FROM reading_pilot_responses r
         JOIN reading_pilot_attempts a ON a.id = r.attempt_id
         WHERE r.pilot_id = $1 AND a.submitted_at IS NOT NULL
         GROUP BY r.version_id, r.selected_index
         ORDER BY r.version_id, r.selected_index`,
        [pilotId]
      )
    ]);
    const optionMap = new Map();
    for (const row of optionResult.rows) {
      const versionId = Number(row.version_id);
      const values = optionMap.get(versionId) || new Map();
      values.set(Number(row.selected_index), Number(row.choice_count));
      optionMap.set(versionId, values);
    }
    const completion = completionResult.rows[0] || {};
    res.json({
      pilot: {
        id: Number(pilot.id), title: pilot.title, status: pilot.status,
        schoolName: pilot.school_name, academicYear: Number(pilot.academic_year),
        grade: Number(pilot.grade), classNumber: Number(pilot.class_number),
        rosterCount: Number(completion.roster_count || 0),
        startedCount: Number(completion.started_count || 0),
        submittedCount: Number(completion.submitted_count || 0)
      },
      items: itemResult.rows.map((row) => {
        const choices = row.choices || [];
        const counts = optionMap.get(Number(row.version_id)) || new Map();
        const responseCount = Number(row.response_count || 0);
        return {
          position: Number(row.position), versionId: Number(row.version_id), itemKey: row.item_key,
          track: row.track, targetLevel: Number(row.target_level), questionType: row.question_type,
          topicTitle: row.topic_title, promptText: row.prompt_text,
          responseCount, correctCount: Number(row.correct_count || 0),
          accuracy: responseCount ? Number(row.correct_count || 0) / responseCount : null,
          averageResponseMs: row.average_response_ms === null ? null : Number(row.average_response_ms),
          medianResponseMs: row.median_response_ms === null ? null : Number(row.median_response_ms),
          choices,
          choiceCounts: choices.map((_, index) => counts.get(index) || 0)
        };
      })
    });
  }));

  router.get("/student/pilots", asyncRoute(async (req, res) => {
    const currentStudent = await student(req);
    const result = await pool.query(
      `SELECT p.id, p.title, p.opened_at,
              COUNT(pi.version_id)::INTEGER AS item_count,
              a.id AS attempt_id, a.started_at, a.submitted_at
       FROM reading_pilots p
       JOIN reading_pilot_items pi ON pi.pilot_id = p.id
       LEFT JOIN reading_pilot_attempts a
         ON a.pilot_id = p.id AND a.student_user_id = $1
       WHERE p.class_id = $2 AND p.status = 'open'
       GROUP BY p.id, a.id
       ORDER BY p.opened_at DESC`,
      [currentStudent.user.id, currentStudent.membership.class_id]
    );
    res.json({
      student: {
        name: currentStudent.membership.roster_name,
        grade: Number(currentStudent.membership.grade),
        classNumber: Number(currentStudent.membership.class_number),
        schoolName: currentStudent.membership.school_name
      },
      pilots: result.rows.map((row) => ({
        id: Number(row.id), title: row.title, itemCount: Number(row.item_count),
        started: Boolean(row.attempt_id), submitted: Boolean(row.submitted_at),
        openedAt: row.opened_at, startedAt: row.started_at, submittedAt: row.submitted_at
      }))
    });
  }));

  router.post("/student/pilots/:pilotId/start", asyncRoute(async (req, res) => {
    const currentStudent = await student(req);
    const pilotId = positiveId(req.params.pilotId);
    if (!pilotId) throw fail(400, "INVALID_PILOT_ID", "파일럿 번호가 올바르지 않습니다.");
    const pilotResult = await pool.query(
      `SELECT id, title FROM reading_pilots
       WHERE id = $1 AND class_id = $2 AND status = 'open'`,
      [pilotId, currentStudent.membership.class_id]
    );
    const pilot = pilotResult.rows[0];
    if (!pilot) throw fail(404, "PILOT_NOT_AVAILABLE", "현재 응시할 수 있는 파일럿이 아닙니다.");
    await pool.query(
      `INSERT INTO reading_pilot_attempts (pilot_id, student_user_id)
       VALUES ($1, $2) ON CONFLICT (pilot_id, student_user_id) DO NOTHING`,
      [pilotId, currentStudent.user.id]
    );
    const attemptResult = await pool.query(
      `SELECT id, started_at, submitted_at FROM reading_pilot_attempts
       WHERE pilot_id = $1 AND student_user_id = $2`,
      [pilotId, currentStudent.user.id]
    );
    const attempt = attemptResult.rows[0];
    const [itemResult, answerResult] = await Promise.all([
      pool.query(
        `SELECT pi.position, v.id AS version_id, v.passage_text, v.prompt_text, v.choices,
                i.track, i.target_level, i.question_type, t.title_ko AS topic_title
         FROM reading_pilot_items pi
         JOIN reading_item_versions v ON v.id = pi.version_id
         JOIN reading_items i ON i.id = v.item_id
         JOIN reading_topics t ON t.id = i.topic_id
         WHERE pi.pilot_id = $1 ORDER BY pi.position`,
        [pilotId]
      ),
      pool.query(
        `SELECT version_id, selected_index FROM reading_pilot_responses
         WHERE attempt_id = $1 ORDER BY answered_at`,
        [attempt.id]
      )
    ]);
    res.json({
      pilot: { id: Number(pilot.id), title: pilot.title },
      attempt: {
        id: Number(attempt.id), startedAt: attempt.started_at,
        submitted: Boolean(attempt.submitted_at), submittedAt: attempt.submitted_at
      },
      items: itemResult.rows.map((row) => ({
        position: Number(row.position), versionId: Number(row.version_id),
        passageText: row.passage_text, promptText: row.prompt_text,
        choices: row.choices || [], track: row.track,
        targetLevel: Number(row.target_level), questionType: row.question_type,
        topicTitle: row.topic_title
      })),
      answers: answerResult.rows.map((row) => ({
        versionId: Number(row.version_id), selectedIndex: Number(row.selected_index)
      }))
    });
  }));

  router.post("/student/pilots/:pilotId/responses", asyncRoute(async (req, res) => {
    const currentStudent = await student(req);
    const pilotId = positiveId(req.params.pilotId);
    const versionId = positiveId(req.body?.versionId);
    const selectedIndex = Number(req.body?.selectedIndex);
    const responseMs = Number(req.body?.responseMs);
    if (!pilotId || !versionId) throw fail(400, "INVALID_RESPONSE_TARGET", "문항 정보가 올바르지 않습니다.");
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 4) {
      throw fail(400, "INVALID_SELECTED_INDEX", "보기를 선택해 주세요.");
    }
    if (!Number.isInteger(responseMs) || responseMs < 250 || responseMs > 3600000) {
      throw fail(400, "INVALID_RESPONSE_TIME", "풀이 시간이 올바르지 않습니다.");
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const attemptResult = await client.query(
        `SELECT a.id, a.submitted_at
         FROM reading_pilot_attempts a
         JOIN reading_pilots p ON p.id = a.pilot_id
         WHERE a.pilot_id = $1 AND a.student_user_id = $2
           AND p.class_id = $3 AND p.status = 'open'
         FOR UPDATE OF a`,
        [pilotId, currentStudent.user.id, currentStudent.membership.class_id]
      );
      const attempt = attemptResult.rows[0];
      if (!attempt) throw fail(404, "ATTEMPT_NOT_FOUND", "먼저 파일럿 응시를 시작해 주세요.");
      if (attempt.submitted_at) throw fail(409, "ATTEMPT_ALREADY_SUBMITTED", "이미 제출한 응시입니다.");
      const versionResult = await client.query(
        `SELECT v.correct_index, v.choices
         FROM reading_pilot_items pi
         JOIN reading_item_versions v ON v.id = pi.version_id
         WHERE pi.pilot_id = $1 AND pi.version_id = $2`,
        [pilotId, versionId]
      );
      const version = versionResult.rows[0];
      if (!version) throw fail(404, "PILOT_ITEM_NOT_FOUND", "파일럿 문항을 찾지 못했습니다.");
      if (selectedIndex >= (version.choices || []).length) {
        throw fail(400, "INVALID_SELECTED_INDEX", "보기 범위를 벗어난 선택입니다.");
      }
      await client.query(
        `INSERT INTO reading_pilot_responses
          (attempt_id, pilot_id, version_id, selected_index, is_correct, response_ms)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [attempt.id, pilotId, versionId, selectedIndex,
          selectedIndex === Number(version.correct_index), responseMs]
      );
      const progressResult = await client.query(
        "SELECT COUNT(*)::INTEGER AS answered_count FROM reading_pilot_responses WHERE attempt_id = $1",
        [attempt.id]
      );
      await client.query("COMMIT");
      res.status(201).json({
        saved: true, versionId, answeredCount: Number(progressResult.rows[0]?.answered_count || 0)
      });
    } catch (error) {
      await client.query("ROLLBACK");
      if (error.code === "23505") throw fail(409, "RESPONSE_ALREADY_SAVED", "이미 답한 문항입니다.");
      throw error;
    } finally {
      client.release();
    }
  }));

  router.post("/student/pilots/:pilotId/submit", asyncRoute(async (req, res) => {
    const currentStudent = await student(req);
    const pilotId = positiveId(req.params.pilotId);
    if (!pilotId) throw fail(400, "INVALID_PILOT_ID", "파일럿 번호가 올바르지 않습니다.");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const attemptResult = await client.query(
        `SELECT a.id, a.submitted_at
         FROM reading_pilot_attempts a
         JOIN reading_pilots p ON p.id = a.pilot_id
         WHERE a.pilot_id = $1 AND a.student_user_id = $2
           AND p.class_id = $3 AND p.status = 'open'
         FOR UPDATE OF a`,
        [pilotId, currentStudent.user.id, currentStudent.membership.class_id]
      );
      const attempt = attemptResult.rows[0];
      if (!attempt) throw fail(404, "ATTEMPT_NOT_FOUND", "응시 기록을 찾지 못했습니다.");
      if (attempt.submitted_at) throw fail(409, "ATTEMPT_ALREADY_SUBMITTED", "이미 제출한 응시입니다.");
      const countResult = await client.query(
        `SELECT
           (SELECT COUNT(*) FROM reading_pilot_items WHERE pilot_id = $1)::INTEGER AS item_count,
           (SELECT COUNT(*) FROM reading_pilot_responses WHERE attempt_id = $2)::INTEGER AS answer_count`,
        [pilotId, attempt.id]
      );
      const counts = countResult.rows[0];
      if (Number(counts.answer_count) !== Number(counts.item_count)) {
        throw fail(409, "ALL_ITEMS_REQUIRED", "모든 문항에 답한 뒤 제출해 주세요.");
      }
      const submitted = await client.query(
        "UPDATE reading_pilot_attempts SET submitted_at = NOW() WHERE id = $1 RETURNING submitted_at",
        [attempt.id]
      );
      await client.query("COMMIT");
      res.json({ submitted: true, submittedAt: submitted.rows[0].submitted_at, itemCount: Number(counts.item_count) });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }));

  return { router, initialize };
}

module.exports = {
  CHECKER_VERSION,
  DOMAINS,
  QUESTION_TYPES,
  REVIEW_RUBRIC_KEYS,
  createReadingBank,
  evaluateReview,
  expectedChoiceCount,
  runAutoChecks,
  validateSourceInput,
  validateTopicInput,
  validateReviewInput,
  loadSampleSeed,
  wordCount
};
