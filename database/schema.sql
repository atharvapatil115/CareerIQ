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

CREATE TABLE users(
    user_id integer generated always as identity primary key,
    name varchar(100) not null,
    email varchar(150) not null,
    password_hash varchar(255) not null
);