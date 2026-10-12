import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const user = await requireAuth();
    const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") || 1));
    const pageSize = Math.min(50, Math.max(1, Number(new URL(req.url).searchParams.get("pageSize") || 20)));
    const [items, total, unread] = await Promise.all([
      db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
      db.notification.count({ where: { userId: user.id } }),
      db.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    return NextResponse.json({ items, total, unread, page, pageSize, pages: Math.ceil(total / pageSize) });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await requireAuth();
    const { notificationId, all } = await req.json();
    if (all) {
      await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
      return NextResponse.json({ ok: true });
    }
    const updated = await db.notification.updateMany({ where: { id: notificationId, userId: user.id }, data: { readAt: new Date() } });
    if (!updated.count) return new NextResponse("Notification not found", { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return new NextResponse(error?.message || "Internal Error", { status: error?.status || 500 });
  }
}
