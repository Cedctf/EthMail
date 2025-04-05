/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Expose environment variables to the browser
  publicRuntimeConfig: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
  },
  // Also use env to expose them during server-side rendering
  env: {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI
  }
};

export default nextConfig; 