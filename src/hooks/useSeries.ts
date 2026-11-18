import { useCallback, useEffect, useState } from 'react';
import type { SeriesMap } from '../types/metrics';
import { metricsApi } from '../utils/metricsApi';

/** Load live metric series for a published page (by database id). */
export function useSeries(pageDbId?: string) {
  const [series, setSeries] = useState<SeriesMap>({});
  const [loading, setLoading] = useState(Boolean(pageDbId));

  const reload = useCallback(async () => {
    if (!pageDbId) {
      setSeries({});
      setLoading(false);
      return;
    }
    try {
      setSeries(await metricsApi.loadSeries(pageDbId));
    } catch {
      setSeries({});
    } finally {
      setLoading(false);
    }
  }, [pageDbId]);

  useEffect(() => {
    setLoading(Boolean(pageDbId));
    reload();
  }, [pageDbId, reload]);

  return { series, loading, reload };
}
