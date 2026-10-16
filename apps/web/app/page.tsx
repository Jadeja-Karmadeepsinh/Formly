import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  let status = "offline";
  try {
    const res = await api.health.getHealth.query();
    status = res.status;
  } catch {
    status = "offline";
  }

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Formly - Form in Style</h1>
        <h2>Server Status: {status}</h2>
      </div>
    </main>
  );
}
