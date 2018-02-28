DROP TABLE if exists users;
DROP TABLE if exists messages;
DROP TABLE if EXISTS logged_in;

CREATE TABLE users
(
  email VARCHAR(30),
  password VARCHAR(50) NOT NULL,
  firstname VARCHAR(20),
  familyname VARCHAR(20),
  gender VARCHAR(20),
  city VARCHAR(20),
  country VARCHAR(20),
  CONSTRAINT pk_email PRIMARY KEY(email)
);


CREATE TABLE logged_in
(
  token TEXT,
  email VARCHAR(30),
  CONSTRAINT pk_token PRIMARY KEY(token)

);


CREATE TABLE messages
(
  id TEXT,
  from_email VARCHAR(30),
  to_email VARCHAR(30),
  message TEXT,
  CONSTRAINT pk_message PRIMARY KEY(id)
);
