const riskPrompt = (title, description, department) => `
You are a senior Internal Audit and Risk Advisory expert.

Analyze the following audit finding and determine its risk level.

Respond ONLY with a valid JSON object.

Do NOT include:
- Markdown
- Triple backticks
- Explanations
- Notes
- Any text before or after the JSON

Return EXACTLY in this format:

{
  "risk": "LOW",
  "confidence": 90,
  "reason": "Short explanation.",
  "recommendation": "Specific actionable recommendation."
}

Rules:
- risk must be one of: LOW, MEDIUM, HIGH, CRITICAL
- confidence must be an integer between 0 and 100
- reason must be 1-2 concise sentences
- recommendation must be practical and specific

Audit Finding

Title: ${title}

Department: ${department}

Description:
${description}
`;

// const riskPrompt = (title, description, department) => `
// Analyze this audit finding.

// Title: ${title}
// Description: ${description}
// Department: ${department}

// Return valid JSON:
// {
//   "riskLevel": "LOW | MEDIUM | HIGH | CRITICAL",
//   "riskScore": number,
//   "recommendation": "string"
// }
// `;
const reportPrompt = (auditData) => `
You are an expert Internal Audit Report Writer.

Generate a professional internal audit report based on the following audit information.

Audit Title: ${auditData.title}
Department: ${auditData.department}
Audit Status: ${auditData.status}
Start Date: ${auditData.start_date}
Due Date: ${auditData.due_date}

Audit Findings:
${auditData.findings
  .map(
    (f, index) => `
${index + 1}. Finding Title: ${f.title}
Risk Level: ${f.risk_level}
Description: ${f.description}
Recommendation: ${f.recommendation || "Not provided"}
`
  )
  .join("\n")}

Instructions:
- Write in formal corporate audit language.
- Keep the executive summary concise (3-5 sentences).
- Mention the most significant risks.
- Provide practical recommendations.
- Keep the conclusion professional and brief.

Return ONLY valid JSON with this exact structure:

{
  "executiveSummary": "string",
  "keyRisks": [
    "string",
    "string"
  ],
  "recommendations": [
    "string",
    "string"
  ],
  "conclusion": "string"
}
`;

module.exports = {
  riskPrompt,
  reportPrompt,
};