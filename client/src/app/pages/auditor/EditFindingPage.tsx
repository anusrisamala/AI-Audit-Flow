import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findingService, Finding } from "../../services/findingService";
import { ClipboardList, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Header } from "../../components/Header";
import { aiService, AIRiskResponse } from "../../services/aiService";
import { AIRiskCard } from "../../components/AIRiskCard";
import { AIRecommendationCard } from "../../components/AIRecommendationCard";

export function EditFindingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [finding, setFinding] = useState<Partial<Finding>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiResult, setAiResult] = useState<AIRiskResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const loadFinding = async () => {
      try {
        if (!id) return;

        const data = await findingService.getById(Number(id));
        setFinding(data);
      } catch (err) {
        setError("Failed to load finding");
      } finally {
        setLoading(false);
      }
    };

    loadFinding();
  }, [id]);

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Edit Finding Page" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Edit Finding Page" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!id) return;

    await findingService.update(Number(id), finding);

    navigate("/auditor/findings");
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);

      const result = await aiService.analyzeFinding({
  title: finding.title || "",
  description: finding.description || "",
  department: finding.audit_department || "",
});

      setAiResult(result);

      // Auto-fill the form with AI suggestions
      // setFinding({
      //   ...finding,

      //   // Normal fields
      //   risk_level: result.risk as Finding["risk_level"],
      //   recommendation: result.recommendation,

      //   // AI fields
      //   ai_risk_level: result.risk as Finding["risk_level"],
      //   ai_confidence: result.confidence,
      //   ai_reason: result.reason,
      //   ai_recommendation: result.recommendation,
      // });
      setFinding({
  ...finding,

  // Update final risk if you want AI suggestion
  risk_level: result.risk as Finding["risk_level"],

  // DO NOT overwrite human recommendation
  recommendation: finding.recommendation,


  // Save AI data
  ai_risk_level: result.risk as Finding["risk_level"],
  ai_confidence: result.confidence,
  ai_reason: result.reason,
  ai_recommendation: result.recommendation,
});
    } catch (err) {
      console.error(err);
      alert("AI analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="ml-64 pt-16">
      <Header title="Edit Finding Page" />
      <div className="p-8">
        <button
          onClick={() => navigate("/auditor/findings")}
          className="mb-6 text-[#666666] hover:text-[#EB8C00] transition-colors"
        >
          ← Back to Findings
        </button>

        <div className="bg-white border border-[#DEDEDE] rounded-xl shadow-sm p-8 max-w-4xl">
          <h1 className="text-3xl font-bold text-[#333333] mb-8">
            Edit Finding
          </h1>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-2">
                Finding Title
              </label>

              <input
                type="text"
                value={finding.title || ""}
                onChange={(e) =>
                  setFinding({
                    ...finding,
                    title: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-2">
                Description
              </label>

              <textarea
                rows={5}
                value={finding.description || ""}
                onChange={(e) =>
                  setFinding({
                    ...finding,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
              />
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-[#555555] mb-2">
                Risk Level
              </label>

              <select
                value={finding.risk_level || ""}
                onChange={(e) =>
                  setFinding({
                    ...finding,
                    risk_level: e.target.value as Finding["risk_level"],
                  })
                }
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
              >
                {/* <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option> */}
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Recommendation */}
            <div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-4 py-2 bg-[#EB8C00] text-white rounded-lg hover:bg-[#D04A02] disabled:opacity-50 flex items-center gap-2"
                >
                  {analyzing && <Loader2 className="animate-spin" size={16} />}
                  {analyzing ? "Analyzing..." : "Analyze with AI"}
                </button>
              </div>
              <label className="block text-sm font-medium text-[#555555] mb-2">
                Recommendation
              </label>

              <textarea
                rows={4}
                value={finding.recommendation || ""}
                onChange={(e) =>
                  setFinding({
                    ...finding,
                    recommendation: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-[#DEDEDE] rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#EB8C00]"
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

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => navigate("/auditor/findings")}
                className="px-6 py-3 rounded-lg border border-[#DEDEDE] text-[#555555] hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-[#EB8C00] text-white hover:bg-[#D04A02] transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
