import {useCallback, useEffect, useState} from 'react';
import {request} from '../api/http';

// One request at a time; ignore old responses after changing filters or leaving the page.
export function usePollingResource(path, interval = 15000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    let live = true, pending = false;
    const controller = new AbortController();
    setData(null);
    async function load() {
      if (pending) return;
      pending = true;
      if (live) setLoading(true);
      try {
        const value = await request(path, {signal: controller.signal});
        if (live) { setData(value); setError(''); }
      } catch (reason) {
        if (live) setError(reason.message);
      } finally {
        pending = false;
        if (live) setLoading(false);
      }
    }
    load();
    const timer = setInterval(() => { if (!document.hidden) load(); }, interval);
    return () => { live = false; controller.abort(); clearInterval(timer); };
  }, [path, interval, revision]);
  return {data, error, loading, reload};
}

