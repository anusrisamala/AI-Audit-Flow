import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { RiskBadge } from "../../components/RiskBadge";
import { reportService, Report } from "../../services/reportService";
import {
  Eye,
  Trash2,
  Search,
  Filter,
  X,
  Loader2,
  FileText,
} from "lucide-react";

const DEPARTMENTS = [
  "Finance",
  "Information Technology",
  "Operations",
  "Human Resources",
  "Sales & Marketing",
  "Legal & Compliance",
];
const RISK_LEVELS = ["Low", "Medium", "High", "Critical"];

export function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    reportService
      .getAll()
      .then(setReports)
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const resetFilters = () => {
    setSearch("");
    setDeptFilter("");
    setRiskFilter("");
    setDateFilter("");
  };

  const hasFilters = search || deptFilter || riskFilter || dateFilter;

 const filtered = reports.filter((report) => {
  const searchText = search.trim().toLowerCase();

  const title = report.audit?.title?.toLowerCase() ?? "";
  const department = report.audit?.department?.toLowerCase() ?? "";
  const displayId = `R${String(report.id).padStart(3, "0")}`;

  const matchesSearch =
    !searchText ||
    title.includes(searchText) ||
    department.includes(searchText) ||
    displayId.toLowerCase().includes(searchText);

  const matchesDepartment =
    !deptFilter || department === deptFilter.toLowerCase();

  const matchesRisk =
    !riskFilter ||
    (report.overall_risk && report.overall_risk.toLowerCase() === riskFilter.toLowerCase());

  const matchesDate =
    !dateFilter ||
    (report.generated_date && String(report.generated_date).startsWith(dateFilter));

  return (
    matchesSearch &&
    matchesDepartment &&
    matchesRisk &&
    matchesDate
  );
});

  return (
    <div className="ml-64 pt-16">
      <Header title="Audit Reports" />

      <div className="p-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#F8F8F8] rounded-lg p-5 border border-[#DEDEDE] shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={16} className="text-[#EB8C00]" />
            <span className="text-sm font-semibold text-[#333333]">
              Filter Reports
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search audit title or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#DEDEDE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white"
              />
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#DEDEDE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-700"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2.5 border border-[#DEDEDE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-700"
            >
              <option value="">All Risk Levels</option>
              {RISK_LEVELS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-[#DEDEDE] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white text-gray-700"
              />
              {hasFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 px-3 py-2.5 bg-white border border-[#DEDEDE] rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <X size={14} />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-[#333333]">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-[#333333]">
              {reports.length}
            </span>{" "}
            reports
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#DEDEDE] shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No reports found</p>
              <p className="text-gray-400 text-sm mt-1">
                {hasFilters
                  ? "Try adjusting your filters"
                  : "Generate a report from a completed audit"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F8F8] border-b border-[#DEDEDE]">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Report ID
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Audit Title
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Overall Risk
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Generated Date
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDEDE]">
                  {filtered.map((report, idx) => (
                    <tr
                      key={report.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          R{String(report.id).padStart(3, "0")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-[#333333]">
                          {report.audit?.title || `Audit #${report.audit_id}`}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.audit?.department || "—"}
                      </td>
                      <td className="py-4 px-6">
                        {report.overall_risk ? (
                          <RiskBadge risk={report.overall_risk} />
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {report.generated_date
                          ? new Date(report.generated_date).toLocaleDateString(
                              "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          Generated
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/reports/${report.id}`)
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#EB8C00] hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                            title="View Report"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
