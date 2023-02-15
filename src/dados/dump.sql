CREATE DATABASE banco_digital;

CREATE TABLE banco (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  numero TEXT NOT NULL UNIQUE,
  agencia TEXT NOT NULL,
  senha TEXT NOT NULL
);

INSERT INTO banco
(nome, numero, agencia, senha)
VALUES
('Cubos Bank', '123', '0001', '$2a$12$VR8US838MdgTcgC/2PtZdOnLGax0F5Qh4VvUv0NLqCL.yV3axKBGm');

CREATE TABLE contas (
  id SERIAL PRIMARY KEY,
  saldo INTEGER DEFAULT 0,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL
);

CREATE TABLE saques (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL,
  numero_conta INTEGER REFERENCES contas(id) NOT NULL,
  valor INTEGER NOT NULL
);

CREATE TABLE depositos (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL,
  numero_conta INTEGER REFERENCES contas(id) NOT NULL,
  valor INTEGER NOT NULL
);

CREATE TABLE transferencias (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP NOT NULL,
  numero_conta_origem INTEGER REFERENCES contas(id) NOT NULL,
  numero_conta_destino INTEGER REFERENCES contas(id) NOT NULL,
  valor INTEGER NOT NULL
);
