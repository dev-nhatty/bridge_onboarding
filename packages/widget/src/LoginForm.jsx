import { useState } from 'react';

export default function LoginForm({ api, t, emit, onLoggedIn }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorKey, setErrorKey] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErrorKey(null);
    try {
      const res = await api.login(identifier, password);
      emit('bridge:login', { userId: res.user.id, fullName: res.user.fullName, token: res.token });
      onLoggedIn(res);
    } catch (err) {
      setErrorKey(err.code === 'bad_login' ? 'err.badLogin' : 'err.generic');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h2>{t('login.title')}</h2>
      <label htmlFor="login-id" className="lbl">{t('login.id')}</label>
      <input id="login-id" type="text" autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
      <label htmlFor="login-pw" className="lbl">{t('login.password')}</label>
      <input id="login-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <p className="error" role="alert">{errorKey ? t(errorKey) : ''}</p>
      <div className="actions">
        <button type="submit" className="btn primary" disabled={busy}>{t('login.submit')}</button>
      </div>
    </form>
  );
}
