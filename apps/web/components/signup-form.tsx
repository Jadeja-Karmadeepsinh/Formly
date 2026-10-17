"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
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
import { Spinner } from "~/components/ui/spinner";
import { useSignUp } from "~/hooks/api/auth";

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
  /**
   * Optional background image URL (PNG, JPG, WebP, SVG data URL, etc.).
   * If provided, renders an elegant backdrop behind the form card.
   */
  backgroundImage?: string;
  /**
   * Optional custom background element (e.g. custom SVG illustration, gradient grid, or pattern).
   */
  backgroundElement?: React.ReactNode;
}

export function SignupForm({
  className,
  backgroundImage,
  backgroundElement,
  ...props
}: SignupFormProps) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);

  // Use tRPC auth mutation hook for signup API integration
  const {
    createUserWithEmailAndPasswordAsync,
    isPending,
    isSuccess,
    isError,
    error: apiError,
  } = useSignUp();

  // Initialize React Hook Form with Zod validation
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

  // Submission handler: logs values, invokes API, handles success & error toasts
  const onSubmit = async (values: SignupFormValues) => {
    // 1. Console log all form values as requested
    console.log("Signup form submitted with values:", values);

    try {
      const response = await createUserWithEmailAndPasswordAsync({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      console.log("Signup successful, server response:", response);

      toast.success("Account created successfully!", {
        description: `Welcome to Formly, ${values.fullName}!`,
      });

      reset();
    } catch (err: unknown) {
      console.error("Signup submission error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create your account. Please try again.";
      toast.error("Account creation failed", {
        description: errorMessage,
      });
    }
  };

  // Google OAuth button handler
  const handleGoogleClick = () => {
    console.log("clicked on google");
    toast.info("Google sign-up clicked");
  };

  // GitHub OAuth button handler
  const handleGithubClick = () => {
    console.log("clicked on github");
    toast.info("GitHub sign-up clicked");
  };

  return (
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      {/* Optional Background Layer (PNG, SVG, or custom background node) */}
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
            <FieldGroup className="gap-5">
              {/* Global Error Banner */}
              {isError && (
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

              {/* Success Banner */}
              {isSuccess && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-emerald-700 dark:text-emerald-400 animate-in fade-in-50 duration-200"
                >
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium">Account created successfully</p>
                    <p className="text-muted-foreground">
                      Your Formly workspace is ready.
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name Field */}
              <Field data-invalid={!!errors.fullName}>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  disabled={isPending}
                  aria-invalid={!!errors.fullName}
                  {...register("fullName")}
                />
                {errors.fullName?.message && (
                  <FieldError>{errors.fullName.message}</FieldError>
                )}
              </Field>

              {/* Email Field */}
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                {errors.email?.message && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              {/* Password & Confirm Password Fields */}
              <Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        aria-invalid={!!errors.password}
                        className="pr-10"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.password?.message && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        disabled={isPending}
                        aria-invalid={!!errors.confirmPassword}
                        className="pr-10"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword?.message && (
                      <FieldError>{errors.confirmPassword.message}</FieldError>
                    )}
                  </Field>
                </div>
                <FieldDescription className="text-xs text-muted-foreground mt-1.5">
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>

              {/* Submit Button & Sign In Link */}
              <Field className="pt-1">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full font-medium transition-all"
                >
                  {isPending ? (
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

