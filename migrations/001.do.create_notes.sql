DROP TABLE IF EXISTS notes;

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    modified TIMESTAMP DEFAULT now() NOT NULL,
    folderid INTEGER REFERENCES folders(id) ON DELETE SET NULL,
    content VARCHAR(500) NOT NULL
);
