'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getHistory } from '@/lib/api';
import { FileText, Link as LinkIcon, Image as ImageIcon, Search, Filter } from 'lucide-react';
import { cn, scoreMeta } from '@/lib/utils';

export default function ExplorePage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['history'],
    queryFn: getHistory,
  });

  const getVerdictGroup = (score: number | null): string => {
    if (score == null) return 'unverifiable';
    if (score >= 85) return 'true';
    if (score >= 65) return 'likely_true';
    if (score >= 45) return 'mixed';
    if (score >= 25) return 'likely_false';
    return 'false';
  };

  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'url') return <LinkIcon size={14} className="text-muted" />;
    if (t === 'image') return <ImageIcon size={14} className="text-muted" />;
    return <FileText size={14} className="text-muted" />;
  };

  const filtered = (data || []).filter((item) => {
    const matchType =
      filterType === 'all' || item.inputType.toLowerCase() === filterType.toLowerCase();
    const matchVerdict =
      filterVerdict === 'all' || getVerdictGroup(item.truthScore) === filterVerdict;
    return matchType && matchVerdict;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Evidence Explorer</h1>
        <p className="mt-2 text-muted text-sm">
          Browse, query, and audit recent public passports processed by the Mesh network.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Input Type
          </label>
          <div className="flex flex-wrap gap-2">
            {['all', 'text', 'url', 'image'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium border transition capitalize',
                  filterType === type
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface border-border text-muted hover:text-white',
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider">
            Verdict
          </label>
          <div className="flex flex-wrap gap-2">
            {['all', 'true', 'likely_true', 'mixed', 'likely_false', 'false'].map((verdict) => (
              <button
                key={verdict}
                onClick={() => setFilterVerdict(verdict)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium border transition capitalize',
                  filterVerdict === verdict
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-surface border-border text-muted hover:text-white',
                )}
              >
                {verdict.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted text-sm">Loading explorer...</p>
      ) : isError ? (
        <p className="text-danger text-sm">Failed to load verifications history.</p>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-muted text-sm">
          No matching passports found in this view.
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted bg-surface/30">
              <tr>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Truth Score</th>
                <th className="p-4">Verdict</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = r.truthScore != null ? scoreMeta(r.truthScore) : null;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-border/40 hover:bg-surface/20 last:border-0 transition"
                  >
                    <td className="p-4">
                      <span className="flex items-center gap-2 capitalize">
                        {getIcon(r.inputType)}
                        {r.inputType}
                      </span>
                    </td>
                    <td className="p-4 capitalize text-muted">{r.status}</td>
                    <td className="p-4 font-mono font-semibold">
                      {r.truthScore != null ? (
                        <span style={{ color: meta?.color }}>{Math.round(r.truthScore)}</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4">
                      {meta ? (
                        <span
                          className="text-xs uppercase tracking-wider font-semibold"
                          style={{ color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      {r.passport?.publicId && (
                        <Link
                          href={`/passport/${r.passport.publicId}`}
                          className="text-accent hover:underline text-xs font-semibold"
                        >
                          View passport
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
