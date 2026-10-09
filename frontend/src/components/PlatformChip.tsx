import { useState } from 'react';
import { platformLogo } from '../lib/format';

export default function PlatformChip({ platform }: { platform: string | null }) {
  const [broken, setBroken] = useState(false);
  if (!platform) return <span className="platform-chip">—</span>;
  const logo = platformLogo(platform);

  return (
    <span className="platform-chip">
      {logo && !broken && (
        <img src={logo} alt="" onError={() => setBroken(true)} />
      )}
      {platform}
    </span>
  );
}
