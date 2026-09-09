import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { RiskBadge } from "../../components/RiskBadge";
import { findingService, Finding } from "../../services/findingService";
import { auditService, Audit } from "../../services/auditService";
import { Search, Edit, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FindingsPage() {
  const navigate = useNavigate();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  useEffect(() => {
    Promise.all([findingService.getMyFindings(), auditService.getMyAudits()])
      .then(([findingsData, auditsData]) => {
        setFindings(findingsData);
        setAudits(auditsData);
      })
      .catch(() => setError("Failed to load findings"))
      .finally(() => setLoading(false));
  }, []);

  const getAuditTitle = (auditId: number) =>
    audits.find((a) => a.id === auditId)?.title || `Audit #${auditId}`;

  const isAuditSubmitted = (auditId: number) =>
    audits.find((a) => a.id === auditId)?.status === "COMPLETED";

  const filteredFindings = findings.filter((f) => {
    // Combine all searchable fields into one string
    const searchableText = [
      getAuditTitle(f.audit_id),
      f.title,
      f.description,
      f.risk_level,
      f.recommendation,
    ]
      .join(" ")
      .toLowerCase();

    // Split the search input only on commas
    const searchTerms = search
      .toLowerCase()
      .split(",")
      .map((term) => term.trim())
      .filter((term) => term !== "");

    // If search box is empty -> show all findings
    const matchesSearch =
      searchTerms.length === 0 ||
      searchTerms.some((term) => searchableText.includes(term));

    // Risk filter dropdown
    const matchesRisk =
      riskFilter === "All" ||
      f.risk_level.toLowerCase() === riskFilter.toLowerCase();

    return matchesSearch && matchesRisk;
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this finding?"))
      return;
    try {
      await findingService.delete(id);
      setFindings((prev) => prev.filter((f) => f.id !== id));
    } catch {
      alert("Failed to delete finding");
    }
  };

  return (
    <div className="ml-64 pt-16">
      <Header title="My Findings" />

      <div className="p-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-end">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search findings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] w-full md:w-80"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
          >
            <option value="All">All Risk Levels</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        <div className="bg-[#F8F8F8] rounded-lg border border-[#DEDEDE] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white">
                  <tr className="border-b border-[#DEDEDE]">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Audit
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Finding Title
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Description
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Risk Level
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Recommendation
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredFindings.map((finding) => (
                    <tr
                      key={finding.id}
                      className="border-b border-[#DEDEDE] hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {getAuditTitle(finding.audit_id)}
                      </td>

                      <td className="py-4 px-6 text-sm font-medium text-[#333333]">
                        {finding.title}
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                        {finding.description}
                      </td>

                      <td className="py-4 px-6">
                        <RiskBadge risk={finding.risk_level} />
                      </td>

                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">
                        {finding.recommendation}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/findings/edit/${finding.id}`)
                            }
                            disabled={isAuditSubmitted(finding.audit_id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isAuditSubmitted(finding.audit_id)
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                            title={
                              isAuditSubmitted(finding.audit_id)
                                ? "Audit has been submitted"
                                : "Edit"
                            }
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(finding.id)}
                            disabled={isAuditSubmitted(finding.audit_id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isAuditSubmitted(finding.audit_id)
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-gray-100"
                            }`}
                            title={
                              isAuditSubmitted(finding.audit_id)
                                ? "Audit has been submitted"
                                : "Delete"
                            }
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFindings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No findings found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
