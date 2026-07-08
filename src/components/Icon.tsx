// Wolfs eigene Soft-3D-Icons (ersetzen Emojis). Rendert /assets/icon-<name>.webp.
// Verfuegbar: firma, feier, pub, handy, aufbau, dauer, moderation, standort,
// puzzle, team, energie, krone, trophae, instagram.
export function Icon({ name, size = 32, alt = '' }: { name: string; size?: number; alt?: string }) {
  return (
    <img
      src={`/assets/icon-${name}.webp`} alt={alt} width={size} height={size}
      loading="lazy" decoding="async"
      style={{ width: size, height: size, objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  );
}
