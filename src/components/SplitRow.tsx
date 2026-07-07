// Wiederverwendbares Split-Layout (Bild/Visual + Text nebeneinander, alternierend
// per flip). Bricht die immer gleiche zentrierte Card-Grid-Optik auf (Design-
// Audit). Stapelt auf schmalen Screens sauber untereinander.
import type { ReactNode } from 'react';

export function SplitRow({ visual, children, flip = false }: {
  visual: ReactNode; children: ReactNode; flip?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', gap: 'clamp(22px, 4vw, 56px)', alignItems: 'center',
      flexDirection: flip ? 'row-reverse' : 'row', flexWrap: 'wrap',
    }}>
      <div style={{ flex: '1 1 300px', minWidth: 'min(100%, 280px)', display: 'flex', justifyContent: 'center' }}>
        {visual}
      </div>
      <div style={{ flex: '1 1 340px', minWidth: 'min(100%, 300px)' }}>
        {children}
      </div>
    </div>
  );
}
