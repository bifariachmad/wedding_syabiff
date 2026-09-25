# Dua Jiwa, Satu Lentera

Full-screen visual-novel wedding invitation for Achmad Bifari & Syafira Aulia, 31 October 2026, 09:30–13:40 WIB, Lumbung Kuliner. Vite, vanilla JavaScript, GSAP, and original dark PNG artwork in the supplied Biff reference style.

The invitation starts with **Scene 1 — Sebuah Undangan**, a first-person opening in the requested Don't Starve Together visual direction, with vibrant maroon and black PNG artwork. Seven reading stops cover the quiet room, reaction after three knocks, empty doorway, two separate thoughts while looking down, a personalized envelope, and the opened invitation. The next action enters the ink portal. Kembali returns to the previous stop; returning from the gate reopens the card. Dialogue types in after each action and waits for the guest. The chapter title stays above the scene; bottom navigation is Kembali, a centered page number, and Lanjut.

The portal connects to the existing 16-scene invitation. **Kembali** and **Lanjut** are the only story navigation, fixed at the bottom. Each rundown item is its own scene. Wheel and swipe do not advance the story. Reduced motion uses short fades. Form/ticket overflow is contained inside the dialogue for small screens and the on-screen keyboard; the page itself does not scroll. Reservation, Maps, music and download buttons remain functional actions. The later proposed Scene 2–9 redesign is not part of this Scene 1 implementation.

## Run locally

Install Node.js 22.12 or later. In this `invitation` folder:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/`. Add `?to=Nama+Tamu` for personalization. `/admin` is for registration staff; `/assets-preview.html` is the PNG contact sheet. `npm run build` produces `dist`; `npm run preview` serves it on port 4173.

Changeable details are in `src/config.js`. `APPS_SCRIPT_URL` stays empty until you deploy your backend. The form reports failure until configured; it never invents a successful reservation. The Sites preview is owner-private. Use the Vercel steps below for guest access.

## Google Sheets and Apps Script setup

1. Sign in to the Google account that should own the guest list. Create a blank Sheet named **Dua Jiwa — Reservasi**. Keep the Sheet private.
2. In the Sheet, choose **Extensions → Apps Script**. Name the project **Dua Jiwa Reservations**.
3. Replace its `Code.gs` with this project's complete `apps-script/Code.gs`. Save.
4. In the function selector beside Run, choose **setup**, then **Run**. Review and authorize access to your own Sheet. This creates `Reservations` with the eight required columns and records its spreadsheet ID.
5. Open **Project Settings → Script Properties**. Copy the generated `ADMIN_PIN` for staff, or replace its value with a strong private PIN. Leave `SHEET_ID` unchanged. Never put the PIN in website config. [Script Properties guide](https://developers.google.com/apps-script/guides/properties).
6. Choose **Deploy → New deployment**, select the gear/type menu, and choose **Web app**. Set **Execute as: Me** and access to **Anyone**, including signed-out guests. Deploy and authorize. If anonymous access is unavailable under your Workspace policy, your administrator must permit it or you must use an account that allows it. [Google web app guide](https://developers.google.com/apps-script/guides/web).
7. Copy the URL ending in `/exec`, not `/dev`. Paste it into `APPS_SCRIPT_URL` in `src/config.js`.
8. Test a reservation from the invitation and confirm one Sheet row. Submit the same name with changed case/spacing and count: it must update the same row and QR ID. Open `/admin`, enter the PIN, find or scan the ticket, press **Tandai Hadir**, and confirm the check-in columns update. Remove only your test rows afterward, leaving the header.

The endpoint uses POST; opening its URL directly is not a reservation test. The client sends JSON as `text/plain;charset=utf-8` and follows Google's response redirect. Do not make the Sheet public to resolve an endpoint access issue.

For later script changes, save and choose **Deploy → Manage deployments → Edit → New version → Deploy**. Updating that deployment preserves its `/exec` URL. `setup()` preserves existing data and PIN. Changing `MAX_GUESTS` requires running the build and copying the synchronized backend code into Apps Script before redeploying it.

## Vercel and the final guest URL

1. Put the source in a Git repository under your account. In Vercel choose **Add New → Project** and import it. Select Root Directory **invitation** if your repository includes the surrounding folder; otherwise use the repository root.
2. Select **Vite**, build command `npm run build`, output `dist`, and deploy. Included `vercel.json` handles `/admin` and headers. [Vercel's Vite guide](https://vercel.com/docs/frameworks/frontend/vite).
3. Copy the resulting HTTPS URL into `CONFIG.BASE_URL`, without a trailing slash. For a custom domain, configure that domain in the hosting dashboard and use it instead.
4. Confirm `APPS_SCRIPT_URL` contains your `/exec` URL. Commit and redeploy. The build sets the absolute share-image URL; sharing and calendar downloads use `BASE_URL`.
5. In a signed-out browser, repeat reservation → ticket → check-in using two devices. Check the registration phone's camera. Then send personalized links such as `https://your-domain/?to=Nama+Tamu`.

## Music and event-day use

Original ambient music and six effects are included. To replace the ambient loop, put your licensed file in `public/audio/`, set `BGM_SRC: '/audio/your-file.mp3'`, and rebuild/redeploy. Leave it empty to keep the generated 60-second loop. Audio starts after a gesture, has a visible toggle, remembers the choice, and suspends when the page is hidden.

Open `/admin` on HTTPS, enter the private PIN, and choose **Pindai QR**. Confirm name/count, then **Tandai Hadir**. Use manual code or name search if the camera is unavailable. **Muat Ulang** refreshes the list; **Ekspor CSV** downloads it. Loaded names remain searchable during connection loss, but check-in needs a successful server response. There is no offline write queue. The PIN lives only in page memory and clears on logout/reload.

## Project map

```text
invitation/
  src/                 config, invitation, PNG layers, motion, audio, tickets, admin
  public/assets/png/   generated artwork, textures, controls
  public/assets/fonts/ WOFF2 and licenses
  public/assets/       favicons, share image, manifest
  public/assets-preview.html
  apps-script/Code.gs
  artwork/             image prompts, original paths, share-image source
  scripts/             asset generation, cleanup, review
  tests/               backend harness and browser checks
  artifacts/           local screenshots and verification reports
  ASSETS.md
  DECISIONS.md
  VERIFICATION.md
  vercel.json
```

## Tests and asset maintenance

`npm test` executes the actual `Code.gs` using in-memory Google service adapters. With the dev server running, `npm run verify` checks all 16 scenes forward/back at three widths, two-button navigation, no page scrolling, inactive-scene focus isolation, depth motion, validation, QR, ticket PNG, calendar, updates, recall, network failure and admin. Test API interception exists only in the test runner. `node scripts/review-novel.mjs` captures mobile, short-screen and desktop scene reviews. See `VERIFICATION.md` for results and limitations.

`node tests/arrival.mjs` checks the seven-page opening, actual audio scheduling before dialogue, moving clouds, top heading, centered page number, normal/reduced motion, portrait/landscape layouts, personalized plain text, click locking, portal exit, and reverse/replay. `node scripts/review-arrival.mjs` captures its static storyboard states. Source is in `src/prologue.js`, `src/prologue-markup.js`, and `src/prologue.css`. Ten active PNG assets live in `public/assets/png/arrival/`; the old reaching-hand alternate remains unused. Prompts and geometry are in `artwork/arrival-generation.json` and `artwork/arrival-generation-v2.json`. The gripping hand is aligned by its brass mounting plate and stays attached to the hinged door during opening. Clouds drift and two tree layers sway inside the doorway.

Final PNGs are committed; normal builds need no image-generation service. `npm run assets` repeats cleanup and procedural generation on the original machine. `artwork/sources.json` records full prompts and source paths; on another machine use the committed PNGs or update those paths. `npm run assets:review` refreshes the contact sheet. With the dev server running, `node scripts/generate-og.mjs` regenerates the share image. Browser scripts use a Windows Chrome path; adjust it on another OS.
