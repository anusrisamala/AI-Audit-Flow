import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { KPICard } from "../../components/KPICard";
import { StatusBadge } from "../../components/StatusBadge";
import {
  dashboardService,
  AuditorDashboardData,
} from "../../services/dashboardService";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

export function AuditorDashboard() {
  const [dashboard, setDashboard] = useState<AuditorDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);
  const loadDashboard = async () => {
    try {
      const data = await dashboardService.getAuditorDashboardData();
      setDashboard(data);
    } catch (error) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Auditor Dashboard" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Auditor Dashboard" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const recentAudits = dashboard?.recentAudits || [];
  const kpis = dashboard?.kpis || { assignedAudits: 0, pendingAudits: 0, completedAudits: 0 };
  const findingsByRisk = dashboard?.findingsByRisk || { critical: 0, high: 0, medium: 0, low: 0 };
  const monthlyCompletedAudits = dashboard?.monthlyCompletedAudits || [];

  const chartData = {
    labels: ["Assigned", "Pending", "Completed"],
    datasets: [
      {
        data: [
          kpis.assignedAudits,
          kpis.pendingAudits,
          kpis.completedAudits,
        ],
        backgroundColor: ["#EB8C00", "#3B82F6", "#10B981"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  const findingsRiskData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Findings",
        data: [
          findingsByRisk.critical ?? 0,
          findingsByRisk.high ?? 0,
          findingsByRisk.medium ?? 0,
          findingsByRisk.low ?? 0,
        ],
        backgroundColor: [
          "rgba(239, 68, 68, 0.35)", // Critical - Soft Red
          "rgba(249, 115, 22, 0.35)", // High - Soft Orange
          "rgba(245, 158, 11, 0.35)", // Medium - Soft Amber
          "rgba(34, 197, 94, 0.35)", // Low - Soft Green
        ],
        borderColor: ["#EF4444", "#F97316", "#F59E0B", "#22C55E"],
        borderWidth: 2,
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };
  const findingsRiskOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };
  const totalFindings =
    (findingsByRisk.critical ?? 0) +
    (findingsByRisk.high ?? 0) +
    (findingsByRisk.medium ?? 0) +
    (findingsByRisk.low ?? 0);

  const monthlyAuditData = {
    labels: monthlyCompletedAudits.map((item) => item.month),
    datasets: [
      {
        label: "Completed Audits",
        data: monthlyCompletedAudits.map((item) => item.count),

        borderColor: "#2563EB", // Professional Blue
        backgroundColor: "rgba(37,99,235,0.12)",

        fill: true,
        tension: 0.35,

        pointBackgroundColor: "#2563EB",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,

        borderWidth: 3,
      },
    ],
  };

  const monthlyAuditOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#FFFFFF",
        bodyColor: "#FFFFFF",
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#6B7280",
        },
        grid: {
          color: "rgba(0,0,0,0.06)",
        },
      },
    },
  };

  return (
    <div className="ml-64 pt-16">
      <Header title="Auditor Dashboard" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Assigned Audits"
            value={kpis.assignedAudits}
            icon={ClipboardList}
            iconColor="#EB8C00"
          />
          <KPICard
            title="Pending Audits"
            value={kpis.pendingAudits}
            icon={Clock}
            iconColor="#3B82F6"
          />
          <KPICard
            title="Completed Audits"
            value={kpis.completedAudits}
            icon={CheckCircle}
            iconColor="#10B981"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Audit Progress
            </h3>
            <div className="h-64">
              {kpis.assignedAudits +
                kpis.pendingAudits +
                kpis.completedAudits >
              0 ? (
                <Doughnut data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    No audits assigned yet
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Findings by Risk Level
            </h3>
            <div className="flex flex-col gap-4 justify-center h-64">
              {/* <Bar data={findingsRiskData} options={findingsRiskOptions} /> */}
              {totalFindings > 0 ? (
                <Bar data={findingsRiskData} options={findingsRiskOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500 text-center">
                    No findings available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Monthly Completed Audits
            </h3>
            <div className="flex flex-col gap-4 justify-center h-64">
              {dashboard.monthlyCompletedAudits.length > 0 ? (
                <Line data={monthlyAuditData} options={monthlyAuditOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No completed audits available</p>
                </div>
              )}
            </div>
          </div> */}
          <div className="lg:col-span-2 bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-bold text-[#333333] mb-4">
              Monthly Completed Audits
            </h3>

            <div className="h-64">
              {dashboard.monthlyCompletedAudits.length > 0 ? (
                <Line data={monthlyAuditData} options={monthlyAuditOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No completed audits available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
          <h3 className="text-lg font-bold text-[#333333] mb-4">
            Recent Assigned Audits
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#DEDEDE]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                    Audit Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                    Department
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#333333]">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentAudits.length > 0 ? (
                  recentAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      className="border-b border-[#DEDEDE] hover:bg-white transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-[#333333]">
                        {audit.audit_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {audit.department}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={audit.status} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(audit.due_date).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No audits assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
