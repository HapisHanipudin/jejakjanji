import type { ReactNode } from 'react';

/** Title band at the top of inner pages: optional breadcrumb, h1, lead text. */
export function PageHeader({
  title,
  lead,
  breadcrumb,
  children,
}: {
  title: ReactNode;
  lead?: ReactNode;
  breadcrumb?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="band">
      <div className="container">
        {breadcrumb}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </div>
  );
}
