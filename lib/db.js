import { PrismaClient } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

export const db = globalThis.prisma || new PrismaClient();

if (!isProduction) {
    globalThis.prisma = db;
}
