import { useEffect, useId, useRef, useState } from 'react';
import { Button, Field } from '../database-generic/index.js';
import { createPromoCode } from '../services/databaseService';

export default function PromoterCodeField({ resource, token, value = '', disabled, onCreating, onCreated }) {
  const id = useId();
  const select = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [draftCode, setDraftCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [created, setCreated] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const codes = Array.isArray(resource.data?.promoCodes) ? resource.data.promoCodes : [];
  const options = created && !codes.some(({ code }) => code === created.code) ? [...codes, created] : codes;
  const hint = resource.loading ? 'Loading promo codes…'
    : !Array.isArray(resource.data?.promoCodes) ? 'Unable to load existing promo codes.'
    : options.length === 0 ? 'Create your first promo code here.' : '';

  useEffect(() => {
    if (created && select.current) {
      select.current.value = created.code;
      select.current.focus();
    }
  }, [created]);

  function closeEditor() {
    setExpanded(false);
    setDraftCode('');
    setDiscount('');
    setError('');
  }

  async function handleCreate() {
    if (creating || disabled) return;
    const code = draftCode.trim().toUpperCase();
    const discountPercent = Number(discount);
    if (!/^[A-Z0-9][A-Z0-9_-]{0,31}$/.test(code)) {
      setError('Enter a code using letters, digits, hyphens, or underscores.');
      return;
    }
    if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      setError('Enter a whole discount percentage from 1 to 100.');
      return;
    }
    setCreating(true);
    onCreating(true);
    setError('');
    try {
      const { promoCode } = await createPromoCode(token, { code, discountPercent });
      setCreated(promoCode);
      onCreated();
      closeEditor();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
      onCreating(false);
    }
  }

  return (
    <div className="db-field">
      <label htmlFor={id}>Promo code</label>
      <select ref={select} id={id} name="promoCode" defaultValue={value} disabled={disabled || creating} aria-describedby={hint ? `${id}-hint` : undefined}>
        <option value="">No promo code</option>
        {value && !options.some(({ code }) => code === value) && <option value={value}>{value}</option>}
        {options.map(({ code, discountPercent }) => <option key={code} value={code}>{code} ({discountPercent}% off)</option>)}
      </select>
      {hint && <small id={`${id}-hint`} className="db-muted">{hint}</small>}
      {expanded ? (
        <div className="db-field lisbon-promo-code-draft" onKeyDown={(event) => {
          if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
            event.preventDefault();
            handleCreate();
          }
        }}>
          <Field label="New promo code" value={draftCode} onChange={(event) => setDraftCode(event.target.value)} maxLength={32} disabled={disabled || creating} />
          <Field label="Discount (%)" type="number" value={discount} onChange={(event) => setDiscount(event.target.value)} disabled={disabled || creating} />
          {error && <p role="alert">{error}</p>}
          <div className="db-actions">
            <Button variant="primary" onClick={handleCreate} disabled={disabled || creating}>{creating ? 'Creating…' : 'Create and select'}</Button>
            <Button onClick={closeEditor} disabled={creating}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="db-actions">
          <Button onClick={() => setExpanded(true)} disabled={disabled}>Create promo code</Button>
        </div>
      )}
    </div>
  );
}
