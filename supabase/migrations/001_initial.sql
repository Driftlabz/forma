-- Projects
CREATE TABLE projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  status          text NOT NULL DEFAULT 'intake'
                  CHECK (status IN ('intake','designing','preview','revision','building','complete','failed')),
  revision_count  integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Intakes
CREATE TABLE intakes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  business_name   text,
  niche           text,
  audience        text,
  key_emotion     text,
  designed_pages  text[] DEFAULT '{}',
  cms_pages       text[] DEFAULT '{}',
  references      text[] DEFAULT '{}',
  avoid           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE intakes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their intakes"
  ON intakes FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = intakes.project_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE id = intakes.project_id)
  );

-- Specs
CREATE TABLE specs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  version         integer NOT NULL DEFAULT 1,
  mode            text NOT NULL DEFAULT 'CINEMATIC',
  design_spec     jsonb,
  preview_html    text,
  qa_result       jsonb,
  approved        boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their specs"
  ON specs FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = specs.project_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE id = specs.project_id)
  );

-- Build Logs
CREATE TABLE build_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  step            text NOT NULL,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','running','complete','failed')),
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE build_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their build logs"
  ON build_logs FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM projects WHERE id = build_logs.project_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM projects WHERE id = build_logs.project_id)
  );

-- Auto-update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
