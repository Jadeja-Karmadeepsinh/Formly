"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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
import { useForgotPassword } from "~/hooks/api/auth";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

export function ForgotPasswordForm({ onBackToSignIn }: ForgotPasswordFormProps) {
  const [cooldown, setCooldown] = React.useState<number>(0);
  const [submittedEmail, setSubmittedEmail] = React.useState<string>("");

  const { requestPasswordResetAsync, isPending, isSuccess, isError, error } =
    useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  // Cooldown countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      setSubmittedEmail(values.email);
      await requestPasswordResetAsync({ email: values.email });
      setCooldown(60);
      toast.success("Reset link sent", {
        description: "If an account exists, you will receive an email shortly.",
      });
    } catch {
      toast.error("Something went wrong, please try again.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !submittedEmail) return;
    try {
      await requestPasswordResetAsync({ email: submittedEmail });
      setCooldown(60);
      toast.success("Reset link resent.");
    } catch {
      toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Forgot password?
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {isSuccess
            ? "Check your inbox for a reset link"
            : "Enter your email address and we'll send you a link to reset your password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col gap-5 animate-in fade-in-50 duration-200">
            <div
              role="status"
              className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-800 dark:text-emerald-400"
            >
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">Instructions sent</p>
                <p className="text-muted-foreground leading-relaxed">
                  If an account exists for <strong className="text-foreground">{submittedEmail}</strong>, we have sent password reset instructions.
                </p>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center" aria-live="polite">
              Didn&apos;t receive the email?{" "}
              {cooldown > 0 ? (
                <span>Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isPending}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors cursor-pointer"
                >
                  Click to resend
                </button>
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onBackToSignIn}
              className="w-full flex items-center justify-center gap-2 font-normal"
            >
              <ArrowLeft className="size-4" />
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup className="gap-4">
              {isError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in-50 duration-200"
                >
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-medium">Request failed</p>
                    <p className="text-muted-foreground">
                      {error?.message || "Something went wrong. Please try again."}
                    </p>
                  </div>
                </div>
              )}

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  disabled={isPending}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "reset-email-error" : undefined}
                  {...register("email")}
                />
                {errors.email?.message && (
                  <FieldError id="reset-email-error">{errors.email.message}</FieldError>
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
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <FieldDescription className="text-center text-xs mt-3">
                  <button
                    type="button"
                    onClick={onBackToSignIn}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="size-3.5" />
                    Back to sign in
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
