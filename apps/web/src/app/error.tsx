'use client';

import { useEffect } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="product-page section-shell flex min-h-[70svh] items-center py-20">
      <div className="max-w-2xl">
        <p className="section-label">Interface exception</p>
        <TriangleAlert className="mt-8 text-warn" size={28} aria-hidden />
        <h1 className="display-section mt-6">The verification interface hit an error.</h1>
        <p className="section-copy mt-6">
          No successful result has been invented. Retry the current view or return to the
          verification flow.
        </p>
        <button type="button" onClick={reset} className="button-primary mt-8">
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    </section>
  );
}
