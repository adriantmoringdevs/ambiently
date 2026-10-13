import {
  Bird,
  CloudLightning,
  CloudRain,
  Drop,
  Fire,
  MoonStars,
  Tree,
  Waveform,
  Waves,
  Wind,
} from "@phosphor-icons/react";

// Curated Freesound id -> code-drawn scene (see server/app.py CURATED_SOUNDS).
export const CURATED_SCENES = {
  126152: "beach",
  467129: "fire",
  346562: "rain",
  265567: "night",
  410742: "birds",
  577846: "thunder",
  733199: "stream",
  156414: "desert",
};

// Category tints, icons and labels. Order matters: first regex match wins.
export const CATS = {
  thunder: { re: /thunder|storm|lightning/, tint: "#2f3648", icon: CloudLightning, label: "Storm" },
  rain: { re: /rain|shower|drizzle|drip|monsoon|cloudburst|gutter|puddle/, tint: "#33415a", icon: CloudRain, label: "Rain" },
  fire: { re: /fire|burn|crackl|ember|chimney/, tint: "#4d3529", icon: Fire, label: "Fire" },
  night: { re: /cricket|insect|night/, tint: "#29324a", icon: MoonStars, label: "Night" },
  birds: { re: /bird|dawn|chirp/, tint: "#3b3f37", icon: Bird, label: "Birds" },
  forest: { re: /forest|tree|wood|leaves|pine/, tint: "#2f4235", icon: Tree, label: "Forest" },
  stream: { re: /stream|river|creek|lake|water/, tint: "#2a4340", icon: Drop, label: "Water" },
  desert: { re: /desert|wind|sand|atacama|blow/, tint: "#4c4035", icon: Wind, label: "Wind" },
  beach: { re: /beach|coast|wave|ocean|sea/, tint: "#2a4150", icon: Waves, label: "Sea" },
  noise: { re: /noise|static|white/, tint: "#383a46", icon: Waveform, label: "Noise" },
};

export const OTHER = { tint: "#323449", icon: Waveform, label: "Sound" };

export function catOf(track) {
  if (!track) return OTHER;
  if (track.sceneKey && CATS[track.sceneKey]) return CATS[track.sceneKey];
  const txt = `${track.name ?? ""} ${(track.tags ?? []).join(" ")}`.toLowerCase();
  for (const k in CATS) if (CATS[k].re.test(txt)) return CATS[k];
  return OTHER;
}

// Normalise a Freesound API payload into the shape the player works with.
export function toTrack(data, name) {
  const sceneKey = CURATED_SCENES[data.id] ?? null;
  return {
    id: data.id,
    name: name || data.custom_name || data.name,
    by: data.username ?? "",
    tags: data.tags ?? [],
    duration: data.duration ?? 0,
    previewUrl: data.previews?.["preview-hq-mp3"] ?? "",
    sceneKey,
    curated: sceneKey !== null,
    raw: data,
  };
}

export const fmt = (s) => {
  const v = Number.isFinite(s) ? Math.max(0, s) : 0;
  return `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, "0")}`;
};

export const fmt2 = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function hashStr(id) {
  let h = 7;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

export function seedBars(id, n) {
  const r = rng(hashStr(id));
  const out = [];
  for (let i = 0; i < n; i++) {
    const env = 0.55 + 0.45 * Math.sin((i / n) * Math.PI);
    out.push(Math.round((0.18 + r() * 0.82) * env * 100));
  }
  return out;
}
