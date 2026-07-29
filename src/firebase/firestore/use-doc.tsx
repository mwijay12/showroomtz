'use client';

import { useEffect, useState } from 'react';
import { 
  getDoc, 
  DocumentReference, 
  DocumentSnapshot, 
  DocumentData 
} from 'firebase/firestore';

/**
 * A hook to query a single Firestore document.
 * Uses promise-based getDoc with instant local fallback to prevent Firebase 11 stream assertion errors.
 */
export function useDoc<T = DocumentData>(docRef: DocumentReference<T> | null) {
  const [data, setData] = useState<(T & { id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    async function fetchDoc() {
      try {
        const snapshot = await getDoc(docRef!);
        if (!isMounted) return;
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id } as (T & { id: string }));
        } else {
          setData(null);
        }
        setError(null);
      } catch (err: any) {
        if (!isMounted) return;
        setData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDoc();

    return () => {
      isMounted = false;
    };
  }, [docRef?.path]);

  return { data, loading, error };
}