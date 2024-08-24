import { type Kysely } from "kysely";
import { type DB } from "kysely-codegen";

export async function up(db: Kysely<DB>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "text", (col) => col.unique().notNull())
    .addColumn("password", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("session")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("user_id", "serial", (col) =>
      col.references("user.id").onDelete("cascade").notNull()
    )
    .addColumn("refresh_token", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  await db.schema.dropTable("user").ifExists().execute();
  await db.schema.dropTable("session").ifExists().execute();
}
