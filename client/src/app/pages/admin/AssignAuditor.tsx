import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { auditService, Audit } from "../../services/auditService";
import { userService, UserProfile } from "../../services/userService";
import { ArrowLeft, Loader2 } from "lucide-react";

export function AssignAuditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState<Audit | null>(null);
  const [auditors, setAuditors] = useState<UserProfile[]>([]);
  const [selectedAuditor, setSelectedAuditor] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const ID = Number(id);
  useEffect(() => {
    if (!id) return;
    Promise.all([auditService.getById(ID), userService.getAuditors()])
      .then(([auditData, auditorsData]) => {
        setAudit(auditData);
        setAuditors(auditorsData);
        if (auditData.assigned_to)
          setSelectedAuditor(auditData.assigned_to.toString());
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [ID]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ID || !selectedAuditor) return;
    setSubmitting(true);
    try {
      await auditService.assign(ID, Number(selectedAuditor));
      navigate("/admin/audits");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign auditor");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Assign Auditor" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Assign Auditor" />
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
      <Header title="Assign Auditor" />

      <div className="p-8">
        <button
          onClick={() => navigate("/admin/audits")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Audits</span>
        </button>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200 mb-6">
            {error}
          </div>
        )}

        <div className="max-w-2xl space-y-6">
          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Audit Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Audit Title:</span>
                <p className="font-medium text-[#333333]">{audit.title}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Department:</span>
                <p className="font-medium text-[#333333]">{audit.department}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Current Auditor:</span>
                <p className="font-medium text-[#333333]">
                  {audit.assigned_auditor || "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Assignment
            </h3>
            {audit.status === "COMPLETED" && (
              <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
                <h4 className="font-semibold text-yellow-800">
                  Completed Audit
                </h4>

                <p className="mt-1 text-sm text-yellow-700">
                  This audit has already been completed. Reassigning it will
                  reopen the audit, change its status to
                  <strong> In Progress</strong>, and the existing report will be replaced with a newly generated report after the audit is completed again.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#333333] mb-2">
                  Select Auditor *
                </label>
                <select
                  value={selectedAuditor}
                  onChange={(e) => setSelectedAuditor(e.target.value)}
                  className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] bg-white"
                  required
                >
                  <option value="">Choose an auditor</option>
                  {auditors.map((auditor) => (
                    <option key={auditor.id} value={auditor.id}>
                      {auditor.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#EB8C00] hover:bg-[#D04A02] disabled:opacity-60 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                {audit.status === "COMPLETED"
                  ? "Reassign & Reopen Audit"
                  : "Assign Auditor"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
