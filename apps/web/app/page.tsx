"use client";

import { trpc } from "~/trpc/client";
// import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default  function Home() {
  // let status = "offline";
  // try {
  //   const res = await api.health.getHealth.query();
  //   status = res.status;
  // } catch {
  //   status = "offline";
  // }

  // const { status } = await api.health.getHealth.query();
  // const { message } = await api.experiment.query({ email: "karma@gmail.com" });

  const { data: healthData } = trpc.health.getHealth.useQuery();

  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div>
        <h1 className="text-3xl">Formly - Form in Style</h1>
        <h2>Server Status: {healthData?.status}</h2>
      </div>
    </main>
  );
}
