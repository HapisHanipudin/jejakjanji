import type { z } from 'zod';
import type { sourceDocumentSchema } from '@jejakjanji/shared';
import { formatTanggal } from '@/lib/format';

export type SourceDoc = z.infer<typeof sourceDocumentSchema>;

/** One source line: document, PDF page(s), check date, link when the document has a URL. */
export function SourceBox({
  doc,
  pages,
  prefix = 'Sumber',
}: {
  doc: SourceDoc | undefined;
  pages: number[];
  prefix?: string;
}) {
  if (!doc) return <p className="source">{prefix}: dokumen sumber tidak ditemukan di data.</p>;
  const hal = [...new Set(pages)].sort((a, b) => a - b).join(', ');
  return (
    <p className="source">
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
    </p>
  );
}
