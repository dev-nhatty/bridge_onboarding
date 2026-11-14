import { useEffect, useState } from 'react';

// Career gateway (starter): jobs with a PRIVATE "support I need" filter.
// The filter runs on the learner's own supports; the server does not record which filter was used.
// TODO (required by the brief): voice answers on the application question, and the employer form
// UI that calls POST /api/jobs (the endpoint already exists).
export default function JobsList({ api, t, session }) {
  const [onlyMine, setOnlyMine] = useState(true);
  const [jobs, setJobs] = useState(null);
  const [failed, setFailed] = useState(false);
  const [applied, setApplied] = useState({});
  const support = session?.user.support ?? [];

  useEffect(() => {
    setFailed(false);
    api
      .jobs(onlyMine ? support : [])
      .then((r) => setJobs(r.jobs))
      .catch(() => setFailed(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyMine]);

  async function apply(id) {
    try {
      await api.apply(id, session.token, '');
      setApplied((a) => ({ ...a, [id]: true }));
    } catch {
      setFailed(true);
    }
  }

  return (
    <section aria-labelledby="jobs-h">
      <h2 id="jobs-h" tabIndex={-1}>{t('jobs.title')}</h2>
      {support.length > 0 && (
        <label className="check">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          <span>{t('jobs.onlyMine')}</span>
        </label>
      )}
      {failed && <p className="error" role="alert">{t('jobs.loadFailed')}</p>}
      {jobs && jobs.length === 0 && <p>{t('jobs.empty')}</p>}
      <ul className="jobs">
        {(jobs ?? []).map((j) => (
          <li key={j.id}>
            <h3>{j.title}</h3>
            <p>{j.company}{j.location ? ` · ${j.location}` : ''}</p>
            <p className="hint">
              {t('jobs.offers')}: {j.accommodations.map((a) => t(`opt.${a}`)).join(', ')}
            </p>
            {applied[j.id] ? (
              <p className="status ok" role="status">{t('jobs.applied')}</p>
            ) : (
              <button type="button" className="btn secondary" onClick={() => apply(j.id)}>
                {t('jobs.apply')}<span className="sr-only">: {j.title}</span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
