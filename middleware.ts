export { default } from "next-auth/middleware"

// Protect every route under /dashboard.
// Unauthenticated users are redirected to /api/auth/signin (NextAuth default)
// which we override to /login via authOptions.pages.signIn

export const config = {
  matcher: ["/dashboard/:path*"],
}
