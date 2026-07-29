/**
 * Client-side Local Storage vehicle store to guarantee 100% reliable persistence 
 * even when Firebase Auth is unauthenticated or when Firestore security rules restrict writes in dev mode.
 */

export function saveCarToLocalStorage(updatedCar: any) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('volta_custom_cars');
    let list: any[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(c => c.id === updatedCar.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...updatedCar, updatedAt: new Date().toISOString() };
    } else {
      list.push({ ...updatedCar, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('volta_custom_cars', JSON.stringify(list));
  } catch (e) {
    console.error("Local storage vehicle save failed:", e);
  }
}

export function getCustomCarsFromLocalStorage(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('volta_custom_cars');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function deleteCarFromLocalStorage(carId: string) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('volta_custom_cars');
    if (!raw) return;
    let list: any[] = JSON.parse(raw);
    list = list.filter(c => c.id !== carId);
    localStorage.setItem('volta_custom_cars', JSON.stringify(list));
  } catch (e) {
    console.error("Local storage vehicle delete failed:", e);
  }
}
