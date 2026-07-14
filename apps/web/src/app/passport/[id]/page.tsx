'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { getPassport } from '@/lib/api';
import { PassportView } from '@/components/PassportView';

export default function PassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['passport', id],
    queryFn: () => getPassport(id),
  });

  if (isLoading) return <p className="text-muted">Loading passport…</p>;
  if (isError || !data) return <p className="text-danger">Passport not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">Public Evidence Passport</p>
        <h1 className="font-mono text-xl">{id}</h1>
      </div>
      <PassportView passport={data} />
    </div>
  );
}
