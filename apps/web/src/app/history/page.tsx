'use client';

import { useQuery } from '@tanstack/react-query';
import { getHistory } from '@/lib/api';
import { HistoryTable } from '@/components/HistoryTable';

export default function HistoryPage() {
  const { data, isLoading } = useQuery({ queryKey: ['history'], queryFn: getHistory });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Verification history</h1>
      {isLoading ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <HistoryTable rows={data ?? []} />
      )}
    </div>
  );
}
