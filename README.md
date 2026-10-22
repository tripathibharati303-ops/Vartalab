# Vartalab

**Build your English. Practise with confidence. See your progress.**

Vartalab is a student-focused English communication platform prototype. Learners follow a grammar-first loop: take a diagnostic, study short lessons, practise speaking and writing, join communities, attend events, and compete in weekly IELTS-style practice contests.

The whole app is **one file** (`index.html`) with inline CSS and JavaScript. There are no frameworks, no build step and no backend. Data is kept in the browser.

**Live demo:** https://tripathibharati303-ops.github.io/Vartalab/

> **Note:** This is a front-end prototype. Contests are practice contests and are **not** an official IELTS examination.

---

## Features

| Area | What it does |
| --- | --- |
| **Public pages** | Home, How It Works, About / Contact |
| **Accounts** | Sign up, log in, password reset, remember me, public/private profile |
| **Onboarding** | Pick a goal, self-rate level (A1–C2), take an 8-question diagnostic |
| **Learn** | Dashboard with progress, rating, weak areas and a recommended lesson; lessons with explanation, examples and instant-feedback questions |
| **Practice** | Speaking / Writing tabs, goal-based prompts, simulated structured feedback |
| **IELTS Arena** | Countdown to the next contest, rules, timed contest screen, results with score, rank, percentile and rating change |
| **Leaderboard** | Global / weekly / monthly tabs with your position highlighted |
| **Profile** | Rating, peak rating, percentile, contest history, skill progress, badges, recent activity |
| **CO-LAB** | Goal/level-based communities with sessions, a feed and posting |
| **ACT-LAB** | Events (debates, movie nights, mock interviews, poetry, competitions) with seat counts and registration |
| **Achievements** | Badges such as First Step, Arena Rookie, On a Roll |
| **Admin panel** | User list and search, lessons, contests, events, contest participation, audit log |

## Tech

- Plain HTML, CSS and vanilla JavaScript in a single file
- Hash-style navigation (`#/home`, `#/learn`, …) handled by a small `go(view)` router
- Rendering by template strings into `#app`, `#topnav`, `#navcta` and `#footer`
- Storage in `localStorage` with an in-memory fallback, so it still runs where storage is blocked (sandboxed previews)
- Responsive layout, mobile menu, toasts and modals, no external libraries or fonts

## Project structure

```
vartalab/
├── index.html    # markup, styles (<style>) and app logic (<script>)
└── README.md
```

Inside `index.html` the script is split into labelled sections:

```
STORAGE → SEED DATA → STATE → ROUTER → RENDER → NAV / FOOTER → TOAST
HOME / HOW / ABOUT → AUTH MODALS → ONBOARDING & DIAGNOSTIC → LEARN → LESSON
PRACTICE → IELTS ARENA → CONTEST → RESULTS → LEADERBOARD → PROFILE
CO-LAB → ACT-LAB → ACHIEVEMENTS → ADMIN → ICONS → INIT
```

## Run it

Open `index.html` directly in a browser, or serve the folder:

```bash
cd vartalab
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy to GitHub Pages

1. Put `index.html` (and this README) in the **root** of the repository.
2. Go to **Settings → Pages → Deploy from a branch**, choose your branch and `/ (root)`.
3. Wait for the "pages build and deployment" action to finish, then open the project URL: https://tripathibharati303-ops.github.io/Vartalab/

### Before you deploy: clean the saved copy

If you saved the page out of a browser while it was served through Cloudflare, the file ends with an injected script that loads `/cdn-cgi/challenge-platform/scripts/jsd/main.js`. That path does not exist on GitHub Pages. Delete that last `<script>(function(){function c(){…})();</script>` block (it sits right before `</body>`). The app does not need it.

## Demo accounts

Seeded on first load, for testing only:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@vartalab.in` | `admin123` |
| Learner | `ananya@example.com` | `pass123` |

Other seeded learners (`rahul@`, `priya@`, `dev@`, `ishita@`, `meera@example.com`) use the same learner password. You can also create a new account with **Sign up**.

## Data and storage

| Key | Contents |
| --- | --- |
| `vartha_db` | Whole database: users, contests, communities, events, leaderboard, attempts, diagnostics, registrations, achievements, audit log |
| `vartha_session` | Id of the logged-in user |

To reset the app to its seed data, clear site data for the page, or run this in the browser console and reload:

```js
localStorage.removeItem('vartha_db'); localStorage.removeItem('vartha_session');
```

Because data lives only in the visitor's browser, each person sees their own copy. Nothing is shared between users or devices.

## Customising

- **Colours, radius, fonts** → CSS variables at the top of the `<style>` block (`:root`)
- **Grammar skills** → `SKILLS` array
- **Lessons and questions** → `LESSONS` array (explanation, examples, multiple-choice questions)
- **Diagnostic** → `DIAG_Q` array
- **Contests, communities, events, users** → the `SEED` object (clear `vartha_db` after editing it, since seed data is only loaded once)
- **Practice prompts** → `PRACTICE_PROMPTS`
- **Badges** → `SEED.achievements` and the `award()` calls

## Known limitations

This is a prototype, so several things are intentionally simple:

- **Not secure.** Passwords use a tiny demo hash (`hash()`), and all checks run in the browser. A real version must hash on a server with bcrypt or argon2, use real sessions, and enforce admin rights on the server.
- **No real backend.** Contest ranking, the leaderboard and "percentile" are simplified calculations on seeded data.
- **Simulated feedback.** Practice feedback comes from a simple rule-based function (`simulateFeedback`), not an AI model. It is a learning aid, not an IELTS score.
- **Placeholder actions.** Community/event filters, "Share", "Manage user" and the admin editors only show a toast for now.
- **Contact form** does not send anything; it just validates and shows a confirmation.

## Roadmap ideas

- Server API and database (auth, contests, leaderboard)
- Real speaking input (audio recording) and AI-assisted feedback
- Working filters for CO-LAB and ACT-LAB
- Admin editors for lessons, contests and events
- Email-based password reset and verification
- Shareable public profile pages

## Disclaimer

Vartalab is an educational practice platform. Weekly contests are practice contests for building skill and confidence and are not an official IELTS examination.

© COPYRIGHT 2026 Vartalab
