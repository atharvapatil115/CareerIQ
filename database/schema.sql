-- CREATE TABLE jobs(
--     id Integer generated always as identity primary key,
--     company varchar(100) not null,
--     job_role  varchar(100) not null, 
--     location varchar(100) not null,
--     salary integer,
--     status varchar(50) not null,
--     date_applied date,
--     notes text
-- );

-- CREATE TABLE users(
--     user_id integer generated always as identity primary key,
--     name varchar(100) not null,
--     email varchar(150) not null,
--     password_hash varchar(255) not null
-- );


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
