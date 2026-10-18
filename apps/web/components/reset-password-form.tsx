"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
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
import { PasswordInput } from "~/components/ui/password-input";
import { Spinner } from "~/components/ui/spinner";
import { useResetPassword } from "~/hooks/api/auth";

const resetPasswordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100, "Password cannot exceed 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();

  const { resetPasswordAsync, isPending, isError, error } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      await resetPasswordAsync({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });

      toast.success("Password updated", {
        description: "Your password has been changed successfully.",
      });

      router.push("/login?reset=success");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="border-border/80 bg-card/95 shadow-xs backdrop-blur-xs">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Set new password
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your new password below to regain access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="gap-4">
            {isError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive animate-in fade-in-50 duration-200"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium">Reset failed</p>
                  <p className="text-muted-foreground">
                    {error?.message || "Invalid or expired reset link."}
                  </p>
                </div>
              </div>
            )}

            {/* New Password */}
            <Field data-invalid={!!errors.newPassword}>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
              <PasswordInput
                id="newPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "reset-new-error" : "reset-new-hint"
                }
                {...register("newPassword")}
              />
              {errors.newPassword?.message ? (
                <FieldError id="reset-new-error">{errors.newPassword.message}</FieldError>
              ) : (
                <FieldDescription id="reset-new-hint" className="text-xs text-muted-foreground mt-1">
                  Must be at least 8 characters long.
                </FieldDescription>
              )}
            </Field>

            {/* Confirm Password */}
            <Field data-invalid={!!errors.confirmPassword}>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "reset-confirm-error" : undefined
                }
                {...register("confirmPassword")}
              />
              {errors.confirmPassword?.message && (
                <FieldError id="reset-confirm-error">{errors.confirmPassword.message}</FieldError>
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
                    Updating password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
