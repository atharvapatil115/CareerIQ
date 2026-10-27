
CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE jobs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company VARCHAR(100) NOT NULL,
    job_role VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary INTEGER,
    status VARCHAR(50) NOT NULL,
    date_applied DATE,
    notes TEXT,
    user_id INTEGER NOT NULL,
    CONSTRAINT fk_jobs_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);


CREATE TABLE discovered_jobs (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    title varchar(200) NOT NULL,
    company varchar(150) NOT NULL,
    location varchar(200),
    description text,
    employment_type varchar(50),
    experience_level varchar(100),

    source varchar(50) NOT NULL,
    external_id varchar(200) NOT NULL,
    application_url text NOT NULL,

    posted_at date,
    first_seen_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_discovered_jobs_source_external_id
        UNIQUE (source, external_id)
);

-- JOB INTELLIGENCE AI: RESUMES


CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    original_filename VARCHAR(255) NOT NULL,

    storage_key VARCHAR(500),

    status VARCHAR(30) NOT NULL DEFAULT 'uploaded',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resumes_user_id
ON resumes(user_id);


-- JOB INTELLIGENCE AI: RESUME CHUNKS

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS resume_chunks (
    id SERIAL PRIMARY KEY,

    resume_id INTEGER NOT NULL
        REFERENCES resumes(id)
        ON DELETE CASCADE,

    chunk_index INTEGER NOT NULL,

    section VARCHAR(100),

    chunk_text TEXT NOT NULL,

    embedding VECTOR(384),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_resume_chunk_index
        UNIQUE (resume_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_resume_chunks_resume_id
ON resume_chunks(resume_id);


-- JOB INTELLIGENCE AI: JOB ANALYSES


CREATE TABLE IF NOT EXISTS job_analyses (
    id SERIAL PRIMARY KEY,

    resume_id INTEGER NOT NULL
        REFERENCES resumes(id)
        ON DELETE CASCADE,

    job_id INTEGER NOT NULL
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    match_score NUMERIC(5, 2),

    matched_skills JSONB NOT NULL DEFAULT '[]'::jsonb,

    missing_skills JSONB NOT NULL DEFAULT '[]'::jsonb,

    skill_gaps JSONB NOT NULL DEFAULT '[]'::jsonb,

    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,

    analysis_summary TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_job_analysis_resume_job
        UNIQUE (resume_id, job_id),

    CONSTRAINT chk_job_analysis_match_score
        CHECK (match_score IS NULL OR
               (match_score >= 0 AND match_score <= 100))
);

CREATE INDEX IF NOT EXISTS idx_job_analyses_resume_id
ON job_analyses(resume_id);

CREATE INDEX IF NOT EXISTS idx_job_analyses_job_id
ON job_analyses(job_id);
