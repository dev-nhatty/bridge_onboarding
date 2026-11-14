export function createApi(base) {
  const root = base.replace(/\/$/, '');

  async function req(path, { method = 'GET', body, token } = {}) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json'; // GET stays a "simple" CORS request
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(root + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error?.message || res.statusText);
      err.code = data.error?.code;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  return {
    createDraft: (prefs) => req('/drafts', { method: 'POST', body: prefs }),
    getDraft: (token) => req(`/drafts/${token}`),
    saveDraft: (token, body) => req(`/drafts/${token}`, { method: 'PATCH', body }),
    sendLink: (token) => req(`/drafts/${token}/send-link`, { method: 'POST' }),
    submit: (token, password) => req(`/drafts/${token}/submit`, { method: 'POST', body: { password } }),
    login: (identifier, password) => req('/auth/login', { method: 'POST', body: { identifier, password } }),
    jobs: (support) => req('/jobs' + (support?.length ? `?support=${support.join(',')}` : '')),
    apply: (id, token, answer) => req(`/jobs/${id}/apply`, { method: 'POST', token, body: { answer } }),
  };
}
