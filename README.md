# SafeDays Security — Website

**safedayssecurity.com** — Cybersecurity consulting for law firms and small professional offices in San Antonio, TX.

---

## Project Structure

```
Binary-Tech-Solutions/
├── index.html                  # Main single-page site
├── styles.css                  # All site CSS
├── main.js                     # All site JS (nav, cursor, canvas, animations)
├── blog.css                    # Blog post page styles (imported by template)
├── blog-post-template.html     # Reusable template for writing new posts
├── sitemap.xml                 # SEO sitemap — update when adding content
├── robots.txt                  # Crawler instructions
├── README.md                   # This file
└── blog/
    ├── 5-law-firm-network-mistakes.html
    ├── wpa2-not-enough.html
    └── phishing-law-firms.html
```

---

## Deploying to Hostinger

### Step 1 — Get your files ready

Make sure you have all files committed and your project folder is ready to upload. The folder should have `index.html` at the root level.

### Step 2 — Log into Hostinger hPanel

1. Go to [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Select your hosting plan
3. Click **File Manager** under the Files section

### Step 3 — Upload files

**Option A — File Manager (easiest for first deploy):**
1. In File Manager, navigate to `public_html/`
2. Delete any placeholder `index.html` Hostinger put there
3. Upload all your project files into `public_html/`
   - `index.html` goes directly in `public_html/`
   - `styles.css`, `main.js`, `blog.css` go in `public_html/`
   - The `blog/` folder goes in `public_html/blog/`
   - `sitemap.xml` and `robots.txt` go in `public_html/`

**Option B — FTP/SFTP (recommended for ongoing updates):**
1. In hPanel → **FTP Accounts**, create an FTP account
2. Connect with FileZilla (free): `sftp://yoursite.com`, port 22
3. Drag your local project folder into `public_html/`

**Option C — Git deploy (if Hostinger plan supports it):**
1. hPanel → **Git** → connect your GitHub repo
2. Set deploy path to `public_html/`
3. Push to main branch triggers auto-deploy

### Step 4 — Point your domain

1. hPanel → **Domains** → make sure `safedayssecurity.com` points to your hosting
2. DNS propagation can take up to 48 hours (usually under 2 hours)

### Step 5 — Enable SSL

1. hPanel → **SSL** → Enable free Let's Encrypt certificate
2. Force HTTPS redirect (toggle in hPanel or add to `.htaccess`)

```apache
# .htaccess — Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Step 6 — Submit sitemap to Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property: `https://safedayssecurity.com`
3. Verify ownership (HTML file method is easiest with Hostinger File Manager)
4. Go to **Sitemaps** → submit `https://safedayssecurity.com/sitemap.xml`

---

## Writing a New Blog Post

1. **Copy the template:**
   ```bash
   cp blog-post-template.html blog/your-post-slug.html
   ```

2. **Edit the following in your new file:**
   - `<title>` tag — keep under 60 chars
   - All `meta` description, OG, and Twitter tags
   - `<link rel="canonical">` — must match exact URL
   - JSON-LD `headline`, `description`, `url`, `datePublished`
   - `POST TITLE HERE` in the hero section
   - `CATEGORY HERE` tag pill
   - `datetime` attribute on the `<time>` element
   - Breadcrumb last item text
   - The article body between the `<!-- INTRO -->` and `<!-- CONCLUSION -->` comments
   - Table of contents `href` anchors (add `id=""` to each `<h2>` to match)

3. **Add the post to the blog grid in `index.html`:**
   Copy one of the existing `<article class="blog-card">` blocks and update the title, excerpt, date, category, and `href`.

4. **Update `sitemap.xml`:**
   Add a new `<url>` block for the post. Set `<lastmod>` to the publish date.

5. **Upload** the new `.html` file to `public_html/blog/` on Hostinger.

---

## Adding the Calendly Embed

When you're ready to replace the "Book Free Call" button with a real inline Calendly widget:

1. Log into [calendly.com](https://calendly.com) → share your event type → **Add to website**
2. Choose **Inline Embed**
3. Copy the embed snippet — it looks like:
   ```html
   <!-- Calendly inline widget begin -->
   <div class="calendly-inline-widget"
        data-url="https://calendly.com/jose-binarytsolutions/30min"
        style="min-width:320px;height:700px;">
   </div>
   <script type="text/javascript"
           src="https://assets.calendly.com/assets/external/widget.js"
           async>
   </script>
   <!-- Calendly inline widget end -->
   ```
4. In `index.html`, find `id="calendly-placeholder"` and replace its contents with the snippet above.
5. You can remove or hide the "Book a Free 15-Minute Call" button below it once the widget is live.

---

## Adding a Real Photo

Replace the `JT` initials placeholder in the About section:

1. Export your photo as a `.webp` file, ideally `480×600px` (4:5 ratio)
2. Save it to `assets/jose-profile.webp` (create the `assets/` folder)
3. In `index.html`, find `.about__photo-placeholder` and replace it with:
   ```html
   <img
     src="assets/jose-profile.webp"
     alt="Jose, founder of SafeDays Security, network security technician"
     width="480"
     height="600"
     loading="lazy"
     decoding="async"
     class="about__photo-img"
   />
   ```
4. Add this to `styles.css`:
   ```css
   .about__photo-img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     border-radius: var(--radius-2xl);
     border: 1px solid var(--color-border-accent);
   }
   ```

---

## Connecting a Form Backend

The contact form currently uses `action="mailto:"` as a fallback. To get real form submissions:

**Option A — Formspree (free tier, no backend needed):**
1. Sign up at [formspree.io](https://formspree.io)
2. Create a form pointing to `info@safedayssecurity.com`
3. Replace the `<form>` action:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
   ```
4. Remove `enctype="text/plain"` — Formspree handles encoding.

**Option B — Netlify Forms** (if you later move to Netlify hosting):
1. Add `netlify` attribute to the form tag:
   ```html
   <form name="contact" netlify netlify-honeypot="bot-field">
   ```
2. Submissions appear in your Netlify dashboard and email you.

---

## Ongoing SEO Checklist

- [ ] Submit sitemap to Google Search Console
- [ ] Verify domain in Bing Webmaster Tools
- [ ] Add real `og-image.png` (1200×630px) to `assets/`
- [ ] Replace `assets/logo.png` in JSON-LD with actual logo file
- [ ] Claim Google Business Profile for local SEO
- [ ] Add real profile photo to About section
- [ ] Write and publish first 3 blog posts (drafts already set up)
- [ ] Set up Google Analytics or Plausible for traffic tracking
- [ ] Get 5 client reviews on Google Business Profile

---

## Tech Stack

| Layer | Choice |
|---|---|
| HTML | Semantic HTML5, no framework |
| CSS | Custom from scratch (no Bootstrap/Tailwind) |
| JS | Vanilla ES6+, no dependencies |
| Fonts | Google Fonts (Inter + Space Grotesk) |
| Hosting | Hostinger shared or cloud hosting |
| Forms | mailto fallback → Formspree recommended |
| Scheduling | Calendly embed |
| Analytics | Add Google Analytics 4 or Plausible |

---

*Built for SafeDays Security · San Antonio, TX · safedayssecurity.com*
