import { isValidContact } from '../lib/contact.js';

// Returns an i18n key for a plain-language error, or null when the answer is fine.
export function validateStep(step, value) {
  const empty =
    value == null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);

  if (step.optional && empty) return null;
  if (empty) return 'err.required';
  if (step.id === 'contact' && !isValidContact(value)) return 'err.contact';
  if (step.type === 'password' && value.length < 8) return 'err.passwordShort';
  return null;
}
