/**
 * 体验包权益预约 (PRD §12.4/§38.2): benefits live on the PACKAGE ORDER — each
 * included activity is bookable once per package; booking runs the same PRD
 * §9.2 checks as a standalone registration (age fit, quota, duplicate,
 * time-conflict), issues a voucher, and joins the org check-in flow.
 */

import type { PackageBenefitView } from './ports.js';
import type { BenefitBooking, Order } from './types.js';
import type { ZhiyaMockState } from './state.js';
import { applyEnrollmentDelta } from './state.js';
import { ageOf } from './familyClient.js';

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeVoucherCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = 'ZY';
  for (let index = 0; index < 6; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Read-only benefit views for the order detail (booked state + voucher). */
export function listPackageBenefits(state: ZhiyaMockState, orderId: string): PackageBenefitView[] {
  const order = state.orders.find((entry) => entry.id === orderId);
  if (order === undefined || order.type !== 'package') {
    throw new Error(`package order not found: ${orderId}`);
  }
  const packageId = order.items[0]?.packageId ?? '';
  const pkg = state.packages.find((entry) => entry.id === packageId);
  if (pkg === undefined) {
    throw new Error(`package not found: ${packageId}`);
  }
  const bookings = state.benefitBookings.filter((booking) => booking.packageOrderId === orderId);
  return pkg.activityIds.map((activityId) => {
    const activity = state.findActivity(activityId);
    const booking = bookings.find((entry) => entry.activityId === activityId && entry.status !== 'cancelled');
    const view: PackageBenefitView = {
      activityId,
      title: activity?.title ?? activityId,
      emoji: activity?.emoji ?? '📌',
      orgName: activity?.orgName ?? '',
      category: activity?.category ?? 'other',
      mode: activity?.mode ?? 'offline',
      ageMin: activity?.ageMin ?? 3,
      ageMax: activity?.ageMax ?? 12,
      price: activity?.price ?? 0,
      booked: booking !== undefined,
    };
    if (booking !== undefined) {
      view.bookingId = booking.id;
      view.voucherCode = booking.voucherCode;
      view.checkInState = booking.status === 'checked-in' ? 'checked-in' : 'none';
    }
    return view;
  });
}

/** Book one benefit visit; runs PRD §9.2 checks and issues a voucher. */
export function bookPackageBenefit(
  state: ZhiyaMockState,
  input: { orderId: string; activityId: string; sessionId: string; childId: string },
): BenefitBooking {
  const order = state.orders.find((entry) => entry.id === input.orderId);
  if (order === undefined || order.type !== 'package') {
    throw new Error(`package order not found: ${input.orderId}`);
  }
  if (order.status !== 'paid') {
    throw new Error(`package order not paid: ${input.orderId}`);
  }
  const packageId = order.items[0]?.packageId ?? '';
  const pkg = state.packages.find((entry) => entry.id === packageId);
  if (pkg === undefined || !pkg.activityIds.includes(input.activityId)) {
    throw new Error(`activity not in package: ${input.activityId}`);
  }
  const child = state.family?.children.find((entry) => entry.id === input.childId);
  if (child === undefined) {
    throw new Error(`child not found: ${input.childId}`);
  }
  const activity = state.findActivity(input.activityId);
  if (activity === null) {
    throw new Error(`activity not found: ${input.activityId}`);
  }
  if (activity.status !== 'published') {
    throw new Error(`activity not published: ${input.activityId}`);
  }
  const session = activity.sessions.find((entry) => entry.id === input.sessionId);
  if (session === undefined) {
    throw new Error(`session not found: ${input.sessionId}`);
  }
  if (session.enrolled >= session.quota) {
    throw new Error(`session sold out: ${input.sessionId}`);
  }
  const age = ageOf(child, state.now());
  if (age < activity.ageMin || age > activity.ageMax) {
    throw new Error(`child age ${age} outside [${activity.ageMin}, ${activity.ageMax}]`);
  }
  const duplicate = state.benefitBookings.find(
    (booking) =>
      booking.packageOrderId === order.id &&
      booking.activityId === input.activityId &&
      booking.status !== 'cancelled',
  );
  if (duplicate !== undefined) {
    throw new Error(`benefit already booked: ${input.activityId}`);
  }
  const conflict = state.benefitBookings.find((booking) => {
    if (booking.childId !== child.id || booking.status === 'cancelled') {
      return false;
    }
    const other = state.findActivity(booking.activityId);
    const otherSession = other?.sessions.find((entry) => entry.id === booking.sessionId);
    if (other === undefined || otherSession === undefined) {
      return false;
    }
    return (
      new Date(session.startTime).getTime() < new Date(otherSession.endTime).getTime() &&
      new Date(otherSession.startTime).getTime() < new Date(session.endTime).getTime()
    );
  });
  if (conflict !== undefined) {
    throw new Error(`time conflict with booking ${conflict.id}`);
  }

  const booking: BenefitBooking = {
    id: makeId('bkg'),
    packageOrderId: order.id,
    packageId,
    activityId: input.activityId,
    sessionId: input.sessionId,
    childId: child.id,
    childName: child.nickname,
    voucherCode: makeVoucherCode(),
    status: 'booked',
    createdAt: state.now().toISOString(),
  };
  state.benefitBookings.push(booking);
  applyEnrollmentDelta(state, input.activityId, input.sessionId, +1);
  state.persist();
  state.notify({
    category: 'registration',
    title: '权益预约成功',
    body: `「${activity.title}」已预约，凭证码 ${booking.voucherCode}。`,
    orderId: order.id,
  });
  return booking;
}

/** Paid package orders expose benefit management. */
export function orderHasBenefits(order: Order): boolean {
  return order.type === 'package' && order.status === 'paid';
}
