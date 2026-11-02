import { redirect } from "next/navigation";
import { createServerTRPCClient } from "~/trpc/server";
import { FormEditor } from "~/components/editor";

interface FormEditorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FormEditorPage({ params }: FormEditorPageProps) {
  const { id } = await params;
  const serverTrpc = await createServerTRPCClient();

  try {
    await serverTrpc.auth.me.query();
  } catch {
    redirect(`/login?redirect=/dashboard/forms/${id}`);
  }

  return <FormEditor formId={id} />;
}

