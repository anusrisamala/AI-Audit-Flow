import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { RiskBadge } from "../../components/RiskBadge";
import { auditService, Audit } from "../../services/auditService";
import { findingService, Finding } from "../../services/findingService";
import { ArrowLeft, Calendar, Building2, User, Loader2 } from "lucide-react";

export function AuditDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      auditService.getById(Number(id)),
      findingService.getByAudit(Number(id)),
    ])
      .then(([auditData, findingsData]) => {
        setAudit(auditData);
        setFindings(findingsData);
      })
      .catch(() => setError("Failed to load audit details"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Audit Details" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Audit Details" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error || "Audit not found"}
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="ml-64 pt-16">
      <Header title="Audit Details" />

      <div className="p-8">
        <button
          onClick={() => navigate("/admin/audits")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Audits</span>
        </button>

        <div className="space-y-6">
          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold text-[#333333]">
                {audit.title}
              </h3>
              <StatusBadge status={audit.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-start gap-3">
                <Building2 className="text-[#EB8C00] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-[#333333]">
                    {audit.department}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-[#EB8C00] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium text-[#333333]">
                    {new Date(audit.start_date).toLocaleDateString("en-IN", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-[#EB8C00] mt-1" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-medium text-[#333333]">
                    {new Date(audit.due_date).toLocaleDateString("en-IN", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-[#333333]">{audit.description}</p>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Assigned Auditor
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#EB8C00] flex items-center justify-center text-white font-semibold">
                {audit.assigned_auditor
                  ? audit.assigned_auditor
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "NA"}
              </div>
              <div>
                <p className="font-medium text-[#333333]">
                  {audit.assigned_auditor || "Unassigned"}
                </p>
                <p className="text-sm text-gray-600"> Auditor ID: {audit.assigned_to}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Risk Summary
            </h3>
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
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Findings ({findings.length})
            </h3>
            {findings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr className="border-b border-[#DEDEDE]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                        Finding
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                        Risk Level
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                        Recommendation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {findings.map((finding) => (
                      <tr
                        key={finding.id}
                        className="border-b border-[#DEDEDE] hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <p className="font-medium text-[#333333]">
                            {finding.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {finding.description}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <RiskBadge risk={finding.risk_level} />
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {finding.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No findings recorded yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
