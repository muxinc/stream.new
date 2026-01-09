'use client';

import { Suspense } from 'react';
import RecordPage from '../../components/record-page';

export default function Record() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordPage />
    </Suspense>
  );
}
