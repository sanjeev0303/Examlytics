# Admin Guide – Exam Intelligence Platform

## 1. Purpose of Admin Dashboard
**Observability, not Surveillance.**
The goal of this dashboard is to ensure the **fairness** and **quality** of the assessment platform. We use AI to detect irregularities, but human judgment is the final authority. We prioritize "Human-in-the-loop" governance to build trust with our users.

## 2. Daily Workflow
1.  **Morning Check:** Review the **Dashboard Overview** for system outages or cost spikes.
2.  **Anomaly Review:** Check the **Anomalies Feed** for high-confidence flags.
3.  **Cost Monitoring:** Ensure AI token usage is within budget in **AI Control**.
4.  **System Health:** Verify API latency and error rates are stable.

## 3. Anomaly Handling
- **High Confidence (>90%):** Strong statistical evidence of irregularity. Review details.
- **Medium Confidence (50-90%):** Potential issue. Monitor the user, but do not intervene immediately.
- **Low Confidence (<50%):** Likely noise. Ignore unless a pattern emerges.
- **Resolution:** Always add notes when resolving an anomaly (e.g., "False positive due to internet lag").

## 4. User Management Ethics
- **No Automated Bans:** The system allows you to *suspend* access, but never delete data automatically.
- **Soft Interventions:** Prefer sending a warning notification over an immediate ban.
- **Transparency:** Users have a right to know why their exam was flagged. Use the **AI Analysis** to provide specific reasons.

## 5. AI Cost Control
- **Cost Metrics:** "Cost per Exam" is your north star metric.
- **Overrides:** In **AI Control**, you can force the system to use cheaper models (e.g., Gemini Flash) during high-traffic periods to save costs.
- **Rate Limits:** Do not lower rate limits during an ongoing exam session.

## 6. Incident Response
- **System Outage:** Check `/system` for database connection issues.
- **AI Provider Failure:** If OpenAI is down, switch the global provider config to Anthropic in **Settings**.
- **Cost Spike:** Enable "Economy Mode" in **AI Control**.

## 7. DOs & DON'Ts

### DO:
- ✅ Trust data trends over individual data points.
- ✅ Use the "Explain" features to understand AI decisions.
- ✅ regularly audit the "Weak Topics" to improve content quality.

### DON'T:
- ❌ Panic over a single server error.
- ❌ Over-tune difficulty thresholds based on one complaint.
- ❌ Share raw PII (User Data) outside of this dashboard.
