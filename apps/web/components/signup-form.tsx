"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2 } from "lucide-react";
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
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isPending}
                      aria-invalid={!!errors.password}
                      {...register("password")}
                    />
                    {errors.password?.message && (
                      <FieldError>{errors.password.message}</FieldError>
                    )}
                  </Field>

                  <Field data-invalid={!!errors.confirmPassword}>
                    <FieldLabel htmlFor="confirmPassword">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isPending}
                      aria-invalid={!!errors.confirmPassword}
                      {...register("confirmPassword")}
                    />
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
                  <a
                    href="/login"
                    className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors"
                  >
                    Sign in
                  </a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
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

