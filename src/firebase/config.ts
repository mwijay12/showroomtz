/**
 * Official Firebase configuration for ShowroomTZ (Volta Motors Showroom).
 * Configured for project: showroomtz
 */
export const firebaseConfig = {
  apiKey: "AIzaSyBFkK-clkIu35AXX9RziGIqyeXnwF1eIOs",
  authDomain: "showroomtz.firebaseapp.com",
  projectId: "showroomtz",
  storageBucket: "showroomtz.firebasestorage.app",
  messagingSenderId: "856064546760",
  appId: "1:856064546760:web:35badd92e35d80f03412fd",
  measurementId: "G-07FMZE12KP"
};

if (typeof window !== 'undefined' && !firebaseConfig.apiKey) {
  console.warn("⚠️ SHOWROOM NODE WARNING: Master keys missing from registry.");
}
