// Mirrors packages/server/src/contact.js (client side check only; the server decides).
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidContact(raw) {
  const s = String(raw ?? '').trim();
  if (s.includes('@')) return EMAIL.test(s);
  let d = s.replace(/[\s\-()]/g, '');
  if (d.startsWith('+251')) d = '0' + d.slice(4);
  else if (d.startsWith('251')) d = '0' + d.slice(3);
  else if (/^[79]\d{8}$/.test(d)) d = '0' + d;
  return /^0\d{9}$/.test(d);
}
