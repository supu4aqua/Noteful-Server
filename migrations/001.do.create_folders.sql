DROP TABLE IF EXISTS folders;

CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name VARCHAR(100) NOT NULL
);
