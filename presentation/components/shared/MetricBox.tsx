import { memo } from "react";

type MetricVariant = "default" | "primary";
type MetricSize = "normal" | "compact";

interface MetricBoxProps {
  label: string;
  value: string;
  subValue?: string;
  variant?: MetricVariant;
  size?: MetricSize;
}

const VARIANT_CLASSES: Record<MetricVariant, string> = {
  default: "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20",
  primary: "bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30",
};

const COMPACT_VARIANT_CLASSES: Record<MetricVariant, string> = {
  default: "bg-red-500/10 border-red-500/30",
  primary: "bg-red-500/15 border-red-500/40",
};

function MetricBoxComponent({
  label,
  value,
  subValue,
  variant = "default",
  size = "normal",
}: MetricBoxProps) {
  const isCompact = size === "compact";
  const bgClass = isCompact 
    ? COMPACT_VARIANT_CLASSES[variant] 
    : VARIANT_CLASSES[variant];
  const paddingClass = isCompact ? "p-4" : "p-5";
  const minHeightClass = isCompact ? "min-h-22.5" : "min-h-25";
  const valueColor = variant === "primary" ? "text-green-400" : "text-white";

  return (
    <div
      className={`${bgClass} border rounded-xl ${paddingClass} flex flex-col items-center justify-center ${minHeightClass}`}
    >
      <p className="text-white/50 text-sm mb-2">{label}</p>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      {subValue && <p className="text-white/40 text-xs mt-2">{subValue}</p>}
    </div>
  );
}

export const MetricBox = memo(MetricBoxComponent);
