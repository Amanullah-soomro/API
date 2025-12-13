# API

## Running locally

1. Copy the example env and edit as needed:

```bash
cp .env.example .env
# then edit .env to fill real credentials
```

2. Start a Postgres instance (Docker example):

```bash
docker run --name pg-dev -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=devdb -p 5432:5432 -d postgres:15
```

3. Install dependencies and run the app:

```bash
npm install
node index.js
```

4. Troubleshooting:

- If you see ECONNREFUSED, confirm Postgres is running and reachable on localhost:5432.
- Verify environment variables: `DATABASE_URL` or `PGHOST`/`PGUSER`/`PGPASSWORD`/`PGDATABASE` are set.
- Check `docker ps` or `ss -ltnp | grep 5432` to confirm the DB is listening.

If you want me to start a Postgres container here, say so and I'll run it for you.
