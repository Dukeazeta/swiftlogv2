import { signIn } from "@/lib/auth";

const errorMessages: Record<string, string> = {
  AccessDenied: "Google sign-in was denied. Please try again.",
  CallbackRouteError:
    "We could not finish Google sign-in. Please check your connection and try again.",
  Configuration:
    "Google sign-in could not reach the provider. Please check your internet or DNS and try again.",
  Default: "Sign-in failed. Please try again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorCode = params?.error;
  const errorMessage =
    (errorCode && errorMessages[errorCode]) || (errorCode ? errorMessages.Default : null);

  return (
    <div className="w-full bg-canvas border border-border-gray rounded-lg p-8 md:p-10 shadow-card">
      <div className="space-y-2 text-center mb-10">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-webflow-blue rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-2xl tracking-tighter">S</span>
          </div>
        </div>
        <h1 className="text-[24px] font-display font-semibold tracking-[-0.02em] text-near-black">Sign in to SwiftLogNG</h1>
        <p className="text-[15px] text-mid-gray font-medium">
          The AI-powered logbook assistant
        </p>
      </div>

      <div className="space-y-6">
        {errorMessage && (
          <div className="rounded-md border border-accent-red/30 bg-accent-red/5 px-4 py-3 text-[14px] text-near-black font-medium text-center">
            {errorMessage}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-canvas border border-border-gray focus:outline-none focus:ring-2 focus:ring-webflow-blue focus:ring-offset-2 hover:border-border-hover text-near-black rounded-md px-4 py-3 text-[15px] font-medium transition-all duration-200 hover:translate-y-[2px] active:scale-[0.97]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-[13px] text-gray-300 pt-4">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
