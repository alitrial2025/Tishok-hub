const pagesPreview = process.env.PAGES_PREVIEW === "1";
const basePath = pagesPreview ? process.env.PAGES_BASE_PATH || "" : "";
const pageExtensions = ["js", "jsx", "ts", "tsx"];

const nextConfig = {
  devIndicators: false,
  agentRules: false,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_PAGES_PREVIEW: pagesPreview ? "1" : "0",
  },
  pageExtensions: pagesPreview ? pageExtensions : ["server.js", ...pageExtensions],
  ...(pagesPreview && { output: "export", trailingSlash: true }),
};

export default nextConfig;
