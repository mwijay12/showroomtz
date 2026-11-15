/**
 * @fileOverview Client entry-point for n8n automation.
 * Thin wrapper over the shared hardened core (timeout + retry + resolution chain).
 * Delivery never blocks the user flow — failures are logged, not thrown.
 */

import { sendEnvelope, type N8NResult, type WebhookEvent } from '@/lib/n8n/core';

export type { N8NResult, WebhookEvent };

export async function triggerN8N(
  event: WebhookEvent | string,
  payload: any,
): Promise<N8NResult> {
  return sendEnvelope(event, payload ?? {});
}

// ── Convenience notifiers (unchanged public API) ─────────────────────
export const notifyTelegramBot = (payload: any) =>
  triggerN8N('telegram-webhook', payload);

export const notifyNewCar = (car: any) =>
  triggerN8N('car-added', {
    firebaseId: car.id,
    make: car.make || car.brand,
    model: car.model || car.name,
    plateNumber: car.plateNumber || car.plate,
    category: car.category || car.type,
    dailyRate: Number(car.dailyRate || car.rate || car.pricePerDay),
    status: car.status || 'Available',
    imageUrl: car.imageUrl || car.image || car.images?.[0],
    description: car.description,
  });

export const notifyNewDriver = (driver: any) =>
  triggerN8N('driver-added', {
    firebaseId: driver.id,
    fullName: driver.fullName || driver.displayName || driver.name,
    phone: driver.phoneNumber || driver.phone,
    email: driver.email,
    licenseNumber: driver.licenseNumber || 'N/A',
    status: driver.status || 'Available',
    experience: driver.experience || 0,
    rating: driver.rating || 5.0,
  });

export const notifyNewUser = (user: any) =>
  triggerN8N('volta-user-register', {
    firebaseId: user.uid || user.id,
    name: user.displayName || user.name,
    email: user.email,
    phone: user.phoneNumber || user.phone,
  });

export const notifyNewBooking = (booking: any, carData: any) =>
  triggerN8N('volta-booking', {
    firebaseId: booking.id,
    bookingCode: booking.bookingCode,
    customerName: booking.customerName || booking.userName,
    phone: booking.phone || booking.userPhone,
    email: booking.email || booking.userEmail,
    vehicle: `${carData.make} ${carData.model}`,
    carId: carData.id,
    plateNumber: carData.plateNumber,
    pickupLocation: booking.pickupLocation || 'Dar es Salaam',
    startDate: booking.startDate,
    endDate: booking.endDate,
    dailyRate: Number(carData.dailyRate || carData.pricePerDay),
    chauffeur: booking.chauffeur || booking.driverIncluded || false,
    notes: booking.notes || '',
  });
