# Website Design Requirements — Form + Backend

A standalone rebuild of the "Website Design Requirements" Google Form, with its own
frontend (`index.html`), file uploads, storage, and an admin dashboard
(`admin.html`) to view every submission. Built to deploy on Vercel with zero
custom server.

## What's inside

```
index.html        the public form (client-facing)
admin.html         password-protected page to view all responses
api/submit.js       stores a submission in Vercel KV
api/upload.js       stores an uploaded file in Vercel Blob, returns its URL
api/responses.js    returns all submissions (requires admin password)
package.json
```

## 1. Push this folder to GitHub

Create a new repo and push these files as-is (keep the `api/` folder at the root).

## 2. Import into Vercel

- vercel.com → **Add New → Project** → import the repo.
- Framework preset: **Other** (it's plain static + serverless functions, no build step needed).
- Deploy once — it will work for the form UI immediately, but submissions will fail
  until storage is connected (next step).

## 3. Connect storage (both are a few clicks, no code)

**Vercel KV (stores form answers)**
- Project → **Storage** tab → **Create Database** → **KV** → connect it to this project.
- Vercel automatically adds the required environment variables
  (`KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc.) — nothing to copy manually.

**Vercel Blob (stores uploaded logo/brand files)**
- Project → **Storage** tab → **Create Database** → **Blob** → connect it to this project.
- This automatically adds `BLOB_READ_WRITE_TOKEN`.

After connecting either, redeploy the project once (Vercel usually prompts you to).

## 4. Set the admin password

- Project → **Settings → Environment Variables**
- Add: `ADMIN_PASSWORD` = *(any password you choose)*
- Redeploy.

## 5. View submissions

Go to `https://your-project.vercel.app/admin.html`, enter the password you set,
and every submission appears as a card with all fields and attached files.

## Notes & limits

- **File size:** capped at 4MB per file client-side (Vercel's serverless functions
  have a request body limit, so very large brand files won't upload — ask the
  client to compress or share large files by link instead, e.g. Google Drive).
- **Data location:** answers live in Vercel KV (Redis) under your Vercel account —
  nobody else can see them. `admin.html` is the only way to read them back, and
  it's gated by `ADMIN_PASSWORD`.
- **Editing questions:** every question lives directly in `index.html` as a
  `<section class="q">` block — duplicate one, change the label/name, and it's live.
  Checkbox/radio groups auto-handle "Other" text boxes and progress tracking, no JS
  changes needed for new options.
- **Exporting data:** `admin.html` calls `/api/responses` which returns raw JSON —
  you can hit that endpoint directly (with the `X-Admin-Password` header) to pull
  data into a spreadsheet if needed later.
