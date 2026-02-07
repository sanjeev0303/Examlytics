import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="p-8 rounded-2xl backdrop-blur-xl bg-white/10 shadow-2xl border border-white/20">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400 text-sm">Sign in to access the admin dashboard</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              card: "bg-transparent shadow-none",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-gray-600 text-white hover:bg-white/10",
              formFieldInput:
                "bg-white/10 border-gray-600 text-white placeholder-gray-400",
              footerActionLink: "text-blue-400 hover:text-blue-300",
            },
          }}
        />
      </div>
    </div>
  );
}
