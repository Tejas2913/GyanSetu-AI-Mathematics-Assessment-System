-- =============================================
-- GyanSetu — Initial Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- =============================================
-- USERS
-- =============================================

CREATE TABLE teachers (
    teacher_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    subject       TEXT DEFAULT 'Mathematics',
    contact       TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE parents (
    parent_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    contact       TEXT,
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE students (
    student_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT NOT NULL,
    email         TEXT UNIQUE NOT NULL,
    class         TEXT DEFAULT '10',
    board         TEXT DEFAULT 'CBSE',
    teacher_id    UUID REFERENCES teachers(teacher_id),
    parent_id     UUID REFERENCES parents(parent_id),
    created_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- QUESTION BANK
-- =============================================

CREATE TABLE questions (
    question_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject       TEXT NOT NULL DEFAULT 'Mathematics',
    topic         TEXT NOT NULL DEFAULT 'Quadratic Equations',
    subtopic      TEXT NOT NULL,
    question_text TEXT NOT NULL,
    marks         INT NOT NULL CHECK (marks IN (1, 2, 3, 4)),
    board         TEXT DEFAULT 'CBSE',
    created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE question_metadata (
    question_id       UUID PRIMARY KEY REFERENCES questions(question_id),
    importance_score  INT DEFAULT 0 CHECK (importance_score BETWEEN 0 AND 10),
    is_hot_question   BOOLEAN DEFAULT false,
    difficulty        TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    tags              TEXT[],
    year_appearances  INT[] DEFAULT '{}'
);

CREATE TABLE rubrics (
    rubric_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id           UUID NOT NULL REFERENCES questions(question_id),
    step_number           INT NOT NULL,
    step_description      TEXT NOT NULL,
    max_marks             INT NOT NULL,
    ideal_solution_snippet TEXT NOT NULL,
    keywords              TEXT[],
    UNIQUE(question_id, step_number)
);

-- =============================================
-- ATTEMPTS & EVALUATIONS
-- =============================================

CREATE TABLE attempts (
    attempt_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES students(student_id),
    question_id       UUID NOT NULL REFERENCES questions(question_id),
    input_mode        TEXT NOT NULL CHECK (input_mode IN ('typed', 'voice', 'photo')),
    raw_input_ref     TEXT,
    transcribed_text  TEXT,
    submitted_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE evaluations (
    evaluation_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id            UUID UNIQUE NOT NULL REFERENCES attempts(attempt_id),
    step_marks            JSONB NOT NULL,
    total_marks_awarded   INT NOT NULL,
    total_max_marks       INT NOT NULL,
    feedback_text         TEXT NOT NULL,
    confidence_flag       TEXT DEFAULT 'high' CHECK (confidence_flag IN ('high', 'medium', 'low')),
    graded_at             TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ANALYTICS
-- =============================================

CREATE TABLE weak_topic_analytics (
    analytics_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES students(student_id),
    subtopic          TEXT NOT NULL,
    attempts_count    INT DEFAULT 0,
    average_score_pct FLOAT DEFAULT 0.0,
    status            TEXT DEFAULT 'average' CHECK (status IN ('strong', 'average', 'weak')),
    updated_at        TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, subtopic)
);

-- =============================================
-- REPORTS
-- =============================================

CREATE TABLE teacher_reports (
    report_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id    UUID NOT NULL REFERENCES teachers(teacher_id),
    student_id    UUID NOT NULL REFERENCES students(student_id),
    summary_text  TEXT NOT NULL,
    generated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE parent_reports (
    report_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id     UUID NOT NULL REFERENCES parents(parent_id),
    student_id    UUID NOT NULL REFERENCES students(student_id),
    summary_text  TEXT NOT NULL,
    generated_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_questions_subtopic ON questions(subtopic);
CREATE INDEX idx_questions_marks ON questions(marks);
CREATE INDEX idx_attempts_student ON attempts(student_id);
CREATE INDEX idx_attempts_question ON attempts(question_id);
CREATE INDEX idx_evaluations_attempt ON evaluations(attempt_id);
CREATE INDEX idx_weak_topics_student ON weak_topic_analytics(student_id);
CREATE INDEX idx_teacher_reports_student ON teacher_reports(student_id);
CREATE INDEX idx_parent_reports_student ON parent_reports(student_id);

-- =============================================
-- STORAGE BUCKET (run in Supabase dashboard)
-- =============================================
-- Create a storage bucket named "student-uploads" for handwriting photos
-- Settings: Public = false, File size limit = 5MB, Allowed MIME types = image/*
