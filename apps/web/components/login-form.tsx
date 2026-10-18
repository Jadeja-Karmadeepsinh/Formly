"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/ui/password-input";
import { Spinner } from "~/components/ui/spinner";
import { useSignIn } from "~/hooks/api/auth";
import { ForgotPasswordForm } from "./forgot-password-form";

const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export interface LoginFormProps extends React.ComponentProps<"div"> {
  backgroundImage?: string;
  backgroundElement?: React.ReactNode;
  initialView?: "signin" | "forgot";
}

export function LoginForm({
  className,
  backgroundImage,
  backgroundElement,
  initialView = "signin",
  ...props
}: LoginFormProps) {
  const searchParams = useSearchParams();

  const [view, setView] = React.useState<"signin" | "forgot">(initialView);
  const [showResetSuccess, setShowResetSuccess] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (searchParams.get("reset") === "success") {
      setShowResetSuccess(true);
      // Clean up URL so page refresh won't show the banner again
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
      const timer = setTimeout(() => {
        setShowResetSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const {
    signInUserWithEmailAndPasswordAsync,
    isPending,
    isSuccess,
    isError,
    error: apiError,
  } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await signInUserWithEmailAndPasswordAsync({
        email: values.email,
        password: values.password,
      });

      toast.success("Welcome back!", {
        description: `Signed in as ${response.fullName || values.email}`,
      });

      reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      toast.error("Sign in failed", {
        description: errorMessage,
      });
    }
  };

  const handleGoogleClick = () => {
    console.log("clicked on google");
    toast.info("Google sign-in clicked");
  };

  const handleGithubClick = () => {
    console.log("clicked on github");
    toast.info("GitHub sign-in clicked");
  };

  return (
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      {(backgroundImage || backgroundElement) && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-8 -z-10 overflow-hidden rounded-3xl opacity-40 transition-opacity duration-300"
          style={
            backgroundImage
              ? {
                  backgroundImage: `url(${backgroundImage})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }
              : undefined
          }
        >
          {backgroundElement}
        </div>
      )}

      {view === "forgot" ? (
        <ForgotPasswordForm onBackToSignIn={() => setView("signin")} />
      ) : (
        <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Welcome back
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Sign in to your Formly account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              {/* Reset password success banner */}
              {showResetSuccess && (
                <div
                  role="status"
                  className="relative flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 pr-8 text-xs text-emerald-800 dark:text-emerald-400 animate-in fade-in-50 duration-200"
                >
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium">Password reset successful</p>
                    <p className="text-muted-foreground">
                      Your password has been reset. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResetSuccess(false)}
                    className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Dismiss message"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              {/* Social OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleGoogleClick}
                  className="w-full flex items-center justify-center gap-2 font-normal transition-colors"
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={handleGithubClick}
                  className="w-full flex items-center justify-center gap-2 font-normal transition-colors"
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </Button>
              </div>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs text-muted-foreground">
                Or continue with email
              </FieldSeparator>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <FieldGroup className="gap-4">
                  {isError && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in-50 duration-200"
                    >
                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-medium">Could not sign in</p>
                        <p className="text-muted-foreground">
                          {apiError?.message || "Invalid credentials. Please try again."}
                        </p>
                      </div>
                    </div>
                  )}

                  {isSuccess && (
                    <div
                      role="status"
                      className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in-50 duration-200"
                    >
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-medium">Signed in successfully</p>
                        <p className="text-muted-foreground">
                          Redirecting to your workspace...
                        </p>
                      </div>
                    </div>
                  )}

                  <Field data-invalid={!!errors.email}>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                      disabled={isPending}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "login-email-error" : undefined}
                      {...register("email")}
                    />
                    {errors.email?.message && (
                      <FieldError id="login-email-error">{errors.email.message}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.password}>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordInput
                      id="login-password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isPending}
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "login-password-error" : undefined}
                      {...register("password")}
                    />
                    {errors.password?.message && (
                      <FieldError id="login-password-error">{errors.password.message}</FieldError>
                    )}
                  </Field>

                  <Field className="pt-1">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full font-medium transition-all"
                    >
                      {isPending ? (
                        <>
                          <Spinner className="mr-2 size-4" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                    <FieldDescription className="text-center text-xs mt-3">
                      Don&apos;t have an account?{" "}
                      <Link
                        href="/signup"
                        className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
                      >
                        Sign up
                      </Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </div>
          </CardContent>
        </Card>
      )}

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  );
}
