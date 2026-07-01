/** Shared two-leaf bloom mark paths (header logo, favicon, OG). */
export function DataBloomerLogoMarkGraphic() {
  return (
    <>
      <rect width="32" height="32" rx="8" fill="#f0fdf4" />
      <path
        d="M16 23.5C16 23.5 8.5 19.5 9.5 12.5C10.2 8.5 13.5 8 15.5 11C15.8 11.5 16 12.2 16 13.2V23.5Z"
        fill="#22c55e"
      />
      <path
        d="M16 23.5C16 23.5 23.5 19.5 22.5 12.5C21.8 8.5 18.5 8 16.5 11C16.2 11.5 16 12.2 16 13.2V23.5Z"
        fill="#16a34a"
      />
      <path
        d="M16 13.2V23.5"
        stroke="#15803d"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M12.5 14.5C11 12.5 10.5 10.5 11 9"
        stroke="#14532d"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M19.5 14.5C21 12.5 21.5 10.5 21 9"
        stroke="#14532d"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.4"
      />
    </>
  );
}
