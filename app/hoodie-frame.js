const outline = "M134 60c-7-14-9-28-4-38 8-16 34-21 45-21s37 5 45 21c5 10 3 24-4 38l51 17c14 5 24 15 29 28l45 103c3 7 0 12-6 15l-34 14c-6 3-12 0-15-5l-24-48v68c0 7-5 12-12 12H100c-7 0-12-5-12-12v-68l-24 48c-3 5-9 8-15 5l-34-14c-6-3-9-8-6-15l45-103c5-13 15-23 29-28z";

export default function HoodieFrame() {
  return <svg className="hoodie-frame" viewBox="0 0 350 266" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="hoodie-shell" x1="0%" x2="90%" y1="0%" y2="100%">
        <stop stopColor="#5c5144" />
        <stop offset="1" stopColor="#211d18" />
      </linearGradient>
    </defs>
    <path d={outline} fill="url(#hoodie-shell)" stroke="#a99a866e" strokeWidth="1.3" />
    <g fill="none" stroke="#d0bd9f" strokeWidth="1" opacity=".34">
      <path d="M135 60c13 14 26 21 40 21s27-7 40-21M149 13c-8 6-12 17-10 30 1 11 10 25 19 30m43-60c8 6 12 17 10 30-1 11-10 25-19 30" />
      <path d="M83 78c14 16 20 31 20 47 0 25-10 45-15 59m179-106c-14 16-20 31-20 47 0 25 10 45 15 59M89 245h172M15 209l49 20m222 0 49-20" />
      <path strokeDasharray="2 3" d="M93 238h164M18 204l49 20m216 0 49-20" />
    </g>
    <path d="M311 220l12-5" stroke="#ff572d" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
