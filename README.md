Ambiently — Discover and stream ambient soundscapes powered by the Freesound API.

SUMMARY:
As a studier, background noise is essential for focus.
YouTube ambient videos work — but they're clunky, ad-laden, and not customizable.
So I built a clean, dedicated app to host curated Sound Environments — no distractions.

FEATURES:

1. Hosts 8 curated relaxing soundscapes to study/relax to. Each sound environment features a looped audio track.
2. Sleep Timer feature lets the user control a Timer function to stop the Audio player after it is finished.
3. Filter each sound by keyword.
4. Search page gives you access to a paginated list of all the sounds on FreeSound API, also with a filter function. After previewing a sound, you can save it to your account and it becomes another Sound Environment.
5. User accounts — sign up, log in, and persist your saved sounds across sessions.

TECH STACK:

Frontend:
- React / React Router
- Vite

Backend:
- Python / Flask
- Flask-RESTful
- Flask-SQLAlchemy + Flask-Migrate (SQLite by default)
- Flask-Bcrypt (password hashing)
- Marshmallow (serialization)

PREREQUISITES:

- Node.js >= 18
- Python >= 3.9
- pip

INSTALLATION:

1. Clone the repo:
   git clone https://github.com/ATMPorkandBeans-code/ambiently.git
   cd ambiently

2. Install frontend dependencies:
   npm install

3. Set up the backend:
   cd server
   python -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r requirements.txt

4. Create a .env file inside the server/ directory:
   SECRET_KEY=your_secret_key_here
   DATABASE_URI=sqlite:///app.db
   FREESOUND_TOKEN=your_freesound_api_token_here

5. Initialize the database:
   flask db upgrade

RUNNING THE APP:

Start the backend (from server/ with venv active):
   python app.py

Start the frontend (from the project root in a separate terminal):
   npm run dev

The frontend dev server proxies API requests to http://localhost:5000, so both servers need to be running simultaneously.

API KEY SETUP:

1. Get a free API token at freesound.org/apiv2/apply
2. Add it to server/.env as FREESOUND_TOKEN=your_token_here

HOW IT WORKS:
Explore the sound environments from the Home page and click on each to play and set a Timer. The About section provides a brief explanation of the app. The Search page gives access to all Freesound API resources — sounds can be previewed and saved to your account as new Sound Environments. Creating an account persists your saved sounds across sessions.

USAGE NOTE:
Free Render tier makes first load slow due to backend havinh to spin up on request. 