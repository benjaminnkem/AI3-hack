import Link from 'next/link';
import { HistoryRow } from '@/lib/api';
import { scoreMeta } from '@/lib/utils';

export function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  if (rows.length === 0) {
    return <p className="text-center text-muted">No verifications yet.</p>;
  }
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="p-4">Type</th>
            <th className="p-4">Status</th>
            <th className="p-4">Score</th>
            <th className="p-4">Date</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/50 last:border-0">
              <td className="p-4 capitalize">{r.inputType}</td>
              <td className="p-4 capitalize text-muted">{r.status}</td>
              <td className="p-4">
                {r.truthScore != null ? (
                  <span style={{ color: scoreMeta(r.truthScore).color }}>
                    {Math.round(r.truthScore)}
                  </span>
                ) : (
                  '-'
                )}
              </td>
              <td className="p-4 text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
              <td className="p-4">
                {r.passport?.publicId && (
                  <Link href={`/passport/${r.passport.publicId}`} className="text-accent hover:underline">
                    View passport
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
