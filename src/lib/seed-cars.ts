'use client';

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { SEED_SHOWROOMS, SEED_CARS } from './showroom-seed';
import { Showroom, Car } from './types';

/**
 * Seeds Firestore with demo showrooms + cars.
 * Idempotent: skips items that already exist (matched by id).
 */
export async function seedCarsToFirestore(db: Firestore) {
  console.log('[seed] Starting showroom + car seeding...');
  let showroomOk = 0;
  let carOk = 0;
  let skipped = 0;
  let errors = 0;

  // ---- Seed showrooms first ----
  for (const s of SEED_SHOWROOMS) {
    try {
      const ref = doc(db, 'showrooms', s.id);
      const existing = await getDocs(query(collection(db, 'showrooms'), where('__name__', '==', s.id)));
      if (!existing.empty) {
        console.log(`[seed] Showroom ${s.id} already exists. Skipping.`);
        skipped++;
        continue;
      }
      const data: Partial<Showroom> = {
        ...s,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, data);
      console.log(`[seed] Showroom seeded: ${s.name}`);
      showroomOk++;
    } catch (e) {
      console.error('[seed] Showroom error:', s.id, e);
      errors++;
    }
  }

  // ---- Seed cars ----
  for (const c of SEED_CARS) {
    try {
      // Use deterministic id = `${showroomId}-${make}-${model}-${year}-${variant||base}`
      // Simple hash-free approach: random id, dedupe by (make+model+year+showroom)
      const dedupeQ = query(
        collection(db, 'cars'),
        where('make', '==', c.make),
        where('model', '==', c.model),
        where('year', '==', c.year),
        where('showroomId', '==', c.showroomId)
      );
      const existing = await getDocs(dedupeQ);
      if (!existing.empty) {
        console.log(`[seed] Car ${c.make} ${c.model} ${c.year} already in ${c.showroomName}. Skipping.`);
        skipped++;
        continue;
      }
      const newRef = doc(collection(db, 'cars'));
      const carData: Partial<Car> = {
        ...c,
        id: newRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(newRef, carData);
      console.log(`[seed] Car seeded: ${c.make} ${c.model} ${c.year}`);
      carOk++;
    } catch (e) {
      console.error('[seed] Car error:', c.make, c.model, e);
      errors++;
    }
  }

  // Mark as seeded
  try {
    await setDoc(doc(db, 'settings', 'seed'), { showroomsSeeded: true, carsSeeded: true }, { merge: true });
  } catch (e) {
    console.error('[seed] Could not write seed settings flag:', e);
  }

  return { showroomOk, carOk, skipped, errors };
}
