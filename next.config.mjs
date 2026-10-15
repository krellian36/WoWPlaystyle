/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/proxy/wow-icon/:iconName*",
        destination: "https://wow.zamimg.com/images/wow/icons/large/:iconName*.jpg",
      },
    ];
  },
};

export default nextConfig;
