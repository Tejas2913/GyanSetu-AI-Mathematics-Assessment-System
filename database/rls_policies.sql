-- =============================================
-- GyanSetu — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql in Supabase SQL Editor
-- =============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_topic_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_reports ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PUBLIC READ: Questions, Metadata, Rubrics
-- All authenticated users can read the question bank
-- =============================================

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read question metadata"
  ON question_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read rubrics"
  ON rubrics FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- STUDENTS: Own data only
-- =============================================

CREATE POLICY "Students can read own profile"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own profile"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- =============================================
-- ATTEMPTS: Student owns their attempts
-- =============================================

CREATE POLICY "Students can create attempts"
  ON attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can read own attempts"
  ON attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- =============================================
-- EVALUATIONS: Via attempt ownership
-- =============================================

CREATE POLICY "Students can read own evaluations"
  ON evaluations FOR SELECT
  TO authenticated
  USING (
    attempt_id IN (
      SELECT attempt_id FROM attempts WHERE student_id = auth.uid()
    )
  );

-- =============================================
-- ANALYTICS: Student owns their analytics
-- =============================================

CREATE POLICY "Students can read own analytics"
  ON weak_topic_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

-- =============================================
-- TEACHERS: Access to their students' data
-- =============================================

CREATE POLICY "Teachers can read own profile"
  ON teachers FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can read their students"
  ON students FOR SELECT
  TO authenticated
  USING (
    teacher_id IN (
      SELECT teacher_id FROM teachers WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can read their reports"
  ON teacher_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = teacher_id);

-- =============================================
-- PARENTS: Access to their children's data
-- =============================================

CREATE POLICY "Parents can read own profile"
  ON parents FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can read their reports"
  ON parent_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = parent_id);

-- =============================================
-- SERVICE ROLE: Full access for backend operations
-- The service_role key bypasses RLS automatically
-- =============================================
-- No additional policies needed for backend operations.
-- The FastAPI backend uses the service_role key which has full access.
