import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        elements: {
          formButtonPrimary: "bg-accent hover:bg-accent/80",
          card: "bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4",
          headerTitle: "text-white text-2xl font-bold",
          headerSubtitle: "text-gray-300",
          socialButtonsBlockButton: "border-gray-500 text-white hover:bg-white/10",
          formFieldInput: "bg-white/10 border-gray-500 text-white placeholder-gray-400",
          footerActionLink: "text-accent hover:text-accent/80",
        },
      }}
    />
  );
}
