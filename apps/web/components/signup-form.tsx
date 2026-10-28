"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { cn, getSafeRedirect } from "~/lib/utils";
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
import { useSignUp, useResendVerification, useSocialSignIn } from "~/hooks/api/auth";
import { authClient } from "~/lib/auth-client";

// Validation schema matching backend requirements & security best practices
const signupFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(100, "Full name cannot exceed 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z
      .string()
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupFormSchema>;

export interface SignupFormProps extends React.ComponentProps<"div"> {
  backgroundImage?: string;
  backgroundElement?: React.ReactNode;
}

export function SignupForm({
  className,
  backgroundImage,
  backgroundElement,
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verification pending state
  const [isVerificationPending, setIsVerificationPending] = React.useState<boolean>(false);
  const [submittedEmail, setSubmittedEmail] = React.useState<string>("");
  const [resendCooldown, setResendCooldown] = React.useState<number>(0);

  const {
    createUserWithEmailAndPasswordAsync,
    isPending: isSignUpPending,
    isError: isSignUpError,
    error: apiError,
  } = useSignUp();

  const {
    signInWithSocial,
    isPending: isSocialPending,
    pendingProvider,
  } = useSocialSignIn();

  const {
    resendVerificationAsync,
    isPending: isResending,
  } = useResendVerification();

  const isAnyPending = isSignUpPending || isSocialPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  // Resend cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Cross-tab session detection while verification is pending
  React.useEffect(() => {
    if (!isVerificationPending) return;

    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.session && isMounted) {
          toast.success("Email verified!", {
            description: "Session detected. Redirecting to your dashboard...",
          });
          clearInterval(pollInterval);
          const safeRedirect = getSafeRedirect(searchParams?.get("redirect"));
          router.replace(safeRedirect);
        }
      } catch {
        // Silently continue polling
      }
    };

    // Initial check
    void checkSession();

    // Check periodically every 3 seconds
    pollInterval = setInterval(() => {
      void checkSession();
    }, 3000);

    // Recheck immediately when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void checkSession();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", checkSession);

    // Safety timeout: stop high-frequency polling after 10 minutes
    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
    }, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      clearTimeout(timeout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", checkSession);
    };
  }, [isVerificationPending, router, searchParams]);

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setSubmittedEmail(values.email);
      await createUserWithEmailAndPasswordAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      // Switch to Verification Pending view instead of navigating away
      setIsVerificationPending(true);
      setResendCooldown(60);
      toast.success("Account created!", {
        description: `A verification email has been sent to ${values.email}.`,
      });
      reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create your account. Please try again.";
      toast.error("Account creation failed", {
        description: errorMessage,
      });
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || isResending || !submittedEmail) return;
    try {
      await resendVerificationAsync({ email: submittedEmail });
      setResendCooldown(60);
      toast.success("Verification link sent", {
        description: "Please check your inbox and spam folder.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to resend verification email.";
      toast.error("Resend failed", { description: msg });
    }
  };

  const handleSocialSignIn = async (provider: "google" | "github") => {
    try {
      const redirectParam = searchParams?.get("redirect");
      const safeRedirect = getSafeRedirect(redirectParam);
      await signInWithSocial(provider, safeRedirect);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect to provider.";
      toast.error("Authentication failed", { description: message });
    }
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

      <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
        {isVerificationPending ? (
          /* ================= VERIFICATION PENDING STATE ================= */
          <div className="animate-in fade-in-50 duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/5 text-primary">
                <Mail className="size-6" />
              </div>
              <CardTitle className="text-xl font-semibold tracking-tight">
                Check your inbox
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                We sent a verification link to{" "}
                <strong className="text-foreground">{submittedEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div
                role="status"
                className="rounded-lg border border-border/60 bg-muted/30 p-3.5 text-xs text-muted-foreground space-y-2"
              >
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Click the link in your email to activate your account</span>
                </div>
                <p className="leading-relaxed pl-6">
                  Once verified, this page will automatically redirect you to your dashboard. Be sure to check your spam or junk folder if you don&apos;t see the message within a minute.
                </p>
              </div>

              {/* Resend Action */}
              <div className="text-xs text-muted-foreground text-center" aria-live="polite">
                Didn&apos;t receive the email?{" "}
                {resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors cursor-pointer inline-flex items-center gap-1"
                  >
                    {isResending ? (
                      <>
                        <Spinner className="size-3" /> Sending...
                      </>
                    ) : (
                      "Click to resend"
                    )}
                  </button>
                )}
              </div>

              {/* Navigation Options */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsVerificationPending(false)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-normal"
                >
                  <RefreshCw className="size-3.5" />
                  Use a different email address
                </Button>
                <Link href="/login" className="w-full block">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center gap-2 text-xs font-normal text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </div>
        ) : (
          /* ================= STANDARD SIGNUP FORM ================= */
          <>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Create your account
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Enter your details below to get started with Formly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-5">
                {/* Social OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isAnyPending}
                    onClick={() => handleSocialSignIn("google")}
                    className="w-full flex items-center justify-center gap-2 font-normal transition-colors cursor-pointer"
                  >
                    {pendingProvider === "google" ? (
                      <>
                        <Spinner className="size-4 shrink-0" />
                        Google
                      </>
                    ) : (
                      <>
                        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isAnyPending}
                    onClick={() => handleSocialSignIn("github")}
                    className="w-full flex items-center justify-center gap-2 font-normal transition-colors cursor-pointer"
                  >
                    {pendingProvider === "github" ? (
                      <>
                        <Spinner className="size-4 shrink-0" />
                        GitHub
                      </>
                    ) : (
                      <>
                        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        GitHub
                      </>
                    )}
                  </Button>
                </div>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card text-xs text-muted-foreground">
                  Or continue with email
                </FieldSeparator>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <FieldGroup className="gap-4">
                    {/* Error Banner */}
                    {isSignUpError && (
                      <div
                        role="alert"
                        className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in-50 duration-200"
                      >
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-medium">Could not create account</p>
                          <p className="text-muted-foreground">
                            {apiError?.message || "An unexpected error occurred. Please try again."}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Full Name */}
                    <Field data-invalid={!!errors.fullName}>
                      <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        autoComplete="name"
                        disabled={isAnyPending}
                        aria-invalid={!!errors.fullName}
                        aria-describedby={errors.fullName ? "signup-fullname-error" : undefined}
                        {...register("fullName")}
                      />
                      {errors.fullName?.message && (
                        <FieldError id="signup-fullname-error">{errors.fullName.message}</FieldError>
                      )}
                    </Field>

                    {/* Email */}
                    <Field data-invalid={!!errors.email}>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        autoComplete="email"
                        disabled={isAnyPending}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "signup-email-error" : undefined}
                        {...register("email")}
                      />
                      {errors.email?.message && (
                        <FieldError id="signup-email-error">{errors.email.message}</FieldError>
                      )}
                    </Field>

                    {/* Password */}
                    <Field data-invalid={!!errors.password}>
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <PasswordInput
                        id="password"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isAnyPending}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "signup-password-error" : undefined}
                        {...register("password")}
                      />
                      {errors.password?.message && (
                        <FieldError id="signup-password-error">{errors.password.message}</FieldError>
                      )}
                    </Field>

                    {/* Confirm Password */}
                    <Field data-invalid={!!errors.confirmPassword}>
                      <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                      <PasswordInput
                        id="confirmPassword"
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isAnyPending}
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword?.message && (
                        <FieldError id="signup-confirm-error">{errors.confirmPassword.message}</FieldError>
                      )}
                    </Field>

                    {/* Submit Button & Sign In Link */}
                    <Field className="pt-1">
                      <Button
                        type="submit"
                        disabled={isAnyPending}
                        className="w-full font-medium transition-all"
                      >
                        {isSignUpPending ? (
                          <>
                            <Spinner className="mr-2 size-4" />
                            Creating account...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                      <FieldDescription className="text-center text-xs mt-3">
                        Already have an account?{" "}
                        <Link
                          href="/login"
                          className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
                        >
                          Sign in
                        </Link>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              </div>
            </CardContent>
          </>
        )}
      </Card>

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
