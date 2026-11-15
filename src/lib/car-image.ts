/**
 * Car → studio photograph resolution.
 *
 * The earlier image set in /public/images/cars was model-mismatched (a Porsche
 * labelled "Land Cruiser", an AMG GT labelled "S-Class"). Firestore documents
 * created before the new shoot still carry those paths, so instead of trusting
 * a stored URL that may point at the wrong car, we remap any legacy
 * `/images/cars/*` reference onto the matching studio photograph by reading the
 * vehicle's make/model. Real uploads (Cloudinary, Storage, any other path) are
 * passed through untouched.
 */

const STUDIO = '/images/studio';

const RULES: [RegExp, string][] = [
  [/land\s*cruiser\s*300|\blc\s*-?\s*300\b/i, `${STUDIO}/lc300.jpg`],
  [/prado/i, `${STUDIO}/prado.jpg`],
  [/hiace|hi-?ace/i, `${STUDIO}/hiace.jpg`],
  [/hilux|hilux\s*revo/i, `${STUDIO}/hilux.jpg`],
  [/alphard|vellfire/i, `${STUDIO}/alphard.jpg`],
  [/lx\s*-?\s*600|lexus\s*lx/i, `${STUDIO}/lx600.jpg`],
  [/range\s*rover|rangerover|velar|evoque/i, `${STUDIO}/rangerover.jpg`],
  [/7\s*-?\s*series|bmw\s*7/i, `${STUDIO}/bmw7.jpg`],
  [/s\s*-?\s*class|s\s*500|mercedes.*\bs\b/i, `${STUDIO}/sclass.jpg`],
];

/** Legacy placeholder keys still present in old seed/theme records. */
const LEGACY_KEYS: Record<string, string> = {
  'model-s': `${STUDIO}/lc300.jpg`,
  'rivian-r1s': `${STUDIO}/prado.jpg`,
  'cyber-truck': `${STUDIO}/sclass.jpg`,
  'lucid-air': `${STUDIO}/bmw7.jpg`,
  'porsche-taycan': `${STUDIO}/rangerover.jpg`,
  'audi-gt': `${STUDIO}/alphard.jpg`,
  'hummer-ev': `${STUDIO}/lx600.jpg`,
  'eqs-sedan': `${STUDIO}/sclass.jpg`,
  suv: `${STUDIO}/hero-suv.jpg`,
  sedan: `${STUDIO}/sclass.jpg`,
  van: `${STUDIO}/hiace.jpg`,
  luxury: `${STUDIO}/sclass.jpg`,
};

export const DEFAULT_CAR_IMAGE = `${STUDIO}/hero-suv.jpg`;

/** Best studio photograph for a free-text make/model hint. */
export function studioImageFor(hint?: string | null): string | undefined {
  if (!hint) return undefined;
  for (const [re, src] of RULES) if (re.test(hint)) return src;
  return undefined;
}

/**
 * @param url  stored image url (may be a legacy mismatched path)
 * @param hint `${make} ${model}` used to pick the right studio shot
 */
export function resolveCarImage(
  url?: string | null,
  hint?: string | null,
  fallback: string = DEFAULT_CAR_IMAGE
): string {
  const key = (url ?? '').trim();
  if (!key) return studioImageFor(hint) ?? fallback;

  const legacy = LEGACY_KEYS[key.toLowerCase()];
  if (legacy) return legacy;

  // legacy photo set — never trust it, remap by model
  if (key.startsWith('/images/cars/')) return studioImageFor(hint) ?? fallback;

  return key;
}
