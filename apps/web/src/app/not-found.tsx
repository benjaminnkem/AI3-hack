import Link from 'next/link';
import { ArrowLeft, ScanSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="section-shell flex min-h-[70svh] items-center py-20">
      <div className="max-w-2xl">
        <p className="section-label">404 / Record not found</p>
        <ScanSearch className="mt-8 text-accent" size={28} aria-hidden />
        <h1 className="display-section mt-6">This evidence path ends here.</h1>
        <p className="section-copy mt-6">
          The page may have moved, or the public passport identifier does not exist.
        </p>
        <Link href="/" className="button-secondary mt-8">
          <ArrowLeft size={15} />
          Return to Mesh
        </Link>
      </div>
    </section>
  );
}
