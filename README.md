# Sistema de Estoque com Auditoria — API (PostgreSQL)

API REST em Node.js + Express integrada ao PostgreSQL, com trigger PL/pgSQL
de atualização automática de estoque, view de relatório e movimentações
transacionais com lock de linha.

## Pré-requisitos
- Node.js 18+
- PostgreSQL 11+ rodando localmente

## Como rodar

1. Crie o banco (uma vez):
   ```bash
   psql -U postgres -c "CREATE DATABASE estoque;"
   ```
2. Configure a conexão:
   ```bash
   cp .env.example .env
   # edite .env com seu usuário, senha e porta
   ```
3. Instale e inicie:
   ```bash
   npm install
   npm start
   ```
As tabelas, a função do trigger, o trigger e a view são criados automaticamente
na inicialização (o `schema.sql` é idempotente).

## O que mudou em relação à versão SQLite

| Tema | SQLite (antes) | PostgreSQL (agora) |
|---|---|---|
| Driver | `better-sqlite3` (síncrono) | `pg` com `Pool` (assíncrono, `async/await`) |
| Placeholders | `?` | `$1, $2, ...` |
| Chave primária | `INTEGER PRIMARY KEY AUTOINCREMENT` | `SERIAL PRIMARY KEY` |
| Preço | `REAL` | `NUMERIC(10,2)` (convertido para número no driver) |
| Datas | `TEXT` + `datetime('now')` | `TIMESTAMPTZ` + `NOW()` |
| Trigger | corpo inline (2 triggers) | função PL/pgSQL `fn_update_stock()` + 1 trigger |
| Estoque negativo | validado só na rota | `CHECK (quantity >= 0)` também no banco |
| Concorrência | sem proteção | transação + `SELECT ... FOR UPDATE` |
| Retorno de INSERT/UPDATE | `lastInsertRowid` + novo SELECT | `RETURNING *` |
| Erros do banco | HTTP 500 genérico | `23503`/`23505`→409, `22P02`/`23514`→400 |

## Endpoints
Idênticos à versão anterior (os mesmos testes do Postman funcionam):
`/products`, `/products/low-stock`, `/products/:id`, `/movements`,
`/movements/product/:productId`, `/categories`, `/suppliers`.
