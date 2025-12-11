// app/business/[id]/edit/page.tsx
'use client';

import BusinessEditPage from '@/components/BusinessEditPage';

export default function Page({ params }: { params: { id: string } }) {
  return <BusinessEditPage businessId={params.id} />;
}