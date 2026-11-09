# Quizsmith App

Quizsmith as an installable app for **Windows, Mac, Android and iPhone**, built from one codebase as a Progressive Web App (PWA).

Once installed, it has its own icon, opens in its own window or full screen with no browser bars, and **works with no internet**. Smart App Control doesn't block it, because it installs through Chrome, Edge or Safari instead of running an unsigned `.exe`.

---

## Step 1 · Put the app online (once, about 2 minutes)

An app installs from a secure (https) link, so it has to be hosted once. Then every device installs from that link.

**Netlify Drop (free, easiest)**
1. Unzip `quizsmith-app.zip`.
2. On your laptop, open **app.netlify.com/drop** in Chrome or Edge.
3. Drag the **`quizsmith-app`** folder (the one containing `index.html`) onto the page.
4. You get a link like `https://something.netlify.app`. Open it to check that Quizsmith loads.
5. **Sign up (free) and claim the site** so it stays online. Unclaimed drops are temporary.

**Or GitHub Pages (free):** create a repository, upload everything inside `quizsmith-app`, then turn on **Settings → Pages → Deploy from branch → main**.

---

## Step 2 · Install it on each device

Open your link on the device, then:

| Device | How to install |
| --- | --- |
| **Android** (Chrome) | Tap **Install app** in Quizsmith, or **⋮ menu → Install app / Add to Home screen**. |
| **iPhone / iPad** (Safari) | Tap **Install app** in Quizsmith for the steps, or tap **Share ↑ → Add to Home Screen → Add**. It must be Safari. |
| **Windows** (Edge or Chrome) | Click **Install app** in Quizsmith, or the install icon (⊕) at the right of the address bar. It appears in the Start menu and can be pinned to the taskbar. |
| **Mac** (Chrome or Edge) | Click **Install app**, or the install icon in the address bar. It appears in Launchpad and the Dock. |
| **Mac** (Safari) | **File → Add to Dock…** (Safari 17 or later). |

After the first launch, everything is cached on the device, so the app opens offline.

---

## What's app-specific

- **Offline:** `sw.js` (the service worker) caches every file. JSS and the fonts are bundled locally in `vendor/` and `fonts/`, with no CDN.
- **Install button:** shown on the start screen when the device can install. On iPhone and Mac Safari it opens step-by-step instructions.
- **Share result…:** opens the phone's or computer's own share sheet (WhatsApp, Messages, mail…). **Copy result text** still works everywhere.
- **Android back button:** steps back a question, or from the results to the start screen.
- **Phone polish:** safe areas around notches, light vibration when you mark an answer (Android), no zoom on double tap.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | App shell: manifest, icons, iPhone settings, loads everything |
| `manifest.webmanifest` | App name, icons, colours, standalone window: what makes it installable |
| `sw.js` | Service worker: offline caching and updates |
| `js/questions.js` | Question bank (6 domains, 77 questions, weighted options) |
| `js/styles.js` | All styling in JSS: dark theme, 3D effects, animations |
| `js/app.js` | Generator, scoring, screens, flip cards, share text + the app layer (install, share, back button) |
| `vendor/` | JSS library (MIT licence) |
| `fonts/` | Bricolage Grotesque, Atkinson Hyperlegible, IBM Plex Mono (SIL Open Font Licence) |
| `icons/` | App icons for Android, iPhone, Windows and Mac |

## Updating the app

Edit the files, change `VERSION` in `sw.js` (for example `quizsmith-v1.0.2`), and upload the folder again (in Netlify, drag it onto your site's **Deploys** page). Installed copies pick up the new version the next time they're opened.

## Test it on your laptop without hosting

```
cd quizsmith-app
python -m http.server 8000
```

Then open **http://localhost:8000** in Chrome or Edge. Install and offline mode work on localhost too.
