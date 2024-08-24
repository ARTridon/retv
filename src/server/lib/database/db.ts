import  pg from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { type DB } from "kysely-codegen";

export const pool = new pg.Pool({
  user: "root",
  host: "localhost",
  database: "dev",
  password: "password",
  port: 5432,
  max: 20,
});

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});
