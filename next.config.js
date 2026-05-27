/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["googleapis", "twilio", "resend"],
  allowedDevOrigins: ["10.5.0.2"],
};

export default nextConfig;
