'use client';

import { useEffect, useState } from 'react';

type Props = {
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export const CitySelect = ({ value, onChange, disabled }: Props) => {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          'https://servicodados.ibge.gov.br/api/v1/localidades/estados/PE/municipios'
        );
        const data = await res.json();
        setCities(data.map((c: any) => c.nome));
      } catch {
        setCities(['Recife', 'Caruaru', 'Petrolina', 'Garanhuns', 'Olinda']);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <select
      className="border rounded-md px-3 py-2 w-full"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
    >
      <option value="">Selecione a cidade</option>
      {cities.sort().map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
};

export default CitySelect;

