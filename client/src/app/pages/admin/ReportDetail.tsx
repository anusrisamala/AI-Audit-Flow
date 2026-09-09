import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { RiskBadge } from "../../components/RiskBadge";
import { reportService, Report } from "../../services/reportService";
import { findingService, Finding } from "../../services/findingService";
import {
  ArrowLeft,
  Download,
  Printer,
  Calendar,
  Building2,
  User,
  Shield,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type RiskGroup = {
  label: string;
  color: string;
  findings: Finding[];
};

function groupByRisk(findings: Finding[]): RiskGroup[] {
  const order = ["Critical", "High", "Medium", "Low"];

  const colorMap: Record<string, string> = {
    Critical: "text-red-700 bg-red-50 border-red-200",
    High: "text-orange-700 bg-orange-50 border-orange-200",
    Medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
    Low: "text-green-700 bg-green-50 border-green-200",
  };

  return order
    .map((level) => ({
      label: level,
      color: colorMap[level],
      findings: findings.filter(
        (f) => (f.risk_level || "").toLowerCase() === level.toLowerCase(),
      ),
    }))
    .filter((g) => g.findings.length > 0);
}

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [report, setReport] = useState<Report | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [aiConclusion, setAiConclusion] = useState("");

  useEffect(() => {
    if (!id) return;

    reportService
      .getById(Number(id))
      .then(async (r) => {
        setReport(r);

        if (r.ai_summary) {
          setAiSummary(r.ai_summary);
        }
        if (r.ai_priority_actions) {
          setAiConclusion(r.ai_priority_actions);
        }
        if (r.ai_recommendations) {
          try {
            const parsed = typeof r.ai_recommendations === "string" ? JSON.parse(r.ai_recommendations) : r.ai_recommendations;
            if (Array.isArray(parsed)) {
              setAiRecommendations(parsed);
            }
          } catch (e) {
            // ignore JSON parse error if raw text
          }
        }

        const data = await findingService.getByAudit(r.audit_id);

        setFindings(data);
      })
      .catch(() => {
        setError("Failed to load report");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && report && searchParams.get("print")) {
      setTimeout(() => window.print(), 300);
    }
  }, [loading, report, searchParams]);

  const triggerPrintWithNotification = () => {
    if (report?.id) {
      const handleAfterPrint = () => {
        window.removeEventListener("afterprint", handleAfterPrint);
        reportService.notifyDownload(report.id).catch(() => {});
      };
      window.addEventListener("afterprint", handleAfterPrint, { once: true });
    }
    window.print();
  };

  const handlePrint = () => {
    triggerPrintWithNotification();
  };

  const handleDownload = () => {
    triggerPrintWithNotification();
  };

  const handleGenerateAI = async () => {
    if (!report) return;

    try {
      setAiLoading(true);

      const res = await reportService.generateAIReport(report.audit_id);

      setAiSummary(res.data.executiveSummary);
      setAiRecommendations(res.data.recommendations || []);
      setAiConclusion(res.data.conclusion || "");
    } catch (err) {
      alert("Failed to generate AI summary");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Report Detail" />

        <div className="p-8 flex justify-center">
          <Loader2 size={32} className="animate-spin text-[#EB8C00]" />
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Report Detail" />

        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-700">
            {error || "Report not found"}
          </div>
        </div>
      </div>
    );
  }

  const audit = report.audit;

  const riskGroups = groupByRisk(findings);

  const totalFindings = findings.length;

  const criticalCount = findings.filter(
    (f) => f.risk_level.toLowerCase() === "critical",
  ).length;

  const highCount = findings.filter(
    (f) => f.risk_level.toLowerCase() === "high",
  ).length;

  const mediumCount = findings.filter(
    (f) => f.risk_level.toLowerCase() === "medium",
  ).length;

  const lowCount = findings.filter(
    (f) => f.risk_level.toLowerCase() === "low",
  ).length;

  const riskColor: Record<string, string> = {
    critical: "text-red-600",
    high: "text-orange-600",
    medium: "text-yellow-600",
    low: "text-green-600",
  };

  const overallRiskClass =
    riskColor[(report.overall_risk || "").toLowerCase()] || "text-gray-600";

  const recommendations: string[] = aiRecommendations.length
    ? aiRecommendations
    : report.recommendations
      ? report.recommendations.split("\n").filter(Boolean)
      : riskGroups
          .flatMap((g) => g.findings.map((f) => f.recommendation))
          .filter(Boolean);

  return (
    <>
      <style>{`
        @media print {

  @page {
    size: A4;
    margin: 12mm;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: white;
  }

  body * {
    visibility: hidden;
  }

  #report-print-area,
  #report-print-area * {
    visibility: visible;
  }

  #report-print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    box-shadow: none !important;
  }

  .no-print {
    display: none !important;
  }
}
      `}</style>

      <div className="ml-64 pt-16 no-print">
        <Header title="Audit Report" />
      </div>

      <div className="ml-64 pt-16">
        <div className="px-8 pt-6 pb-0 flex items-center justify-between no-print">
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            Back to Reports
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DEDEDE] bg-white text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Generate AI Summary
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#DEDEDE] bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EB8C00] text-white hover:bg-[#D04A02] transition-colors"
            >
              <Download size={16} />
              Download PDF
            </button>
          </div>
        </div>

        <div id="report-print-area" className="bg-white p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-black text-white rounded-lg p-8 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#EB8C00] uppercase tracking-widest text-sm font-semibold mb-2">
                  Audit Report
                </p>

                <h1 className="text-3xl font-bold">
                  {audit?.title || `Audit #${report.audit_id}`}
                </h1>

                <p className="text-gray-400 mt-2">{audit?.department}</p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase text-gray-400">Generated</p>

                <p className="mt-1 font-medium">
                  {report.generated_date
                    ? new Date(report.generated_date).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Audit Information */}

          <div className="bg-[#F8F8F8] border border-[#DEDEDE] rounded-lg p-6 mb-6">
            <h2 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-5">
              Audit Information
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              <InfoItem
                icon={<Building2 size={16} className="text-[#EB8C00]" />}
                label="Department"
                value={audit?.department || "—"}
              />

              <InfoItem
                icon={<User size={16} className="text-[#EB8C00]" />}
                label="Assigned Auditor"
                value={audit?.assigned_auditor?.name || "—"}
              />

              <InfoItem
                icon={<Shield size={16} className="text-[#EB8C00]" />}
                label="Audit Status"
                value={audit?.status || "—"}
                valueClass={
                  audit?.status === "COMPLETED"
                    ? "text-green-600 font-semibold"
                    : "text-orange-600 font-semibold"
                }
              />

              <InfoItem
                icon={<Calendar size={16} className="text-[#EB8C00]" />}
                label="Start Date"
                value={
                  audit?.start_date
                    ? new Date(audit.start_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />

              <InfoItem
                icon={<Calendar size={16} className="text-[#EB8C00]" />}
                label="Due Date"
                value={
                  audit?.due_date
                    ? new Date(audit.due_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"
                }
              />
            </div>
          </div>

          {/* Summary Cards */}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-[#F8F8F8] border border-[#DEDEDE] rounded-lg p-4">
              <p className="text-3xl font-bold">{totalFindings}</p>

              <p className="text-xs uppercase tracking-wide text-gray-500 mt-1">
                Total Findings
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-600">{criticalCount}</p>

              <p className="text-xs uppercase tracking-wide text-red-500 mt-1">
                Critical
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-3xl font-bold text-orange-600">{highCount}</p>

              <p className="text-xs uppercase tracking-wide text-orange-500 mt-1">
                High
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-3xl font-bold text-yellow-600">
                {mediumCount}
              </p>

              <p className="text-xs uppercase tracking-wide text-yellow-600 mt-1">
                Medium
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{lowCount}</p>

              <p className="text-xs uppercase tracking-wide text-green-600 mt-1">
                Low
              </p>
            </div>
          </div>

          {(aiSummary || report.summary) && (
            <Section title="Executive Summary">
              <p className="text-sm text-[#333333] leading-relaxed">
                {aiSummary || report.summary}
              </p>
            </Section>
          )}

          <Section title="Findings">
            {riskGroups.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No findings recorded for this audit.
              </p>
            ) : (
              <div className="space-y-6">
                {riskGroups.map((group) => (
                  <div key={group.label}>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold mb-3 ${group.color}`}
                    >
                      <AlertTriangle size={12} />
                      {group.label} Risk ({group.findings.length})
                    </div>

                    <div className="space-y-3">
                      {group.findings.map((finding, index) => (
                        <div
                          key={finding.id}
                          className="bg-white border border-[#DEDEDE] rounded-lg p-4"
                        >
                          <p className="text-sm font-semibold text-[#333333] mb-2">
                            {index + 1}. {finding.title}
                          </p>

                          <p className="text-sm text-gray-600 leading-relaxed mb-4">
                            {finding.description}
                          </p>

                          <div className="bg-[#F8F8F8] border-l-4 border-[#EB8C00] rounded-md p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#EB8C00] mb-1">
                              Recommendation
                            </p>

                            <p className="text-sm text-[#333333] leading-relaxed">
                              {finding.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Overall Risk */}

          <Section title="Overall Risk Assessment">
            <div className="flex items-center gap-5">
              <span className={`text-5xl font-bold ${overallRiskClass}`}>
                {(report.overall_risk || "N/A").toUpperCase()}
              </span>

              {report.overall_risk && <RiskBadge risk={report.overall_risk} />}
            </div>
          </Section>

          {/* Recommendations */}

          {recommendations.length > 0 && (
            <Section title="Recommendations">
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#EB8C00] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>

                    <span className="text-sm text-[#333333] leading-relaxed">
                      {recommendation}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {aiConclusion && (
            <Section title="AI Conclusion">
              <p className="text-sm text-[#333333] leading-relaxed">
                {aiConclusion}
              </p>
            </Section>
          )}
          {/* Footer */}

          <div className="mt-10 pt-6 border-t border-[#DEDEDE] flex justify-between items-center text-xs text-gray-500">
            <p>Audit Management System — Confidential</p>

            <p>
              Generated:&nbsp;
              {report.generated_date
                ? new Date(report.generated_date).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClass = "text-[#333333]",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>

        <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-base font-bold text-[#333333]">{title}</h2>

        <div className="flex-1 h-px bg-[#DEDEDE]" />
      </div>

      <div className="bg-[#F8F8F8] border border-[#DEDEDE] rounded-lg p-5">
        {children}
      </div>
    </div>
  );
}
