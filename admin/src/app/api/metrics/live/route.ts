import { NextResponse } from "next/server";

export async function GET() {
  // Simulate database/cache fetch latency
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate mock data that fluctuates slightly to simulate "live" activity
  const active_users = Math.floor(Math.random() * (120 - 80 + 1) + 80); // 80-120 users
  const exams_in_progress = Math.floor(Math.random() * (45 - 30 + 1) + 30); // 30-45 exams
  const ai_rpm = Math.floor(Math.random() * (350 - 280 + 1) + 280); // 280-350 RPM

  // Simulate occasional error spikes (mostly 0-0.5%, rarely higher)
  const isSpike = Math.random() > 0.95;
  const error_rate = isSpike
    ? parseFloat((Math.random() * (2.5 - 1.0) + 1.0).toFixed(2)) // 1.0-2.5% during spike
    : parseFloat((Math.random() * 0.5).toFixed(2)); // 0-0.5% normal

  const status = error_rate > 2.0 ? "degraded" : "healthy";

  return NextResponse.json({
    active_users,
    exams_in_progress,
    ai_rpm,
    error_rate,
    system_status: status,
    timestamp: new Date().toISOString(),
  });
}
