-- This file contains the SQL schema, it drops all tables and recreates them

DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS timesheets;

-- To add a field to a table do
-- CREATE TABLE table_name (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     nullable_field TEXT,
--     non_nullable_field TEXT,
--     numeric_field INTEGER,
--     unique_field TEXT UNIQUE,
--     unique_non_nullable_field TEXT UNIQUE,
--     date_field DATE,
--     datetime_field DATETIME
-- );

-- Create employees table
CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT ,
    email TEXT,
    phone TEXT,
    date_of_birth DATE,
    job_title TEXT,
    department TEXT,
    salary TEXT,
    start_date DATE,
    end_date DATE
);

-- Create timesheets table
CREATE TABLE timesheets (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_time DATETIME,
    end_time DATETIME,
    summary TEXT,
    hours_worked REAL,
    employee_id INTEGER,
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);
