export default function Signature({ caption = false }) {
  return <div className="founder-signature">
    <span className="signature">Mwende Chege</span>
    {caption && <span className="signature-caption">FOUNDER &amp; CEO</span>}
  </div>;
}
