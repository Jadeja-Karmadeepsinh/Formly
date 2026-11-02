import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { FormPreviewClient } from "./preview-client";

interface FormPreviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormPreviewPage({ params }: FormPreviewPageProps) {
  const { id } = await params;
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect(`/login?redirect=/dashboard/forms/${id}/preview`);
  }

  return <FormPreviewClient formId={id} />;
}

