import {
  ROOF_JOB_VALUE_DISCLAIMER,
  ROOF_JOB_VALUE_SHORT_LABEL,
  formatEstimatedJobValue,
} from "@/lib/leads/roof-job-value";

type Props = {
  value: number | null | undefined;
  heatedSqft?: number | null;
  compact?: boolean;
  showDisclaimer?: boolean;
};

export function EstimatedJobValue({
  value,
  heatedSqft,
  compact,
  showDisclaimer = true,
}: Props) {
  if (value == null) {
    return compact ? (
      <span className="text-stone-500">—</span>
    ) : (
      <p className="text-xs text-stone-500">
        {ROOF_JOB_VALUE_SHORT_LABEL}: not available (heated area missing)
      </p>
    );
  }

  return (
    <div className={compact ? "" : "mt-1"}>
      <p className={`font-medium text-stone-800 ${compact ? "text-xs" : "text-sm"}`}>
        {ROOF_JOB_VALUE_SHORT_LABEL}:{" "}
        <span className="text-orange-800">{formatEstimatedJobValue(value)}</span>
        {heatedSqft != null ? (
          <span className="font-normal text-stone-500">
            {" "}
            · ~{heatedSqft.toLocaleString("en-US")} heated sq ft
          </span>
        ) : null}
      </p>
      {showDisclaimer && !compact ? (
        <p className="mt-1 text-[11px] leading-snug text-stone-500">
          {ROOF_JOB_VALUE_DISCLAIMER}
        </p>
      ) : null}
    </div>
  );
}
