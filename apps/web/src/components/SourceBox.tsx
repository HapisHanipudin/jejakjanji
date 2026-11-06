import type { z } from 'zod';
import type { sourceDocumentSchema } from '@jejakjanji/shared';
import { formatTanggal } from '@/lib/format';
import { Icon } from './Icon';

export type SourceDoc = z.infer<typeof sourceDocumentSchema>;

/**
 * One source line: document, PDF page(s), check date, link when the document has a URL.
 * `pageOnly` prints just the page, for rows under a full source line naming the same document.
 */
export function SourceBox({
  doc,
  pages,
  prefix = 'Sumber',
  pageOnly = false,
}: {
  doc: SourceDoc | undefined;
  pages: number[];
  prefix?: string;
  pageOnly?: boolean;
}) {
  if (!doc)
    return (
      <p className="source source-line">
        <Icon name="file-text" />
        <span>{prefix}: dokumen sumber tidak ditemukan di data.</span>
      </p>
    );
  const hal = [...new Set(pages)].sort((a, b) => a - b).join(', ');
  const href = doc.url && (pages.length === 1 ? `${doc.url}#page=${pages[0]}` : doc.url);
  if (pageOnly)
    return (
      <p className="source source-line">
        <Icon name="file-text" />
        <span>
          Hal. PDF {hal}
          {href && (
            <>
              {' '}
              <a href={href} rel="noopener">
                buka halaman
              </a>
            </>
          )}
        </span>
      </p>
    );
  return (
    <p className="source source-line">
      <Icon name="file-text" />
      <span>
        {prefix}: {doc.title} ({doc.version}), hal. PDF {hal}, diperiksa{' '}
        {formatTanggal(doc.checkedAt)}
        {href && (
          <>
            {' '}
            <a href={href} rel="noopener">
              buka dokumen
            </a>
          </>
        )}
      </span>
    </p>
  );
}
