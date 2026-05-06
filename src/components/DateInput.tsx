import { useEffect, useState } from 'react';
import { formatarData, brParaIso } from '../utils/formatDate';

interface Props {
  value: string; // ISO yyyy-mm-dd
  onChange: (iso: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

function maskBR(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function DateInput({ value, onChange, placeholder = 'dd/mm/aaaa', className = 'input', style }: Props) {
  const [text, setText] = useState(formatarData(value));

  useEffect(() => { setText(formatarData(value)); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskBR(e.target.value);
    setText(masked);
    const iso = brParaIso(masked);
    if (iso) onChange(iso);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      style={style}
      maxLength={10}
    />
  );
}
