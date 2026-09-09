import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { auditService, Audit } from "../../services/auditService";
import { reportService, Report } from "../../services/reportService";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  UserPlus,
  Loader2,
  FileText,
} from "lucide-react";


export function AuditsPage() {
  const navigate = useNavigate();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    auditService
      .getAll()
      .then(setAudits)
      .catch(() => setError("Failed to load audits"))
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateReport = async (auditId: number) => {
    try {
      const res = await reportService.generateReport(auditId);

      navigate(`/admin/reports`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to generate report");
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this audit?")) return;
    try {
      await auditService.delete(id);
      setAudits((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to delete audit");
    }
  };

  const filteredAudits = audits.filter((audit) => {
    const matchesSearch =
      audit.title.toLowerCase().includes(search.toLowerCase()) ||
      audit.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      audit.status === statusFilter ||
      (statusFilter === "In Progress" && audit.status === "IN_PROGRESS") ||
      (statusFilter === "Not Started" && audit.status === "PENDING") ||
      (statusFilter === "Completed" && audit.status === "COMPLETED");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="ml-64 pt-16">
      <Header title="Audit Management" />

      <div className="p-8">
        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <button
            onClick={() => navigate("/admin/audits/create")}
            className="bg-[#EB8C00] hover:bg-[#D04A02] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create Audit
          </button>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search audits..."
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
                      Assigned Auditor
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-[#333333]">
                      Start Date
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
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {audit.assigned_auditor || "Unassigned"}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(audit.start_date).toLocaleDateString(
                          "en-IN",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(audit.due_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/admin/audits/${audit.id}`)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/admin/audits/${audit.id}/assign`)
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Assign Auditor"
                          >
                            <UserPlus size={18} className="text-[#EB8C00]" />
                          </button>

                          {audit.status === "COMPLETED" && (
                            <button
                              onClick={() => handleGenerateReport(audit.id)}
                              className="p-2 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Generate Report"
                            >
                              <FileText size={18} className="text-green-600" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(audit.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
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
