import * as React from "react";
import { Metadata } from "next";
import { PublicFormRunner } from "./public-form-runner";

interface PublicFormPageProps {
  params: Promise<{
    shareId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicFormPageProps): Promise<Metadata> {
  const { shareId } = await params;
  return {
    title: `Form | Formly`,
    description: "Fill out and submit this form on Formly.",
  };
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { shareId } = await params;
  return <PublicFormRunner shareId={shareId} />;
}

