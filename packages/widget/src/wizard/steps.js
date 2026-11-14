// The wizard is DATA. To add a question, add an entry here plus its strings in i18n/locales/*.json
// (keys: q.<id>, hint.<id>, and opt.<value> for choices). Nothing else needs to change.
//
// type: text | textarea | choice | multi | password
// optional: the learner may press Next without answering
// showIf:  only show this step when the answers so far match (this is how "refer me" skips the ID number)
// sensitive: never sent to the server until the final submit (passwords)

export const ID_ROUTES = ['kebele', 'refugee', 'other', 'referral'];
export const SUPPORT_OPTIONS = ['screenReader', 'captions', 'signLanguage', 'extraTime', 'largeText'];

export const steps = [
  { id: 'fullName', type: 'text', field: 'fullName', icon: '🙂', autocomplete: 'name' },
  { id: 'contact', type: 'text', field: 'contact', icon: '📱', autocomplete: 'username' },
  {
    id: 'idRoute', type: 'choice', field: 'idRoute', icon: '🪪', options: ID_ROUTES,
    icons: { kebele: '🪪', refugee: '🏕️', other: '📄', referral: '🤝' },
  },
  {
    id: 'idNumber', type: 'text', field: 'idNumber', icon: '🔢',
    showIf: (a) => ['kebele', 'refugee', 'other'].includes(a.idRoute),
  },
  {
    id: 'support', type: 'multi', field: 'support', icon: '🤲', optional: true, options: SUPPORT_OPTIONS,
    icons: { screenReader: '🔊', captions: '💬', signLanguage: '🤟', extraTime: '⏱️', largeText: '🔠' },
  },
  { id: 'supportNote', type: 'textarea', field: 'supportNote', icon: '📝', optional: true },
  { id: 'password', type: 'password', field: 'password', icon: '🔑', sensitive: true, autocomplete: 'new-password' },
];

export const SENSITIVE_FIELDS = steps.filter((s) => s.sensitive).map((s) => s.field);

export const visibleSteps = (answers) => steps.filter((s) => !s.showIf || s.showIf(answers));

// Only fields on visible steps, and never sensitive ones, are autosaved.
export function savableAnswers(answers) {
  const out = {};
  for (const s of visibleSteps(answers)) {
    if (s.sensitive) continue;
    const v = answers[s.field];
    // Empty values are simply left out; the server replaces (not merges) saved answers.
    if (v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)) out[s.field] = v;
  }
  return out;
}
