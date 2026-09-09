type Props = {
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  reason: string;
};

const riskColors: Record<Props['risk'], string> = {
  LOW: 'bg-green-100 text-green-800 border-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-800 border-red-200',
};

export function AIRiskCard({ risk, confidence, reason }: Props) {
  return (
    <div className="bg-white border border-[#DEDEDE] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2D2D2D]">
          AI Risk Assessment
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${riskColors[risk]}`}
        >
          {risk}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Confidence</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#EB8C00] h-2 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <p className="text-sm font-medium text-[#2D2D2D] mt-1">
            {confidence}%
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">AI Explanation</p>
          <p className="text-[#2D2D2D] leading-relaxed">
            {reason}
          </p>
        </div>
      </div>
    </div>
  );
}