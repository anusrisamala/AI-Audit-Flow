import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { KPICard } from "../../components/KPICard";
import { StatusBadge } from "../../components/StatusBadge";
import {
  dashboardService,
  AdminDashboardData,
} from "../../services/dashboardService";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Pie, Bar, Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
);

export function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

 useEffect(() => {
  dashboardService
    .getAdminDashboard()
    .then((dashData) => setData(dashData))
    .catch(() => setError("Failed to load dashboard data"))
    .finally(() => setLoading(false));
}, []);

  if (loading) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Admin Dashboard" />
        <div className="p-8 flex justify-center">
          <Loader2 className="animate-spin text-[#EB8C00]" size={32} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="ml-64 pt-16">
        <Header title="Admin Dashboard" />
        <div className="p-8">
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const statusData = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [
          data.auditStatus.pending,
          data.auditStatus.inProgress,
          data.auditStatus.completed,
        ],
        backgroundColor: ["#F59E0B", "#3B82F6", "#22C55E"],
        borderColor: "#FFFFFF",
        borderWidth: 2,
      },
    ],
  };

  const findingsData = {
    labels: ["Critical", "High", "Medium", "Low"],
    datasets: [
      {
        label: "Findings",
        data: [
          data.findingsByRisk.critical,
          data.findingsByRisk.high,
          data.findingsByRisk.medium,
          data.findingsByRisk.low,
        ],
        backgroundColor: ["#DC2626", "#F97316", "#FACC15", "#22C55E"],
        borderRadius: 8,
      },
    ],
  };

  const monthlyCompletedData = {
  labels: data.monthlyCompletedAudits.map((item) => item.month),
  datasets: [
    {
      label: "Completed Audits",
      data: data.monthlyCompletedAudits.map((item) => item.count),
      borderColor: "#EB8C00",
      backgroundColor: "rgba(235,140,0,0.18)",
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: "#EB8C00",
    },
  ],
};

const departmentData = {
  labels: data.auditsByDepartment.map((item) => item.department),
  datasets: [
    {
      label: "Audits",
      data: data.auditsByDepartment.map((item) => item.count),
      backgroundColor: [
        "#EB8C00",
        "#3B82F6",
        "#10B981",
        "#DB536A",
        "#8B5CF6",
        "#14B8A6",
      ],
      borderRadius: 8,
    },
  ],
};
  return (
    <div className="ml-64 pt-16">
      <Header title="Admin Dashboard" />

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Audits"
            value={data.kpis.totalAudits}
            icon={ClipboardList}
            iconColor="#EB8C00"
          />

          <KPICard
            title="Active Audits"
            value={data.kpis.activeAudits}
            icon={Clock}
            iconColor="#3B82F6"
          />

          <KPICard
            title="Completed Audits"
            value={data.kpis.completedAudits}
            icon={CheckCircle}
            iconColor="#10B981"
          />

          <KPICard
            title="High Risk Findings"
            value={data.kpis.highRiskFindings}
            icon={AlertTriangle}
            iconColor="#DB536A"
          />
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Audit Status Pie Chart */}
          <div className="bg-[#F8F8F8] rounded-xl p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">
              Audit Status Distribution
            </h3>

            <div className="h-[320px]">
              <Pie
                data={statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Findings by Risk */}
          <div className="bg-[#F8F8F8] rounded-xl p-6 border border-[#DEDEDE] shadow-sm">
            <h3 className="text-lg font-semibold text-[#333333] mb-4">
              Findings by Risk
            </h3>

            <div className="h-[320px]">
              <Bar
                data={findingsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

  {/* Monthly Completed Audits */}
  <div className="bg-[#F8F8F8] rounded-xl p-6 border border-[#DEDEDE] shadow-sm">
    <h3 className="text-lg font-semibold text-[#333333] mb-4">
      Monthly Completed Audits
    </h3>

    <div className="h-[320px]">
      <Line
        data={monthlyCompletedData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  </div>

  {/* Audits by Department */}
  <div className="bg-[#F8F8F8] rounded-xl p-6 border border-[#DEDEDE] shadow-sm">
    <h3 className="text-lg font-semibold text-[#333333] mb-4">
      Audits by Department
    </h3>

    <div className="h-[320px]">
      <Bar
        data={departmentData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
              },
            },
          },
        }}
      />
    </div>
  </div>

</div>

        <div className="bg-[#F8F8F8] rounded-lg p-6 border border-[#DEDEDE] shadow-sm">
          <h3 className="text-lg font-bold text-[#333333] mb-4">
            Recent Audits
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
                    Assigned Auditor
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
                {data.recentAudits.map((audit) => (
                  <tr
  key={audit.id}
  className="border-b border-[#DEDEDE] hover:bg-white transition-colors"
>
  <td className="py-3 px-4 text-sm text-[#333333]">
    {audit.title}
  </td>

  <td className="py-3 px-4 text-sm text-gray-600">
    {audit.department}
  </td>

  <td className="py-3 px-4 text-sm text-gray-600">
    {audit.assignedAuditor || "Unassigned"}
  </td>

  <td className="py-3 px-4">
    <StatusBadge status={audit.status} />
  </td>

  <td className="py-3 px-4 text-sm text-gray-600">
    {new Date(audit.due_date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}
  </td>
</tr>
                ))}
                {data.recentAudits.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No audits yet
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
