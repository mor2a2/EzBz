'use client';

import { useState, useMemo } from 'react';

export default function CityAutocomplete({ value, onChange, suggestions }) {
  const [open, setOpen] = useState(false);
  // null = show the full list (on focus, before the user actively types anything new).
  // string = the user is typing — narrow the list to match it, same as a normal autocomplete.
  const [filterText, setFilterText] = useState(null);

  const filtered = useMemo(() => {
    if (filterText === null) return suggestions;
    const q = filterText.trim();
    return q ? suggestions.filter((s) => s.city.includes(q)) : suggestions;
  }, [suggestions, filterText]);

  return (
    <div className="tr-autocomplete">
      <input
        type="text"
        placeholder="הקלד או בחר עיר..."
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setFilterText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setFilterText(null);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && filtered.length > 0 && (
        <div className="tr-autocomplete-list">
          {filtered.map(({ city, hasCoordinator }) => (
            <button
              type="button"
              key={city}
              className="tr-autocomplete-option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(city);
                setFilterText(null);
                setOpen(false);
              }}
            >
              <span>{city}</span>
              {hasCoordinator && <span className="tr-autocomplete-badge">יש רכז</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
