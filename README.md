# لعبة خمّن صورتك

## Run locally
    npm install
    npm start
Open http://localhost:3000 in two tabs (each tab is a separate player).

## Put it online (so friends can play)
Upload this folder to a GitHub repo, then create a "Web Service" on a Node host (e.g. Render):
- Build command: npm install
- Start command: npm start
Send friends the public URL. Add #CODE to the URL to prefill the room code.

Notes: rooms live in server memory (lost on restart, deleted after 12 hours).
