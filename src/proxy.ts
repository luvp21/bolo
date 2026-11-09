import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Practice pages need a signed-in Google account. The home page, sign-in and the
// demo video stay public. API routes check sign-in and usage themselves (quotaServer.ts).
const isPracticeRoute = createRouteMatcher(["/tech(.*)", "/grammar(.*)", "/creator(.*)", "/convo(.*)", "/lab(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    if (isPracticeRoute(req)) await auth.protect();
  },
  { signInUrl: "/sign-in" },
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
