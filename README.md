# Your Portfolio — Red & Black Theme

A single-page, vanilla HTML/CSS/JS portfolio with:
- Animated particle/circuit background + cursor glow
- Scroll-reveal animations, typing hero title, tilt-hover project cards
- A hidden admin panel to edit content in-browser (no server needed)

No frameworks, no build step — just static files, perfect for free GitHub Pages hosting.

## File structure
```
portfolio/
├── index.html
├── css/style.css
├── js/content-data.js   ← your content lives here
├── js/main.js            ← rendering + animations
├── js/admin.js           ← secret login + editor
└── README.md
```

## 1. Personalize your content
Open `js/content-data.js` and edit the `DEFAULT_CONTENT` object: your name, titles,
about text, skills, projects, timeline (education/experience), and contact links.
This is the easiest way to make the first real update.

## 2. Preview it locally
You don't need anything fancy. Two options:
- Just double-click `index.html` to open it in your browser, or
- For the best experience (some browsers restrict local file scripts), run a tiny local server:
  ```bash
  # from inside the portfolio folder
  python -m http.server 8000
  # then open http://localhost:8000 in your browser
  ```

## 3. The secret admin panel
Two ways to open the login screen:
1. Click the small dot in the footer **5 times quickly**, or
2. Press **Ctrl+Shift+L**

The first time you open it, you'll be asked to set your own password (stored only
in your browser via a hashed value — nothing is sent anywhere). After logging in:
- **Edit Content** — opens a panel to change any text, add/remove skills, projects,
  or timeline entries.
- **Save Changes** — stores your edits in that browser's `localStorage` so you can
  preview them.
- **Export content.js** — downloads an updated `content-data.js` file with your
  changes baked in. Replace the old file in your project folder with this one.
- **Reset to Default** — wipes local edits and reverts to `content-data.js`.
- **Logout** — ends the session (you'll need the password again next time).

> ⚠️ **Important:** GitHub Pages only hosts static files — there's no database or
> server. That means "Save Changes" only updates what **you** see in **your**
> browser. For your edits to appear for every visitor, you must **Export**, replace
> `js/content-data.js`, then commit & push (steps below). Also note: this login is
> a convenience gate, not bank-grade security — anyone determined enough could read
> your JavaScript. Don't use it to protect anything truly sensitive.

## 4. Publish it for free with GitHub Pages
1. **Create a GitHub account** at https://github.com if you don't have one.
2. **Create a new repository**
   - Click the **+** icon (top right) → **New repository**.
   - Name it anything, e.g. `portfolio` (or `yourusername.github.io` for a root
     domain URL like `https://yourusername.github.io`).
   - Set it to **Public**. Don't initialize with a README (you already have one).
3. **Upload your files**
   - Easiest: on the new repo's page, click **uploading an existing file**, drag in
     everything from your `portfolio` folder (keeping the `css/` and `js/` folders
     intact), and commit.
   - Or with Git from your computer:
     ```bash
     cd portfolio
     git init
     git add .
     git commit -m "Initial portfolio"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
     git push -u origin main
     ```
4. **Turn on GitHub Pages**
   - In your repo, go to **Settings → Pages**.
   - Under **Build and deployment → Source**, choose **Deploy from a branch**.
   - Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
5. **Wait ~1 minute**, then refresh that Pages settings page — it will show your
   live URL, typically:
   - `https://YOUR-USERNAME.github.io/YOUR-REPO/` (normal repo), or
   - `https://YOUR-USERNAME.github.io/` (if you named the repo `yourusername.github.io`)
6. **Every future update**: edit files locally (or via GitHub's web editor), then
   ```bash
   git add .
   git commit -m "Update portfolio content"
   git push
   ```
   GitHub Pages redeploys automatically within a minute or two.

## 5. Custom domain (optional)
If you own a domain, add a `CNAME` file in the repo root containing just your
domain (e.g. `yourname.dev`), then point your domain's DNS to GitHub Pages per
GitHub's docs: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site

## 6. Ideas for later
- Swap the particle background colors/density in `initBgCanvas()` in `main.js`.
- Add a real profile photo: drop it in an `assets/` folder and reference it in
  `index.html`/`content-data.js`.
- Add a contact form using a free service like Formspree if you want messages
  emailed to you directly instead of `mailto:`.
