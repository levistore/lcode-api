import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SystemTelemetry from "@/components/SystemTelemetry";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  let totalEndpoints = 50;
  let todayRequests = 124520;

  try {
    totalEndpoints = await prisma.apiEndpoint.count();
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const count = await prisma.apiRequest.count({
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    });
    if (count > 0) {
      todayRequests = count;
    }
  } catch (error) {
    console.error("Failed to query dynamic stats in Server Component:", error);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-bg-primary pb-24 relative overflow-hidden">
        {/* Background ambient spots */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-[120px] pointer-events-none -z-10" />
        <Hero />
        <SystemTelemetry initialTotalApis={totalEndpoints} initialTodayRequests={todayRequests} />
      </main>
    </>
  );
}
