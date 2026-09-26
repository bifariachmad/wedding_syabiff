# PNG artwork and audio inventory

## Scene 1 additions — 25 September 2026

Sixteen active PNG assets follow the requested Don't Starve Together direction. The feedback revisions use a vibrant maroon/black room and door, illustrated knock marks, a separate left hand without hardware, moving cloud/tree layers, and independent paper/fire layers. Full built-in ImageGen prompts, original paths, alpha checks and alignment coordinates are in the four `artwork/arrival-generation*.json` manifests. Import scripts read the sibling `scene1-artwork`, `scene1-artwork-v2`, `scene1-artwork-v3`, and `scene1-artwork-v4` folders. Normal builds use committed optimized PNGs and do not need source-generation files. Cutouts have actual alpha; the room is opaque.

| File under public/assets/png/arrival | Role | Bytes |
|---|---|---:|
| room-open.png | Maroon cottage interior and empty morning doorway | 186746 |
| door.png | Independent ebony/maroon hinged door | 78258 |
| hand-short.png | Compact bent left forearm; hardware stays painted on door | 26234 |
| invitation-card.png | Independent card that burns while held | 82379 |
| burn-edge.png | Transparent illustrated ember edge over the dissolving paper | 18239 |
| knock-marks.png | Three ink-hatched wedges above the center of the door | 5907 |
| clouds.png | Slow drifting maroon/rose cloud layer inside doorway | 12338 |
| tree.png | Near/far swaying maroon trees clipped inside doorway | 23588 |
| envelope-floor.png | Sealed invitation at the threshold | 11419 |
| hands-envelope.png | POV hands holding the sealed envelope | 63156 |
| holding-hands.png | Separate foreground hands, unaffected by paper burning | 20877 |
| ink-portal.png | Transparent swirling ink ring | 51873 |

| ui-panel.png | Maroon torn-paper buttons and dialogue | 19354 |
| ui-divider.png | Ink-cut progress and heading strip | 3509 |
| ui-sound-on.png | Cutout music badge | 4380 |
| ui-sound-off.png | Matching crossed-note mute badge | 4104 |

The sixteen active Scene 1 assets total 612,361 bytes. Superseded hand-door, hand-grip, hand-left, hands-card, and three bright storybook alternatives are retained but not loaded. The project inventory contains 74 raster files. `scripts/import-arrival-v4.mjs` imports the short hand, separate holding hands and four UI assets. The hand contact point is (951,477) in its 1254×1254 source canvas. Hands retain the original 1536×1024 canvas alignment; paper alone is clipped during burning.
The latest user direction replaces the original SVG requirement. All shipped illustrations are PNGs. Twenty-nine artworks were generated from the Biff reference style; eighteen icons, textures, and templates were drawn procedurally on Canvas. Three brand icons and the Open Graph image bring the raster inventory to 51. No SVG illustrations are used.

Prompts and original generation paths: `artwork/sources.json`. The user explicitly authorized code to remove baked checkerboard backgrounds. `scripts/import-art.mjs` performs that cleanup and palette optimization. The final optimized cutouts ship in this repository; normal builds never require the original generator files. Motion targets are HTML classes or `data-layer` values, not internal image IDs. A few complete alternate kit assets are retained but not loaded by the invitation.

| File under public/assets | Depicts | Section/use | Motion layer | Bytes |
|---|---|---|---|---|
| png/arch-roses.png | Adult Biff-inspired groom and original adult bride beneath roses | 1,5 | cover-couple, timeline-art | 153130 |
| png/bare-tree.png | Ink tree silhouette | 8 | closing-tree | 36117 |
| png/bat.png | Flying bat | 1 | cover-bat | 17562 |
| png/book-quill.png | Open book and feather quill | 5 | timeline-art | 28963 |
| png/candle.png | Taper candle and holder | 5 | wax-drip, timeline-art | 15508 |
| png/chains.png | Chain and padlock | 0 | chain | 9191 |
| png/clock.png | Antique clock showing arrival time | 3 | face | 30563 |
| png/cloth-swatch.png | Draped maroon cloth | 6 | cloth | 36921 |
| png/curtain.png | Maroon stage curtains | 5 | timeline-art | 39420 |
| png/fold-lines.png | Faint paper creases | All paper scenes | static texture | 9505 |
| png/frame-border.png | Alternate ornate frame | Asset kit | static alternate | 27223 |
| png/gate-environment.png | Painted nocturnal courtyard | 0 | static environment | 255819 |
| png/gate.png | Cutout iron gate | 0,5 | gate-left, gate-right | 142064 |
| png/icon-calendar.png | calendar UI symbol | Controls | static icon | 919 |
| png/icon-check.png | check UI symbol | Controls | static icon | 1163 |
| png/icon-close.png | close UI symbol | Controls | static icon | 844 |
| png/icon-download.png | download UI symbol | Controls | static icon | 802 |
| png/icon-minus.png | minus UI symbol | Controls | static icon | 445 |
| png/icon-music-off.png | music off UI symbol | Controls | static icon | 1461 |
| png/icon-music-on.png | music on UI symbol | Controls | static icon | 1459 |
| png/icon-pin.png | pin UI symbol | Controls | static icon | 2417 |
| png/icon-plus.png | plus UI symbol | Controls | static icon | 603 |
| png/icon-share.png | share UI symbol | Controls | static icon | 1777 |
| png/ink-splatter.png | Procedural ink flecks | Asset kit | static texture | 2970 |
| png/iron-fence.png | Repeating wrought iron fence | Asset kit | static alternate | 11984 |
| png/key.png | Ornate key | 2 | greeting-key | 12400 |
| png/lantern.png | Warm hanging lantern | 0,7,8 | lantern-body, glow, reservation-lantern, closing-lantern | 13718 |
| png/long-table.png | Banquet table with candles | 5 | timeline-art | 28104 |
| png/map-card.png | Decorative venue map | 4 | map-art; separate route-path and pin | 93045 |
| png/mask-torn-edge.png | Procedural torn-paper strip | Asset kit | static mask | 4610 |
| png/moon.png | Crescent moon | 8 | closing-moon | 27107 |
| png/ornament-corner.png | Rose corner ornament | 1 | top-left, top-right | 14565 |
| png/ornament-divider.png | Symmetric ink divider | 1,2,5 | divider | 6843 |
| png/paper-filter.png | Seeded fine paper grain | All paper scenes | static texture | 52383 |
| png/pendulum.png | Separate clock pendulum | 3 | pendulum | 7641 |
| png/petal.png | Maroon rose petal | 1,6,7 | cover-petal, petal-1, stamp-petal | 21700 |
| png/photo-frame-camera.png | Vintage frame and camera | 5 | timeline-art | 42387 |
| png/raven-flight.png | Raven in flight | 5,8 | raven-wing | 20537 |
| png/raven.png | Perched raven | 0,5 | raven-head, timeline-art | 36052 |
| png/rose-wilted.png | Wilted rose | 2,6 | greeting-rose, dresscode-rose | 30821 |
| png/scanner-frame.png | PNG camera scan corners | Admin | scanner-overlay | 2212 |
| png/stain-coffee.png | Faint old-paper ring stain | 2 | static texture | 11220 |
| png/stars.png | Eight paper stars in six independently revealed regions | 8 | stars-0 through stars-5 | 5395 |
| png/ticket.png | Empty ticket composition template | Asset kit | live ticket is rendered with HTML and canvas | 6915 |
| png/violin.png | Acoustic violin | 5 | timeline-art | 34336 |
| png/wax-seal.png | Maroon B & S wax seal | 1,7 | cover-seal, ticket-seal | 42119 |
| png/wine-glass.png | Maroon welcome-drink glass | 5 | timeline-art | 21678 |
| favicon-32.png | Lantern brand icon | Metadata | static | 920 |
| apple-touch-icon-180.png | Lantern brand icon | Metadata | static | 6347 |
| icon-512.png | Lantern brand icon | Metadata | static | 35424 |
| og-image.png | 1200 × 630 illustrated share preview | Metadata | static | 526770 |

## Audio

All audio is original Web Audio synthesis in `src/audio.js`: a periodic 60-second ambient loop, knocking, latch click, door/gate creaks, footsteps, paper pickup/rustle, chain rattle, seal thump, ignition, crackling fire, portal swell, UI tick and success chime. The portal starts after the paper is fully consumed. Audio starts on a gesture, observes the saved mute preference, and suspends when the page is hidden. `CONFIG.BGM_SRC` optionally replaces the ambient loop.

## Fonts and review

Self-hosted Latin WOFF2: UnifrakturCook 700, IM Fell English 400, Special Elite 400. Open font licenses are included in `public/assets/fonts`.

`/assets-preview.html` shows all 47 main PNG assets at 1× and 2× against paper and ink. Dark UI icons receive the same light treatment used on dark buttons. Every illustration was visually reviewed, including a full correction pass replacing checkerboard backgrounds with real alpha. Review sheets and mobile section screenshots are under `artifacts/` locally. The 400 × 210 Open Graph reduction was also inspected.

## Scene 2 — Morning courtyard

Two built-in ImageGen PNGs, imported with scripts/import-courtyard.mjs. Sources are in ../scene2-artwork; exact prompts are in artwork/courtyard-generation.json. morning-garden.png is opaque, 1024×1536, 353,396 bytes. gate-pair.png is genuinely transparent, 1000×1000, 161,173 bytes. Total additional PNG weight: 514,569 bytes; project inventory: 76 raster files. Existing tree, cloud and rose cutouts are reused for independent motion. Images load near the portal transition rather than at initial arrival.

GALVANIZED Regular by UI Creative is embedded for the couple names in this personal wedding invitation. Original TTF and supplied personal-use EULA are in public/assets/fonts. Source: https://www.1001fonts.com/galvanized-font.html. Font files are unmodified.

## Scene 3 — Welcome hall

Two built-in ImageGen assets imported by scripts/import-welcome.mjs: welcome-hall.png (347,856 bytes) and manor-door.png (330,492 bytes). Sources and exact prompts are in ../scene3-artwork and artwork/welcome-generation.json. Door alpha is genuine; its two halves hinge independently. Existing arch-roses.png and candle.png are reused. Added PNG weight: 678,348 bytes; project raster inventory: 78 files.
# Scene 3 replacement assets

Exterior facade: scene3-artwork-v2/manor-exterior.png. Front-facing medium-height game-style characters: scene3-artwork-v4/bifari-front.png and syafira-front.png. Installed in public/assets/png/welcome. Built-in ImageGen prompts: artwork/welcome-generation-v2.json and artwork/welcome-generation-v4.json. Alpha cleanup authorized by the user; enclosed white eyes must remain opaque. Previous anime character variants are replaced in Scene 3.

# Clock-room and motion assets

Built-in ImageGen sources: ../scene4-artwork. Installed PNGs in public/assets/png/clockroom: clock-room, garden-shrub, bifari-speaking, syafira-speaking, plus composited speaking-closed frames. Exact prompts and mouth-patch verification: artwork/clockroom-generation.json. Matched facade and door leaves were extracted from the original facade without redrawing; registration and reconstruction proof: artwork/matching-door-layers.json and ../scene3-door-layers. These new layers replace the unrelated opening door artwork.
# Map-room and raven frames

Built-in ImageGen sources in ../scene5-artwork: raven-up.png, raven-down.png (aligned1024x1024 alpha sprites), map-room.png (1024x1536 opaque). Exact prompts: artwork/maproom-generation.json. Installed under public/assets/png/maproom. Ground shadows derive from existing character alpha silhouettes; import-maproom.mjs reproduces the assets. Full-canvas gate PNGs are exact source partitions from ../scene2-gate-layers; hinge metadata in artwork/gate-layer-registration.json.

# Scene 6 agenda
Built-in ImageGen source: ../scene6-artwork/agenda-desk.png. Installed optimized PNG: public/assets/png/agenda/agenda-desk.png. Exact prompt: artwork/agenda-generation.prompt.txt. The blank book supports accessible HTML agenda text and eight page-turn transitions, preserving the configured schedule.

# Scene 7 wardrobe
Built-in ImageGen source and exact prompt: ../scene7-artwork/dressing-alcove.png and dressing-alcove.prompt.txt. Installed optimized PNG: public/assets/png/wardrobe/dressing-room.png. Prompt copied to artwork/wardrobe-generation.prompt.txt. Existing cloth-swatch.png is reused as the animated maroon reveal.
