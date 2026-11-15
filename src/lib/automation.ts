/**
 * @fileOverview Automation-facing n8n triggers with AI strategic payloads
 * (risk detection, personality tags, accounting-ready amounts).
 * Delivery is delegated to the shared hardened core — no duplicated fetch logic.
 * Kept as a stable API surface for booking/accounting flows.
 */

import { sendEnvelope } from '@/lib/n8n/core';

export interface AutomationResult {
  ok: boolean;
  error?: string;
}

async function triggerAutomation(endpoint: string, data: any): Promise<boolean> {
  const result = await sendEnvelope(endpoint, {
    // ── Core (accounting-sheet ready) ────────────────────────────────
    bookingCode: data.bookingCode,
    customerName: data.userName,
    phone: data.userPhone,
    email: data.userEmail,
    vehicle: data.vehicleName,
    pickupLocation: data.pickupLocation,
    startDate: data.startDate,
    endDate: data.endDate,
    duration: data.totalDays,
    amount: data.totalPrice,
    status: data.status,
    paymentStatus: data.paymentStatus,
    amountPaid: data.amountPaid || 0,
    balanceDue: (data.totalPrice || 0) - (data.amountPaid || 0),

    // ── AI strategic inputs (for Gemini nodes) ───────────────────────
    aiPersonalityTag: data.aiPersonalityTag || 'standard',
    geminiInsight: data.geminiInsight || '',
    riskStatus: data.riskStatus || 'low',
    riskReason: data.riskReason || '',

    // ── Logistics ────────────────────────────────────────────────────
    driverName: data.driverName || 'UNASSIGNED',
    driverEmail: data.driverEmail || '',
    reminder48Sent: data.reminder48Sent || false,
    reminder24Sent: data.reminder24Sent || false,
    contractUrl: data.contractUrl || '',

    raw: data,
  });
  return result.ok;
}

export const automation = {
  userRegistered: (userData: any) => triggerAutomation('volta-user-register', userData),
  newBooking: (bookingData: any) => triggerAutomation('volta-booking', bookingData),
  paymentVerified: (paymentData: any) => triggerAutomation('payment-verified', paymentData),
  bookingStatusUpdated: (bookingData: any) => triggerAutomation('booking-status-updated', bookingData),
  bookingCompleted: (bookingData: any) => triggerAutomation('booking-completed', bookingData),
  riskAlertTriggered: (alertData: any) => triggerAutomation('risk-alert', alertData),
  pricingStrategyUpdate: (priceData: any) => triggerAutomation('pricing-strategy', priceData),
  telegramBotWebhook: (tgData: any) => triggerAutomation('telegram-webhook', tgData),
};
