'use client';
import { useEffect, useState } from 'react';

type Props = {
  value?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
};

export default function CitySelect({ value, onChange, disabled }: Props) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/PE/municipios', { cache: 'force-cache' });
        const data = await res.json();
        if (!ignore) setCities(data.map((c: any) => c?.nome).filter(Boolean));
      } catch {
        if (!ignore) setCities(['Recife','Caruaru','Petrolina','Garanhuns','Olinda']);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <select
      className="input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading}
    >
      <option value="">Selecione a cidade</option>
      {cities.sort().map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

