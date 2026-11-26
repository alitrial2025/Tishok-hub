import "@fontsource-variable/space-grotesk";
import "@fontsource/cedarville-cursive/latin-400.css";
import "./globals.css";

export const metadata = {
  title: "OFF/FORM — Uniform for the Unruly",
  description: "Independent streetwear. Shop OFF/FORM Drop 01, a study in heavy cotton and industrial graphics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
