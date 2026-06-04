# LUMAR Visuals Landing

<design_plan>
Python RNG Execution:
- seed = len(prompt) % 97 = 81
- hero = Artistic Asymmetry, font = Outfit-style bold condensed, components = Bento Grid + Pinned Process Story + Lead Capture Form, GSAP = Image Scale/Fade + Pinned Split
- palette = Lava, Aqua, Lemon, Fuchsia, Cream from the latest LUMAR brandkit

AIDA Check:
- Navigation: floating glass pill with direct CTA
- Attention: bold hero with high-contrast CTA and vivid image collage
- Interest: dense gapless bento services grid
- Desire: pinned process story explaining consult to quote to booking
- Action: form for meeting, pricing consultation and session booking path

Hero Math Verification:
- H1 uses max-width 1040px and clamp(4rem, 8.1vw, 8.3rem)
- H1 is two statement lines by markup, no floating stamp icons, no raw hero stats, no tag spam

Bento Density Verification:
- Desktop grid is 6 columns with grid-auto-flow: dense
- Row one: service-1 spans 3 columns x 2 rows, service-2 spans 3 columns x 1 row
- Row two: service-1 continues 3 columns, service-3 + service-4 + studio-note occupy 2 + 2 + 2 columns after dense packing
- No blank corner or dead cell remains in the bento layout

Label Sweep & Button Check:
- No SECTION 01, QUESTION 05, ABOUT US style labels are visible
- CTA buttons use lemon on ink or white on ink with high contrast
</design_plan>

## What this project contains

- React + Vite landing page for LUMAR Visuals.
- GSAP/ScrollTrigger motion for hero, reveal, image scale and pinned process story.
- Lead capture form designed to collect the relevant data for a price consultation.
- Express API that validates the form, saves every lead as JSON and sends email when SMTP is configured.

## Run locally

```bash
npm install
cp .env.example .env
npm run start
```

Frontend:

```text
http://localhost:5173
```

API:

```text
http://localhost:8787/api/health
```

## Configure real email delivery

Edit `.env`:

```bash
LUMAR_INQUIRY_EMAIL=hello@lumarvisuals.es
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="LUMAR Visuals <hello@lumarvisuals.es>"
```

Without SMTP, the API still stores leads in `leads/` and returns HTTP 202 with `emailSent: false`.

## Form fields

The form captures:

- Full name
- Email
- Phone or WhatsApp
- Instagram or website
- Requested service
- Location
- Preferred date
- Estimated budget
- Meeting preference
- Project brief
- Consent

## Production note

For deployment, run:

```bash
npm run build
npm run server
```

Then serve `dist/` with your hosting provider and keep the API server running with the `.env` SMTP values configured.
