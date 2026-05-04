/**
 * PageHeader — full-width blue section/title/description banner.
 *
 * Props:
 *   section     — small uppercase label above the title (optional)
 *   title       — main h1 heading
 *   description — supporting text shown to the right of the title (optional)
 */
export function PageHeader({ section, title, description }) {
  return (
    <div className="bg-blue-50 flex items-start gap-12 px-8 py-8 shrink-0 border-b border-slate-200">
      <div className="shrink-0">
        {section && (
          <div
            className="text-slate-500 font-bold uppercase mb-1"
            style={{ fontSize: 11, letterSpacing: '0.05em' }}
          >
            {section}
          </div>
        )}
        <h1 className="text-3xl font-bold text-slate-900 leading-tight m-0">{title}</h1>
      </div>
      {description && (
        <p
          className="text-slate-500 m-0 flex items-center"
          style={{ fontSize: 15, lineHeight: 1.6, maxWidth: 500 }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default PageHeader;
