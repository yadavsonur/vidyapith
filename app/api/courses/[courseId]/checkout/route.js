import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { assertRateLimit } from "@/lib/rate-limit";

export async function POST(req, { params }) {
  try {
    const user = await requireAuth();
    assertRateLimit(req, user.id, { limit: 10, windowMs: 60_000 });
    const course = await db.course.findUnique({ where: { id: params.courseId, isPublished: true } });
    if (!course) return new NextResponse("Not Found", { status: 404 });
    if (Number(course.price || 0) <= 0) return new NextResponse("This course is free. Use the enroll action.", { status: 400 });

    const [purchase, enrollment, clerkUser] = await Promise.all([
      db.purchase.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
      db.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } }),
      currentUser(),
    ]);
    if (purchase?.status === "SUCCEEDED" || enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED") return new NextResponse("Already enrolled", { status: 400 });

    let stripeCustomer = await db.stripeCustomer.findUnique({ where: { userId: user.id }, select: { stripeCustomerId: true } });
    const email = clerkUser?.emailAddresses?.find((item) => item.id === clerkUser.primaryEmailAddressId)?.emailAddress;
    if (!stripeCustomer) {
      const customer = await stripe.customers.create({ email: email || undefined, metadata: { clerkUserId: user.id } });
      stripeCustomer = await db.stripeCustomer.create({ data: { userId: user.id, stripeCustomerId: customer.id } });
    }
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.headers.get("origin") || "https://vidyapith-three.vercel.app";

    const session = await stripe.checkout.sessions.create({
    
      customer: stripeCustomer.stripeCustomerId,
      line_items: [{ quantity: 1, price_data: { currency: "usd", product_data: { name: course.title, description: course.description || undefined }, unit_amount: Math.round(Number(course.price) * 100) } }],
      mode: "payment",
      success_url: `${baseUrl}/courses/${course.id}?success=1`,
      cancel_url: `${baseUrl}/courses/${course.id}?cancel=1`,
      metadata: { courseId: course.id, userId: user.id },
    });

    await db.purchase.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: { status: "PENDING", amount: Number(course.price), currency: "USD", stripeCheckoutSessionId: session.id, stripePaymentIntentId: null, stripeRefundId: null },
      create: { userId: user.id, courseId: course.id, amount: Number(course.price), currency: "USD", status: "PENDING", stripeCheckoutSessionId: session.id },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500, headers: error?.retryAfter ? { "Retry-After": String(error.retryAfter) } : undefined });
  }
}
