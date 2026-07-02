import type { Metadata } from "next";
import LeaderboardClient from "./leaderboard-client";

export const metadata: Metadata = {
  title: "Top 10 Most Used APIs — Lcode API",
  description: "Lihat 10 endpoint API yang paling sering digunakan oleh developer di platform Lcode API.",
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
