'use client';

import { useEffect, useState } from 'react';
import CitySelect from '@/components/CitySelect';

export default function CitySelectField({ defaultValue }: { defaultValue?: string | null }) {
  const [value, setValue] = useState<string>(defaultValue ?? '');
  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);
  return (
    <>
      <CitySelect value={value} onChange={setValue} />
      <input type="hidden" name="cidade_nome" value={value} />
    </>
  );
}
