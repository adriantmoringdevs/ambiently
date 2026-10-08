Neon free tier for PostgreSQL 
Render Web Service for Flask API 
Render Static-site for React UI

Added gunicorn, psycopg2-binary, and psycopg[binary] in requirements.txt

base: "/" in vite.config.js file

add CORS live site to config.py file

.env in .gitignore

Create Database in Neon, copy the right URL(Connect string on Neon)

Ran DATABASE_URI="postgresql://...neon..."   flask db upgrade flask db current command with Neon URI address to switch db instance to Neon postgreSQL.

Backend service settings: Root Directory, build command, start command, env var names (not values).

Frontend service settings: Root Directory, build command, Publish Directory (dist), the two rewrite rules in order, and any VITE_ variables, which must be set before the build

Test

debug with devtools and render api logs. 

