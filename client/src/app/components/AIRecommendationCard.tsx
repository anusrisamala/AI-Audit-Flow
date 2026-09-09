type Props = {
  recommendation: string;
};

export function AIRecommendationCard({ recommendation }: Props) {
  return (
    <div className="bg-white border border-[#DEDEDE] rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#FFF3E0] flex items-center justify-center">
          <span className="text-[#EB8C00] text-sm font-bold">AI</span>
        </div>

        <h3 className="text-lg font-semibold text-[#2D2D2D]">
          AI Recommended Action
        </h3>
      </div>

      <div className="bg-[#F8F8F8] border border-[#DEDEDE] rounded-xl p-4">
        <p className="text-[#2D2D2D] leading-relaxed whitespace-pre-line">
          {recommendation}
        </p>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Review this recommendation before finalizing the audit finding.
      </p>
    </div>
  );
}