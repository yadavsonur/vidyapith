import { PrismaClient } from "@prisma/client"; // Correct import statement

declare global {
    var prisma: PrismaClient | undefined; // Correct global declaration
}

const isProduction = process.env.NODE_ENV === "production";

export const db = globalThis.prisma || new PrismaClient();

if (!isProduction) {
    globalThis.prisma = db;
}
