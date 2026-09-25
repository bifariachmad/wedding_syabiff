# PNG artwork and audio inventory

## Scene 1 additions — 25 September 2026

Seven built-in generated assets follow the requested Don't Starve Together direction. Full prompts, original paths, alpha checks and composition coordinates: `artwork/arrival-generation.json`. `scripts/import-arrival.mjs` imports final source layers from the sibling `scene1-artwork` folder. Normal builds use committed optimized PNGs and do not need source-generation files. The six cutouts have actual alpha; the room is opaque.

| File under public/assets/png/arrival | Role | Bytes |
|---|---|---:|
| room-open.png | Cottage interior and empty morning doorway | 260646 |
| door.png | Independent hinged wooden door | 101403 |
| hand-door.png | Guest's hand reaching for the handle | 10926 |
| envelope-floor.png | Sealed invitation at the threshold | 11419 |
| hands-envelope.png | POV hands holding the sealed envelope | 63156 |
| hands-card.png | POV hands with the opened invitation | 59580 |
| ink-portal.png | Transparent swirling ink ring | 51873 |

The seven additions total 559,003 bytes. Three earlier bright storybook alternatives are retained but not loaded. The original inventory below describes the earlier invitation kit; with these additions and those three alternatives, there are 61 raster files.

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

All audio is original Web Audio synthesis in `src/audio.js`: a periodic 60-second ambient loop (drone, wind, sparse chimes), gate creak, chain rattle, wax-seal thump, page rustle, UI tick, and success chime. It starts on a gesture, observes the saved mute preference, and suspends when the page is hidden. `CONFIG.BGM_SRC` optionally replaces the ambient loop.

## Fonts and review

Self-hosted Latin WOFF2: UnifrakturCook 700, IM Fell English 400, Special Elite 400. Open font licenses are included in `public/assets/fonts`.

`/assets-preview.html` shows all 47 main PNG assets at 1× and 2× against paper and ink. Dark UI icons receive the same light treatment used on dark buttons. Every illustration was visually reviewed, including a full correction pass replacing checkerboard backgrounds with real alpha. Review sheets and mobile section screenshots are under `artifacts/` locally. The 400 × 210 Open Graph reduction was also inspected.
