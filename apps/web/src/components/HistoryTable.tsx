import Link from 'next/link';
import { Passport } from '@/lib/types';
import { formatScore, shortHash, verdictMeta } from '@/lib/utils';

export function HistoryTable({ rows }: { rows: Passport[] }) {
  if (rows.length === 0) {
    return <p className="text-center text-muted">No passports yet.</p>;
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="p-4">Passport</th>
            <th className="p-4">Type</th>
            <th className="p-4">Verdict</th>
            <th className="p-4">Score</th>
            <th className="p-4">Date</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const meta = verdictMeta(r.verdict);
            return (
              <tr key={r.publicId} className="border-b border-border/50 last:border-0">
                <td className="p-4">
                  <p className="max-w-[18rem] truncate text-sm">
                    {r.input.displayText || r.summary || r.publicId}
                  </p>
                  <p className="font-mono text-[10px] text-muted">{shortHash(r.publicId, 5)}</p>
                </td>
                <td className="p-4 capitalize text-muted">{r.input.type}</td>
                <td className="p-4">
                  <span className="text-xs font-semibold uppercase" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </td>
                <td className="p-4 tabular-nums" style={{ color: meta.color }}>
                  {formatScore(r.truthScore)}
                </td>
                <td className="p-4 text-muted">
                  {new Date(r.generatedAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <Link
                    href={`/passport/${r.publicId}`}
                    className="text-accent hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
