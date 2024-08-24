1 pnpm i
2 docker compose up -d
3 pnpm migration:latest && pnpm migration:up && pnpm codegen
4 pnpm dev
5 Happy Coding!