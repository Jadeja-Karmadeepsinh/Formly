import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

import { LoginForm } from "~/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6 md:p-10">
      {/* 
        Optional Full-page Background Layer:
        You can uncomment or customize this layer in the future for an SVG, PNG, or abstract pattern:
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] opacity-50" 
        />
      */}

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <GalleryVerticalEnd className="size-3.5" />
          </div>
          Formly
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}

