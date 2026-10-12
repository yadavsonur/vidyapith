import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    "/",
    "/search(.*)",
    "/courses(.*)",
    "/instructors(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/uploadthing(.*)",
    "/api/webhook(.*)",
  ],
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
