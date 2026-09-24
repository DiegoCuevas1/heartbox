// Must match RELIC_CATEGORIES in backend/heartbox/api/models.py.
export const RELIC_CATEGORIES = [
  "Wedding",
  "Christmas",
  "Birthday",
  "Anniversary",
  "Graduation",
  "New Year",
  "Halloween",
  "Valentine's",
  "Other",
] as const;

export function categoryHref(name: string) {
  return `/categories/${encodeURIComponent(
    name.toLowerCase().replace(/\s+/g, "-"),
  )}-relics`;
}
