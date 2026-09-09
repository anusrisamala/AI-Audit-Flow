import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { StatusBadge } from "../../components/StatusBadge";
import { RiskBadge } from "../../components/RiskBadge";
import { auditService, Audit } from "../../services/auditService";
import {
  findingService,
  Finding,
  CreateFindingPayload,
} from "../../services/findingService";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { aiService, AIRiskResponse } from "../../services/aiService";
import { AIRiskCard } from "../../components/AIRiskCard";
import { AIRecommendationCard } from "../../components/AIRecommendationCard";

export function AuditWork() {
  // const { id } = useParams();
  // const navigate = useNavigate();
  // const [audit, setAudit] = useState<Audit | null>(null);
  // const [findings, setFindings] = useState<Finding[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState('');
  // const [showForm, setShowForm] = useState(false);
  // const [submitting, setSubmitting] = useState(false);
  // const [formData, setFormData] = useState({
  //   title: '',
  //   description: '',
  //   riskLevel: 'Low',
  //   recommendation: '',
  // });

  // useEffect(() => {

  //   if (!id) return;
  //   const auditId = Number(id);
  //   Promise.all([auditService.getById(auditId), findingService.getByAudit(id)])
  //     .then(([auditData, findingsData]) => {
  //       setAudit(auditData);
  //       setFindings(findingsData);
  //     })
  //     .catch(() => setError('Failed to load audit'))
  //     .finally(() => setLoading(false));
  // }, [id]);

  // const handleSubmitFinding = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!id) return;
  //   setSubmitting(true);
  //   try {
  //     const newFinding = await findingService.create({ auditId: id, ...formData });
  //     setFindings(prev => [...prev, newFinding]);
  //     setFormData({ title: '', description: '', riskLevel: 'Low', recommendation: '' });
  //     setShowForm(false);
  //   } catch (err: any) {
  //     alert(err.response?.data?.message || 'Failed to save finding');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const { id } = useParams();
  const navigate = useNavigate();

  const [audit, setAudit] = useState<Audit | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIRiskResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // const [formData, setFormData] = useState({
  //   title: "",
  //   description: "",
  //   risk_level: "LOW",
  //   recommendation: "",
  // });
  const [formData, setFormData] = useState<CreateFindingPayload>({
    audit_id: Number(id),

    title: "",
    description: "",

    risk_level: "LOW",

    recommendation: "",
  });

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

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);

      const result = await aiService.analyzeFinding({
        title: formData.title,
        description: formData.description,

        // dynamic department from audit
        department: audit?.department || "",
      });

      setAiResult(result);

      setFormData({
        ...formData,

        // Human field suggestion
        risk_level: result.risk,

        // AI fields
        ai_risk_level: result.risk,
        ai_confidence: result.confidence,
        ai_reason: result.reason,
        ai_recommendation: result.recommendation,

        // keep auditor control
        recommendation: formData.recommendation || result.recommendation,
      });
    } catch (error) {
      console.error(error);
      alert("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmitFinding = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) return;

    const auditId = Number(id);

    setSubmitting(true);

    try {
      const newFinding = await findingService.create({
        ...formData,
      });

      setFindings((prev) => [...prev, newFinding]);

      setFormData({
        audit_id: auditId,
        title: "",
        description: "",
        risk_level: "LOW",
        recommendation: "",
      });

      setShowForm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save finding");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Audit Work" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error || !audit) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Audit Work" />
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
      <Header title="Audit Work" />

      <div className="p-8">
        <button
          onClick={() => navigate("/auditor/my-audits")}
          className="flex items-center gap-2 text-gray-600 hover:text-[#EB8C00] mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to My Audits</span>
        </button>

        <div className="space-y-6">
          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-[#333333]">
                {audit.title}
              </h3>
              <StatusBadge status={audit.status} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium text-[#333333]">{audit.department}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-[#333333]">
                  {new Date(audit.due_date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">Description</p>
              <p className="text-[#333333] mt-1">{audit.description}</p>
            </div>
          </div>

          {audit.status === "COMPLETED" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <p className="text-sm font-medium text-green-900">
                This audit has been submitted and completed. It is now read-only.
              </p>
            </div>
          )}

          {audit.status !== "COMPLETED" && (
            <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#333333]">Add Finding</h3>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="flex items-center gap-2 bg-[#EB8C00] hover:bg-[#D04A02] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <Plus size={18} />
                  {showForm ? "Cancel" : "New Finding"}
                </button>
              </div>

              {showForm && (
                <form
                  onSubmit={handleSubmitFinding}
                  className="bg-white rounded-lg p-6 border border-[#DEDEDE] space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Finding Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
                      placeholder="Brief title of the finding"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00] resize-none"
                      placeholder="Detailed description"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Risk Level *
                    </label>
                    <select
                      value={formData.risk_level}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          risk_level: e.target
                            .value as CreateFindingPayload["risk_level"],
                        })
                      }
                      className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
                      required
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-end mb-3">
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-4 py-2 bg-[#EB8C00] text-white rounded-lg hover:bg-[#D04A02] disabled:opacity-50 flex items-center gap-2"
                      >
                        {analyzing && (
                          <Loader2 className="animate-spin" size={16} />
                        )}

                        {analyzing ? "Analyzing..." : "Analyze with AI"}
                      </button>
                    </div>

                    <label className="block text-sm font-medium text-[#333333] mb-2">
                      Recommendation *
                    </label>

                    <textarea
                      value={formData.recommendation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          recommendation: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border rounded-lg"
                    />

                    {aiResult && (
                      <div className="space-y-4 mt-6">
                        <AIRiskCard
                          risk={aiResult.risk}
                          confidence={aiResult.confidence}
                          reason={aiResult.reason}
                        />

                        <AIRecommendationCard
                          recommendation={aiResult.recommendation}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#EB8C00] hover:bg-[#D04A02] disabled:opacity-60 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {submitting ? "Saving..." : "Save Finding"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Recorded Findings ({findings.length})
            </h3>
            {findings.length > 0 ? (
              <div className="space-y-4">
                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="bg-white rounded-lg p-4 border border-[#DEDEDE]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-[#333333]">
                        {finding.title}
                      </h4>
                      <RiskBadge risk={finding.risk_level} />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {finding.description}
                    </p>
                    <div className="pt-3 border-t border-[#DEDEDE]">
                      <p className="text-xs text-gray-500 mb-1">
                        Recommendation:
                      </p>
                      <p className="text-sm text-[#333333]">
                        {finding.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No findings recorded yet
              </p>
            )}
          </div>

          {audit.status !== "COMPLETED" && (
            <div className="flex justify-end">
              <button
                onClick={() => navigate(`/auditor/submit/${audit.id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Submit Audit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
