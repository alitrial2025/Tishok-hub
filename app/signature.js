export default function Signature({ caption = false }) {
  return <div className="founder-signature">
    <svg className="signature" viewBox="0 0 310 76" role="img" aria-label="Mwende Chege" fill="none">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path strokeWidth="2.15" d="M4 51c10-5 18-19 23-36 2-6-1-6-4 0-6 10-5 25-8 38 6-9 14-23 23-34 4-5 7-6 4 2l-8 28c9-14 16-24 23-29 5-4 6-2 3 3-6 10-9 18-9 22 0 6 5 5 11-1l7-8" />
        <path strokeWidth="1.55" d="M68 37c-4 6-6 14-1 14 4 0 9-6 12-12-2 7-1 12 4 10 4-1 9-8 10-13 1-3-1-4-2-1-4 9 3 11 10 8 5-2 10-6 10-8 0-4-6-3-9 1-4 4-5 11 0 12 5 1 11-4 17-11 3-4 6-6 5-2l-4 12c5-7 11-13 15-12 3 1-2 10 0 12 2 3 7 0 13-7 4-5 10-8 13-4 2 2-1 7-4 10-4 4-9 4-9 0-1-6 5-12 11-14" />
        <path strokeWidth="1.6" d="M159 39c4-7 9-18 12-26 1-4-2-6-5-1-5 8-10 25-8 32 1 4 6 2 11-3 5-5 10-10 13-7 3 3-6 9-12 9 1 5 6 7 16 0" />
        <path strokeWidth="2.1" d="M217 22c6-6 8-12 1-13-9-2-25 7-31 21-8 16 0 25 11 22 9-2 17-7 23-13l9-11c6-8 12-20 9-23-3-4-9 7-13 19-3 11-4 18-8 26" />
        <path strokeWidth="1.55" d="M220 47c6-9 13-15 17-13 4 2-3 11 0 13 2 2 8-2 13-6 4-4 9-8 11-5 2 4-6 8-11 8 0 5 6 7 13 2l5-4c6-7 12-9 15-5 2 4-4 11-8 12-7 3-8-3-3-9 3-4 8-6 11-5l-9 24c-2 7-7 13-12 13-6 0-5-6 1-12 6-6 13-10 20-14 8-4 13-12 16-10 3 3-5 9-10 9 0 6 8 7 17-1" />
        <path strokeWidth="1.05" opacity=".72" d="M97 66c39-8 112-12 178-9 16 1 27 1 31-1" />
      </g>
    </svg>
    {caption && <span className="signature-caption">Mwende Chege · Founder &amp; CEO</span>}
  </div>;
}
