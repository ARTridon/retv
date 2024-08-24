import {
  PostgresAdapter,
  PostgresDriver,
  PostgresIntrospector,
  PostgresQueryCompiler,
} from "kysely";
import { defineConfig } from "kysely-ctl";

import { pool } from "./src/server/lib/database/db";

export default defineConfig({
  dialect: {
    createAdapter() {
      return new PostgresAdapter();
    },
    createDriver() {
      return new PostgresDriver({ pool });
    },
    createIntrospector(db) {
      return new PostgresIntrospector(db);
    },
    createQueryCompiler() {
      return new PostgresQueryCompiler();
    },
  },
  migrations: {
    migrationFolder: "src/server/lib/database/migrations",
  },
});
