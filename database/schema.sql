
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
