import { DataBloomerLogoMarkGraphic } from "@/lib/site/databloomer-logo-mark-graphic";

type Props = {
  className?: string;
  size?: number;
};

/** Two-leaf bloom mark for DataBloomer branding */
export function DataBloomerLogoMark({ className = "", size = 32 }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="DataBloomer"
      >
        <DataBloomerLogoMarkGraphic />
      </svg>
    </span>
  );
}
