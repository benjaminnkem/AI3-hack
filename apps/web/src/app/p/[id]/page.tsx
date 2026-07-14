'use client';

import PassportPage from '../../passport/[id]/page';

export default function ShortLinkPassportPage({ params }: { params: Promise<{ id: string }> }) {
  return <PassportPage params={params} />;
}
