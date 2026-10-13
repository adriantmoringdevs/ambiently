# Handoff: Ambient redesign (Nocturne theme, environment scenes)

## Overview
A full visual and UX redesign of **Ambiently** (`adriantmoringdevs/ambiently`, React + Vite, CSS Modules, Flask API). It covers Home, Sound Environment, Search and Login. New in the redesign:
- the Nocturne theme
- a persistent mini-player
- a ring sleep timer with presets
- code-drawn animated scenes for each curated environment
- tag-tinted saved-sound tiles
- a sticky/parallax hero on Home
- infinite scroll on Search, kept from the original

## About the design files
`Ambient Redesign v2.dc.html` is a **design reference built in HTML**. It's a working prototype that shows the intended look and behavior. It is not production code to copy. Recreate it in the existing React app with its current patterns: React Router pages, `components/`, `context/`, `hooks/` and `*.module.css`. Data, audio and auth stay wired to the existing Flask endpoints. The prototype fakes them.

Open the file in a browser. A strip at the top switches screens.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii and interactions are final. Match them closely.

## Suggested implementation order
1. **Tokens and fonts.** Paste the `:root` block from `styles.css` (bundled here) into `src/index.css`. Delete the old commented-out Vite boilerplate and `App.css`. Add the Google Fonts link (`family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600&family=Spline+Sans+Mono:wght@400;500`). Override the font tokens: `--font-heading` and `--font-body` become `"Bricolage Grotesque", system-ui, sans-serif`, and add `--font-mono: "Spline Sans Mono", ui-monospace, monospace`. and Phosphor icons (`npm i @phosphor-icons/react`) in `index.html`.
2. **Logo.** Replace `ambient_logo_nav.svg` with a flat version: an outer ring stroke in `--color-accent` at 45% opacity, an orb filled with `--color-accent`, and waveform bars in `--color-bg`. Remove all gradients and the `<text>` wordmark. The wordmark becomes live text: "Ambient", Bricolage Grotesque 500, 21px. `ambient_logo.svg` (the hero) is no longer used.
3. **NavBar.** Restyle `NavBar.jsx` / `NavBar.module.css` (see Layout).
4. **Audio state.** Move the `<audio>` element and its play/pos/duration/loop/volume state out of `AudioPlayer.jsx` into `AudioContext`. This lets the **MiniPlayer** (new component, rendered once in `App.jsx` outside `<Routes>`) and the Environment page control the same audio. Move the sleep timer (`useSleepTimer`) into the same context so the mini-player can show the countdown.
5. Build the **Home**, **SoundEnvironment**, **SoundSearch** and **LoginPage** layouts.
6. Add **`EnvironmentScene.jsx`**, a `<canvas>` component. Port the `SCENES` / `parts()` / `rng()` code from the prototype's logic class as-is. It's plain canvas 2D.

## Design tokens (Nocturne, from `styles.css`)
- Background `--color-bg` #161826 · Surface `--color-surface` #232532 · Text `--color-text` #e9e9ed · Accent `--color-accent` #9184d9
- Muted text `--color-neutral-400` #b2b6ca · Neutral-200 #e4e7f5 · Neutral-300 #cfd3e5 · Neutral-500 #9397ab
- Divider `--color-divider` = #e9e9ed at 16% · Accent-800 #423a6a (tag fill) · Accent-100 #f5f4ff (tag text)
- Fonts: **Bricolage Grotesque** for all UI (headings at weight **500**, never bolder; body 400; tight negative letter-spacing on large headings as specified). **Spline Sans Mono** for times, durations, timer digits and preset chips. These replace Nocturne's default Inter.
- Radius: 6px tags, 8px buttons/inputs, 10–12px tiles, 14px panels, 16px scene hero
- Shadows: edges are `box-shadow: 0 0 0 1px var(--color-divider)`. The login card adds `0 16px 40px rgba(0,0,0,.35)`.
- **Rules fade at both ends:** `height:1px; background: linear-gradient(to right, transparent, var(--color-divider) 48px, var(--color-divider) calc(100% - 48px), transparent)`
- **Buttons are outlined, never filled.** Primary is a 1px accent border, accent text and a transparent background. Hover is the accent at 12% (`color-mix`). Secondary is a 1px divider border with text color and a text-color hover at 7%.
- Focus: `:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px }`
- Category tints (scene tiles, saved tiles, mini-player icon):
  - storm #2f3648
  - rain #33415a
  - fire #4d3529
  - night #29324a
  - birds #3b3f37
  - forest #2f4235
  - water #2a4340
  - wind #4c4035
  - sea #2a4150
  - noise #383a46
  - fallback #323449

## Layout (global)
- Content column `max-width:1224px; margin:0 auto; padding:0 32px`.
- **Header:** sticky at top, 64px tall, background = bg at 86% with a 12px backdrop blur, faded rule underneath.
  - Left: logo (30px) and wordmark.
  - Right: links Home / Search / About at 14px, 8px 12px padding, muted color. The active link uses the text color plus a 2px accent underline bar inset 12px.
  - Signed in: a 26px avatar circle and the username (13px muted), then a "Log out" ghost button.
  - Signed out: an outlined "Sign in" button, 36px tall.
- **MiniPlayer:** sticky at bottom on every route except /login. It has a 2px progress line along the top edge (accent fill), then a 68px row containing:
  - a 40px outlined circular play/pause button
  - a 36px category-tint square with the category icon
  - the name (14px/500) and "by user" (12px muted); clicking either opens the environment
  - "0:42 / 3:02" in mono 12px
  - a spacer
  - a timer chip: mono, shows "Timer", "mm:ss" or "Done"; accent when active; opens the environment
  - a loop icon button (accent when on)

## Screens

### Home (`pages/Home.jsx`)
- **Hero** (max-width 640, starts 56px below the header):
  - Kicker "SOUNDSCAPES FOR STUDY, SLEEP & FOCUS": 11px, letter-spacing .14em, uppercase, accent.
  - H1 "Step into a sound. Let the room disappear.": `clamp(40px,5.2vw,60px)`, line-height 1.04, letter-spacing -.02em, `text-wrap:balance`.
  - Paragraph: 16px, muted.
  - Filter input: 44px tall, magnifying-glass icon at left 14px, surface background, divider border. Next to it, "8 of 8" in 12px muted.
- **Sticky + parallax hero:** the hero is `position: sticky; top: 96px; z-index: 0`. The content below it sits in a wrapper with `position:relative; z-index:2; background: var(--color-bg); box-shadow: 0 -48px 48px var(--color-bg); margin-top:72px; padding-bottom:64px`, which gives a soft overlap edge. On scroll, compute `p = clamp(scrollY/380, 0, 1)` and set:
  - `transform: translateY(-36p px) scale(1 - 0.05p)`
  - `opacity: 1 - 0.85p`

  Update in a passive scroll listener or rAF. Set the styles directly on the element through a ref; don't use React state.
- **Environments grid:** `grid-template-columns: repeat(auto-fill, minmax(220px,1fr)); grid-auto-rows:190px; grid-auto-flow:dense; gap:14px`.
  - The **featured tile** is the last-played curated environment (spans 2 columns × 2 rows). It has:
    - a 44px icon circle (text color at 9%)
    - a "NOW PLAYING" or "LAST PLAYED" tag (accent-800 fill, accent-100 text, 6px accent dot)
    - the name at `clamp(36px,4vw,52px)`
    - "by user"
    - 4 `#tag` chips (11px, text color at 9%, neutral-300 text)
    - an "Enter environment →" outlined pill, 40px, nowrap
  - **Small tiles:** a 36px icon circle, the name at 22px and "by user". The whole tile is clickable; there's no play button.
  - Every tile has the background `linear-gradient(160deg, <category tint> 0%, var(--color-surface) 85%)`, a 1px divider ring (accent while it's playing), 12px radius, and on hover `translateY(-2px)` plus an accent ring.
  - The last cell is a dashed-border "Find more sounds" tile that links to /search.
  - While a filter is active, the featured tile is dropped and every match shows as a small tile. Filtering matches the name or tags.
- **Your saved sounds:** a grid of `minmax(220px,1fr)`. Each tile is 120px tall with a flat category-tint background (no gradient) and holds:
  - the icon (20px, neutral-200)
  - the category label (11px, neutral-300)
  - the name (18px/500)
  - "by user · 4:23"

  The category comes from regex matching on the name and tags (see `CATS` in the prototype). Signed out, an outlined box shows "Keep the sounds you find." and a sign-in button.

### Sound Environment (`pages/SoundEnviroment.jsx`)
- A "← All environments" link (14px, muted).
- **Scene hero:** `height: clamp(340px, 54vh, 540px)`, 16px radius, divider ring.
  - A full-size `<canvas>` with a bottom scrim: `linear-gradient(to top, rgba(14,15,24,.88) 0%, rgba(14,15,24,.35) 38%, transparent 62%)`.
  - Top row: two blurred chips: "IMMERSIVE SOUNDSCAPE · RAIN" on the left, and "Scene live" or "Scene resting — press play" with a status dot on the right.
  - Bottom-left: the H1 name at `clamp(44px,6vw,84px)`, then "Recorded by user" and 4 tags.
  - Bottom-right: a 72px outlined play/pause circle on a blurred dark background.
- Below the hero, a 2-column grid (`auto-fit, minmax(380px,1fr)`, gap 20).
  - **Playback panel:**
    - Title, and "0:42 / 3:02" in mono.
    - A 64-bar waveform, 72px tall. Bars before the playhead are accent, the rest are text color at 18%. Clicking a bar seeks to it.
    - A loop toggle chip, then a volume range input with `accent-color`.
    - Helper copy.
  - **Sleep timer panel:** grid `auto-fit, minmax(200px,1fr)`.
    - **The ring:** a 200px SVG with r=112, rotated -90°. The track is a 2px divider stroke and the progress is a 7px accent stroke with round caps. Use `dasharray 703.7` and `dashoffset = C × (1 − left/total)` with a 1s linear transition. While idle, the ring previews total/60min.
    - **Centre of the ring:** mono 42px digits, with a sub-label of "25 minutes", "Stops at 11:42 PM" or "Paused".
    - **Header:** the "Sleep timer" title and a status tag (OFF / RUNNING / PAUSED / COMPLETE).
    - **Idle controls:** −5 / 15m 25m 45m 60m / +5 (34px). The selected preset gets an accent border. Below them is "Start timer" (outlined, 42px). The range is clamped to 5–120 min.
    - **Running:** Pause/Resume and Cancel.
    - **Done:** a moon icon, "Session complete" and a Dismiss button.
    - Starting the timer also starts playback. When it expires, playback stops (the existing `onExpire`).

### Scenes (`components/EnvironmentScene.jsx`)
- The canvas fills its parent and resizes to `clientWidth × devicePixelRatio` every frame.
- A single rAF loop advances scene time **only while audio is playing**, so the scene freezes when paused.
- Curated id → scene:
  - rain → rain on a window: streaks, sliding drops, bokeh
  - fireplace → fire: flickering flame blobs, glow, embers
  - beach → moonlit sea: wave lines, moon reflection
  - crickets → night field: stars, swaying grass, fireflies
  - birds → dawn: rays, layered hills, flapping birds
  - thunder → storm: drifting clouds, slanted rain, periodic flash
  - stream → flowing ripples, sparkles, stones
  - desert → dunes, sun glow, blowing sand
- Saved and search sounds get `fallback`: their category tint plus a drifting waveform.
- An intensity multiplier `k` (default 1) scales all alphas.
- Respect `prefers-reduced-motion` by drawing a single frame.
- Port the drawing code verbatim from the prototype.

### Search (`pages/SoundSearch.jsx`)
- **Hero:** kicker "THE FREESOUND LIBRARY", H1 "Search sounds", a paragraph, then a 48px input and an outlined "Search" button.
- **Results header:** `Results for "rain"`, with "N of 236 loaded · scroll for more · 2 saved" on the right. A faded rule follows.
- **Rows:** `grid-template-columns: 40px minmax(0,2fr) minmax(0,1.3fr) 56px 136px; gap:16px; padding:12px 10px`. Rows are separated by a faded rule at 8% text color.
  - Columns: a preview button (36px outlined circle; pause icon and a 16% accent fill while playing), name (15px/500, ellipsis), "by user", 2 tags, mono duration, then the Save button.
  - The current row's background is accent at 6%.
- **Save:** opens an inline panel under the row with a name input (accent border, prefilled), "Save to my sounds" and Cancel. Saved rows show a filled bookmark and "Saved". When signed out, Save routes to /login.
- **Infinite scroll:** keep the existing IntersectionObserver sentinel logic, and add:
  - 3 skeleton rows plus "Loading the next 20 sounds…" while loading
  - the end message "You've reached the end of the soundscape." with a waveform icon
- Fix while porting: `handleSearch` currently calls `fetchSounds(submittedQuery, 1)` with the *previous* query. Use `query` instead.
- Previews play through the shared mini-player instead of the inline AudioPlayer section.

### Login (`pages/LoginPage.jsx`)
- Two columns (`auto-fit, minmax(380px,1fr)`, gap 48).
  - **Left:** the 112px logo, the H1 "Put on a soundscape. Breathe deeper. Stay awhile.", and the paragraph "An account keeps your saved Freesound recordings with you across sessions."
  - **Right:** a card (max 400px, 28px padding, 14px radius). It holds:
    - a segmented Log in / Sign up control; the active segment gets an inset 1px accent ring and accent text
    - labelled Username and Password inputs (44px, bg fill)
    - an outlined submit button, 46px ("Log in" / "Create account")
    - a 12px helper line
- Keep the existing error messages, shown in 12px under the inputs.

## State (beyond what exists)
- `AudioContext`: `current`, `lastPlayed`, `playing`, `pos`, `duration`, `loop`, `volume`, and the play/toggle/seek functions.
- Sleep timer in context: `total`, `left`, `running`, `started`. Derived: `done = started && left === 0`.
- Home: `filter`. Search: `query`, `submitted`, `page`, `loading`, `hasMore`, `saveOpenId`, `saveName`.

## Assets
- Icons: Phosphor (`@phosphor-icons/react`) — MagnifyingGlass, Play/Pause (fill), ArrowLeft/Right, Repeat, SpeakerSimpleHigh, Timer, Minus, Plus, MoonStars, BookmarkSimple, CircleNotch, Waveform, CloudRain, CloudLightning, Fire, Bird, Tree, Drop, Wind, Waves.
- No images are needed; all scenes are canvas-drawn.

## Files in this bundle
- `Ambient Redesign v2.dc.html`: the prototype. Its logic class holds the scene code, category map and timer logic.
- `styles.css`: Nocturne tokens and component classes.
