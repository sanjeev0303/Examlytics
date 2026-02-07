import { NextResponse } from "next/server";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Simulate rich AI-interpreted anomalies
  const anomalies = [
    {
      id: "1",
      category: "USER",
      title: "Speed Runner Detected",
      severity: "HIGH",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      ai_insight: {
          summary: "User 'alex_j' answered 20 questions in 30 seconds with 100% accuracy, which is statistically improbable.",
          likely_causes: [
              "Automated Scripting / Bot",
              "Pre-exposure to exact questions",
              "System timing glitch (Low prob)"
          ],
          confidence: 0.94,
          recommended_actions: [
              "Flag account for review",
              "Check session IP consistency"
          ],
          false_positive_risk: "Low"
      }
    },
    {
      id: "2",
      category: "SYSTEM",
      title: "API Latency Spike",
      severity: "MEDIUM",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      ai_insight: {
          summary: "P95 Latency shifted from 200ms to 450ms globally.",
          likely_causes: [
              "Database Lock Contention",
              "Third-party AI Provider Lag"
          ],
          confidence: 0.82,
          recommended_actions: [
              "Check Database Connection Pool",
              "Monitor AI Provider Status Page"
          ],
          false_positive_risk: "Moderate"
      }
    },
    {
      id: "3",
      category: "COST",
      title: "Abnormal Token Usage",
      severity: "LOW",
      timestamp: new Date().toISOString(),
       ai_insight: {
          summary: "Exam generation for 'Quantum Physics' used 20% more tokens than baseline.",
          likely_causes: [
              "Complex user prompts",
              "Model verbosity drift"
          ],
          confidence: 0.65,
          recommended_actions: [
              "Ignore (within acceptable variance)",
              "Review Prompt Template"
          ],
          false_positive_risk: "High"
      }
    }
  ];

  // Randomly return some to make it feel dynamic
  const count = Math.floor(Math.random() * 3) + 1; // 1 to 3 anomalies
  const selected = anomalies.slice(0, count);

  return NextResponse.json(selected);
}
