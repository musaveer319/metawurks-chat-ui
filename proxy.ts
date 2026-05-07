import { withAuth } from "next-auth/middleware";
export default withAuth;

export const config = {
  // Matches all paths except api/auth routes, login, signup, static files, and images
  matcher: ["/((?!api/auth|login|signup|_next/static|_next/image|favicon.ico).*)"],
}
