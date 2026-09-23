import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { searchAirports } from "../../services/flightApi";

/**
 * Controlled airport/city text field with a live autocomplete dropdown.
 * `value` is the free-text the user typed or a selected label; the
 * parent learns the resolved IATA code only via onSelect, so typing
 * without picking a suggestion never silently produces a fake code.
 */
export default function AirportAutocomplete({ id, label, value, onChange, onSelect, placeholder }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    const keyword = value?.trim();
    if (!keyword || keyword.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const id = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchAirports(keyword);
        if (requestId.current === id) {
          setSuggestions(results || []);
          setOpen(true);
        }
      } catch {
        if (requestId.current === id) setSuggestions([]);
      } finally {
        if (requestId.current === id) setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const pick = (airport) => {
    onSelect(airport);
    setOpen(false);
  };

  return (
    <div className="field airport-autocomplete" ref={wrapRef}>
      {label && (
        <span className="field-label" id={`${id}-label`}>
          {label}
        </span>
      )}
      <input
        id={id}
        className="field-control"
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (loading || suggestions.length > 0) && (
        <ul className="airport-suggestions">
          {loading && suggestions.length === 0 && <li className="airport-suggestion-loading">…</li>}
          {suggestions.map((a) => (
            <li key={a.iataCode}>
              <button type="button" onClick={() => pick(a)}>
                <MapPin size={14} />
                <span>
                  <strong>{a.cityName}</strong> — {a.name} ({a.iataCode})
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
