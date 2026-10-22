'use client';

import { useId } from 'react';
import { formatRupiahRingkas } from '@jejakjanji/shared/format';
import { formatRupiahPenuh } from '@/lib/format';

/**
 * Short amount ("Rp1,32 T") with the full amount in a tooltip. The value is focusable and linked
 * to the tooltip via aria-describedby, so keyboard and screen-reader users get the full number too.
 */
export function Money({ jumlah, satuan }: { jumlah: number; satuan: 'juta_rp' | 'rp' }) {
  const id = useId();
  return (
    <span className="money">
      <span className="money-value" tabIndex={0} aria-describedby={id}>
        {formatRupiahRingkas(jumlah, satuan)}
      </span>
      <span role="tooltip" id={id} className="tooltip">
        {formatRupiahPenuh(jumlah, satuan)}
      </span>
    </span>
  );
}
