// Deterministic, dependency-free cover art generator shared in spirit with
// the frontend fallback — used to give freshly created trends a placeholder
// if no image was uploaded (the client always uploads one, this is a safety net).

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function hslStr(h: number, s: number, l: number) {
  return `hsl(${h % 360}, ${s}%, ${l}%)`;
}

export function generateCover(seed: string): string {
  const n = hashSeed(seed);
  const hueA = n % 360;
  const hueB = (hueA + 40 + (n % 60)) % 360;
  const hueC = (hueA + 200 + (n % 50)) % 360;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 100 75">
    <defs>
      <radialGradient id="a" cx="20%" cy="15%" r="80%">
        <stop offset="0%" stop-color="${hslStr(hueA, 90, 82)}" />
        <stop offset="100%" stop-color="${hslStr(hueA, 90, 82)}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="b" cx="75%" cy="70%" r="75%">
        <stop offset="0%" stop-color="${hslStr(hueB, 92, 78)}" />
        <stop offset="100%" stop-color="${hslStr(hueB, 92, 78)}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="c" cx="35%" cy="85%" r="70%">
        <stop offset="0%" stop-color="${hslStr(hueC, 85, 75)}" />
        <stop offset="100%" stop-color="${hslStr(hueC, 85, 75)}" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="100" height="75" fill="${hslStr(hueA, 60, 94)}" />
    <rect width="100" height="75" fill="url(#a)" />
    <rect width="100" height="75" fill="url(#b)" />
    <rect width="100" height="75" fill="url(#c)" />
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAvatar(seed: string, label: string): string {
  const n = hashSeed(seed);
  const hueA = n % 360;
  const hueB = (hueA + 60) % 360;
  const initials = label
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${hslStr(hueA, 70, 42)}" />
        <stop offset="100%" stop-color="${hslStr(hueB, 70, 30)}" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#g)" />
    <text x="50" y="56" font-family="Inter, system-ui, sans-serif" font-size="34" font-weight="700"
      fill="rgba(255,255,255,0.92)" text-anchor="middle">${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
