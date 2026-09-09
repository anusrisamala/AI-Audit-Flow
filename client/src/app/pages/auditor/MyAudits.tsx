import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { auditService, Audit } from "../../services/auditService";
import { Search, ExternalLink, Loader2 } from "lucide-react";

export function MyAudits() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    auditService
      .getMyAudits()
      .then(setAudits)
      .catch(() => setError("Failed to load audits"))
      .finally(() => setLoading(false));
  }, []);

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.title.toLowerCase().includes(search.toLowerCase()) ||
      audit.department.toLowerCase().includes(search.toLowerCase());
    const s = audit.status.toLowerCase();
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "In Progress" &&
        (s === "in_progress" || s === "in progress")) ||
      (statusFilter === "Not Started" &&
        (s === "not_started" || s === "not started")) ||
      (statusFilter === "Completed" && s === "completed") ||
      audit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ml-64 pt-16">
      <Header title="My Audits" />

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
              placeholder="Search my audits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] w-full md:w-80"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
          >
            <option value="All">All Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
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
                      Audit Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Department
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Due Date
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      className="border-b border-[#DEDEDE] hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm font-medium text-[#333333]">
                        {audit.title}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {audit.department}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(audit.due_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() =>
                            navigate(`/auditor/audit-work/${audit.id}`)
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-[#EB8C00] hover:bg-[#D04A02] text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <ExternalLink size={16} />
                          Open Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAudits.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No audits found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
