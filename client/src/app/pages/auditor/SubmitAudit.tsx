import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { RiskBadge } from "../../components/RiskBadge";
import { auditService, Audit } from "../../services/auditService";
import { findingService, Finding } from "../../services/findingService";
import { ArrowLeft, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function SubmitAudit() {
  let { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const auditId = Number(id);
    Promise.all([
      auditService.getById(auditId),
      findingService.getByAudit(auditId),
    ])
      .then(([auditData, findingsData]) => {
        setAudit(auditData);
        setFindings(findingsData);
      })
      .catch(() => setError("Failed to load audit"))
      .finally(() => setLoading(false));
  }, [id]);

  const riskCounts = {
    Low: findings.filter(
      (f) => String(f.risk_level).toUpperCase() === "LOW",
    ).length,
    Medium: findings.filter(
      (f) => String(f.risk_level).toUpperCase() === "MEDIUM",
    ).length,
    High: findings.filter(
      (f) => String(f.risk_level).toUpperCase() === "HIGH",
    ).length,
    Critical: findings.filter(
      (f) => String(f.risk_level).toUpperCase() === "CRITICAL",
    ).length,
  };

  const getOverallRisk = () => {
    if (riskCounts.Critical > 0) return "Critical";
    if (riskCounts.High > 0) return "High";
    if (riskCounts.Medium > 0) return "Medium";
    return "Low";
  };

  const handleSubmit = async () => {
    if (!id) return;
    const auditId = Number(id);
    setSubmitting(true);
    try {
      await auditService.submit(auditId);
      alert("Audit submitted successfully!");
      navigate("/auditor/my-audits");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to submit audit");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Submit Audit" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  const isSubmitted = audit?.status === "COMPLETED";

  if (error || !audit) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Submit Audit" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error || "Audit not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-64 pt-16">
      <Header title="Submit Audit" />

      <div className="p-8">
        <button
          onClick={() => navigate(`/auditor/audit-work/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Audit Work</span>
        </button>

        <div className="max-w-4xl space-y-6">
          {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Review Before Submission
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Once submitted, the audit status will change to "Completed" and
                cannot be undone.
              </p>
            </div>
          </div> */}

          {isSubmitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900">
                  Audit Already Submitted
                </p>
                <p className="text-sm text-green-700 mt-1">
                  This audit has already been submitted and is now read-only.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="text-blue-600 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Review Before Submission
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Once submitted, the audit cannot be modified.
                </p>
              </div>
            </div>
          )}

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-xl font-bold text-[#333333] mb-6">
              Audit Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Audit Title</p>
                <p className="font-medium text-[#333333]">{audit.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="font-medium text-[#333333]">{audit.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Date</p>
                <p className="font-medium text-[#333333]">
                  {new Date(audit.start_date).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Due Date</p>
                <p className="font-medium text-[#333333]">
                  {new Date(audit.due_date).toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Status</p>
                <p className="font-medium text-[#333333]">{audit.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {isSubmitted ? "Final Status" : "Will Change To"}
                </p>

                <p className="font-medium text-green-600">
                  {isSubmitted ? audit.status : "Completed"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-xl font-bold text-[#333333] mb-6">
              Findings Summary
            </h3>
            <div className="bg-white rounded-lg p-6 border border-[#DEDEDE] mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Findings</p>
                <p className="text-3xl font-bold text-[#333333]">
                  {findings.length}
                </p>
              </div>
            </div>
            <h4 className="font-semibold text-[#333333] mb-4">Risk Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-[#DEDEDE]">
                <p className="text-2xl font-bold text-green-600">
                  {riskCounts.Low}
                </p>
                <p className="text-sm text-gray-600 mt-1">Low Risk</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#DEDEDE]">
                <p className="text-2xl font-bold text-yellow-600">
                  {riskCounts.Medium}
                </p>
                <p className="text-sm text-gray-600 mt-1">Medium Risk</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#DEDEDE]">
                <p className="text-2xl font-bold text-orange-600">
                  {riskCounts.High}
                </p>
                <p className="text-sm text-gray-600 mt-1">High Risk</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-[#DEDEDE]">
                <p className="text-2xl font-bold text-red-600">
                  {riskCounts.Critical}
                </p>
                <p className="text-sm text-gray-600 mt-1">Critical Risk</p>
              </div>
            </div>
            <div className="mt-6 bg-white rounded-lg p-4 border border-[#DEDEDE]">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Overall Risk Assessment</p>
                <RiskBadge risk={getOverallRisk()} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={() => navigate(`/auditor/audit-work/${id}`)}
              className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-lg font-medium border border-[#DEDEDE] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || isSubmitted}
              className={`px-8 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                isSubmitted
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white"
              }`}
            >
              <CheckCircle2 size={20} />
              {submitting
                ? "Submitting..."
                : isSubmitted
                  ? "Audit Already Submitted"
                  : "Submit Audit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
