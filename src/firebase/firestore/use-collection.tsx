'use client';

import { useEffect, useState } from 'react';
import { 
  getDocs, 
  Query, 
  QuerySnapshot, 
  DocumentData 
} from 'firebase/firestore';

/**
 * A hook to query a Firestore collection.
 * Uses promise-based getDocs with instant local fallback to prevent Firebase 11 stream assertion errors.
 */
export function useCollection<T = DocumentData>(query: Query<T> | null) {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function fetchData() {
      try {
        const snapshot = await getDocs(query!);
        if (!isMounted) return;
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        setData([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [query]);

  return { data, loading, error };
}
