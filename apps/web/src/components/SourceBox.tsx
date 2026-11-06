import type { z } from 'zod';
import type { sourceDocumentSchema } from '@jejakjanji/shared';
import { formatTanggal } from '@/lib/format';
import { Icon } from './Icon';

export type SourceDoc = z.infer<typeof sourceDocumentSchema>;

/** One source line: document, PDF page(s), check date, link when the document has a URL. */
export function SourceBox({
  doc,
  pages,
  prefix = 'Sumber',
  line = false,
}: {
  doc: SourceDoc | undefined;
  pages: number[];
  prefix?: string;
  /** Figma "source line": a document icon beside the text, for sources placed next to one figure. */
  line?: boolean;
}) {
  const mark = line ? <Icon name="file-text" /> : null;
  const cls = line ? 'source source-line' : 'source';
  if (!doc)
    return (
      <p className={cls}>
        {mark}
        <span>{prefix}: dokumen sumber tidak ditemukan di data.</span>
      </p>
    );
  const hal = [...new Set(pages)].sort((a, b) => a - b).join(', ');
  return (
    <p className={cls}>
      {mark}
      <span>
        {prefix}: {doc.title} ({doc.version}), hal. PDF {hal}, diperiksa{' '}
        {formatTanggal(doc.checkedAt)}
        {doc.url && (
          <>
            {' '}
            <a href={pages.length === 1 ? `${doc.url}#page=${pages[0]}` : doc.url} rel="noopener">
              buka dokumen
            </a>
          </>
        )}
      </span>
    </p>
  );
}
