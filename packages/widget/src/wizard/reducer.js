export const initialState = {
  answers: {},
  index: 0,        // index into the VISIBLE steps
  errorKey: null,  // i18n key of the current field error
  token: null,     // draft / resume token
  status: 'idle',  // idle | submitting
  notice: null,    // { kind: 'ok' | 'error', key } shown in the polite live region
};

export function reducer(state, action) {
  switch (action.type) {
    case 'answer':
      return { ...state, answers: { ...state.answers, [action.field]: action.value }, errorKey: null };
    case 'go':
      return { ...state, index: action.index, errorKey: null };
    case 'error':
      return { ...state, errorKey: action.key };
    case 'token':
      return { ...state, token: action.token };
    case 'loaded':
      return { ...state, token: action.token, answers: action.answers, index: action.index, errorKey: null };
    case 'status':
      return { ...state, status: action.status };
    case 'notice':
      return { ...state, notice: action.notice };
    default:
      return state;
  }
}
