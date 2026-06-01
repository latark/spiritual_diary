'use client';

import { useState } from 'react';

import { ContinueButton } from '../ContinueButton';

interface BirthValue {
  birthDate: string;
  birthTime: string | null;
  birthLocation: string | null;
}

export function BirthStep({ onNext }: { onNext: (v: BirthValue) => void }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-ink text-2xl">Когда ты пришла в этот мир?</h2>
        <p className="text-ink-muted mt-1 text-sm">
          Время и место — по желанию (понадобятся для астрологии позже).
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-sm">Дата рождения</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-surface-raised text-ink rounded-md px-4 py-3"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-sm">Время рождения (необязательно)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-surface-raised text-ink rounded-md px-4 py-3"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-ink-muted text-sm">Место рождения (необязательно)</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Город"
            className="bg-surface-raised text-ink placeholder:text-ink-muted/50 rounded-md px-4 py-3"
          />
        </label>
      </div>

      <ContinueButton
        disabled={!date}
        onClick={() =>
          onNext({
            birthDate: date,
            birthTime: time || null,
            birthLocation: location.trim() || null,
          })
        }
      />
    </div>
  );
}
