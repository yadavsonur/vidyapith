import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

const processCheckoutCompleted = async (session, eventId) => {
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;
  if (!userId || !courseId) throw new Error("Missing checkout metadata");
  
  return db.$transaction(async (tx) => {
    await tx.user.upsert({ where: { id: userId }, update: {}, create: { id: userId, role: "STUDENT" } });
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : null;
    const amount = Number(session.amount_total || 0) / 100;
    const currency = String(session.currency || "usd").toUpperCase();
    const existing = await tx.purchase.findUnique({ where: { userId_courseId: { userId, courseId } } });
    
    if (existing?.status === "REFUNDED") {
      await tx.paymentEvent.update({ where: { stripeEventId: eventId }, data: { purchaseId: existing.id, processedAt: new Date() } });
      return existing;
    }
    
    const purchase = existing
      ? await tx.purchase.update({ where: { id: existing.id }, data: { amount, currency, status: "SUCCEEDED", stripeCheckoutSessionId: session.id, stripePaymentIntentId: paymentIntentId, lastWebhookEventId: eventId, stripeRefundId: null } })
      : await tx.purchase.create({ data: { userId, courseId, amount, currency, status: "SUCCEEDED", stripeCheckoutSessionId: session.id, stripePaymentIntentId: paymentIntentId, lastWebhookEventId: eventId } });
      
    await tx.enrollment.upsert({ where: { userId_courseId: { userId, courseId } }, update: { status: "ACTIVE", completedAt: null }, create: { userId, courseId, status: "ACTIVE" } });
    await tx.paymentEvent.update({ where: { stripeEventId: eventId }, data: { purchaseId: purchase.id, processedAt: new Date() } });
    
    // Direct transaction queries to prevent transaction context loss
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "PAYMENT_SUCCEEDED",
        entityType: "Purchase",
        entityId: purchase.id,
        metadata: JSON.stringify({ stripeEventId: eventId, courseId, amount, currency }),
      },
    });

    await tx.notification.create({
      data: {
        userId,
        type: "PAYMENT_SUCCEEDED",
        title: "Payment successful",
        body: "Your purchase is confirmed and course access is active.",
        link: `/courses/${courseId}`,
        dedupeKey: `payment-succeeded:${eventId}`,
      },
    }).catch(() => {}); // Catch duplicate dedupeKey gracefully if retried

    return purchase;
  }, {
    maxWait: 10000,
    timeout: 15000,
  });
};

const processRefund = async (object, eventId) => {
  const paymentIntentId = typeof object.payment_intent === "string" ? object.payment_intent : null;
  const purchase = await db.purchase.findFirst({ where: paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : { stripeCheckoutSessionId: object.checkout_session || "" } });
  if (!purchase) return null;
  return db.$transaction(async (tx) => {
    const updated = await tx.purchase.update({ where: { id: purchase.id }, data: { status: "REFUNDED", stripeRefundId: typeof object.id === "string" ? object.id : null, lastWebhookEventId: eventId } });
    await tx.enrollment.updateMany({ where: { userId: purchase.userId, courseId: purchase.courseId }, data: { status: "CANCELLED", completedAt: null } });
    await tx.paymentEvent.update({ where: { stripeEventId: eventId }, data: { purchaseId: updated.id, processedAt: new Date() } });
    await writeAuditLog({ actorId: null, action: "PAYMENT_REFUNDED", entityType: "Purchase", entityId: updated.id, metadata: { stripeEventId: eventId, refundId: updated.stripeRefundId }, tx });
    await createNotification({ userId: purchase.userId, type: "PAYMENT_REFUNDED", title: "Payment refunded", body: "Your refund was recorded and access to the purchased course has been revoked.", link: `/payments`, dedupeKey: `payment-refunded:${eventId}`, tx });
    return updated;
  }, {
    maxWait: 10000,
    timeout: 15000,
  });
};

export async function POST(req) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    await db.paymentEvent.create({ data: { stripeEventId: event.id, type: event.type } });
  } catch (error) {
    if (error?.code !== "P2002") return new NextResponse("Webhook event persistence failed", { status: 500 });
    const existingEvent = await db.paymentEvent.findUnique({ where: { stripeEventId: event.id }, select: { processedAt: true } });
    if (existingEvent?.processedAt) return new NextResponse(null, { status: 200 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await processCheckoutCompleted(event.data.object, event.id);
    } else if (event.type === "charge.refunded") {
      await processRefund(event.data.object, event.id);
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const purchase = await db.purchase.findFirst({ where: { stripePaymentIntentId: paymentIntent.id } });
      if (purchase) await db.$transaction(async (tx) => {
        await tx.purchase.update({ where: { id: purchase.id }, data: { status: "FAILED", lastWebhookEventId: event.id } });
        await tx.paymentEvent.update({ where: { stripeEventId: event.id }, data: { purchaseId: purchase.id, processedAt: new Date() } });
        await writeAuditLog({ actorId: null, action: "PAYMENT_FAILED", entityType: "Purchase", entityId: purchase.id, metadata: { stripeEventId: event.id }, tx });
        await createNotification({ userId: purchase.userId, type: "SYSTEM", title: "Payment failed", body: "Stripe reported that your course payment failed. No course access was granted.", link: `/courses/${purchase.courseId}`, dedupeKey: `payment-failed:${event.id}`, tx });
      }, {
        maxWait: 10000,
        timeout: 15000,
      });
    } else {
      await db.paymentEvent.update({ where: { stripeEventId: event.id }, data: { processedAt: new Date() } });
    }
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK]", error);
    return new NextResponse("Webhook processing failed", { status: 500 });
  }
}