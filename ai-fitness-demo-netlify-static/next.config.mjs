/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  experimental: {
    optimizePackageImports: ['@tensorflow/tfjs', '@tensorflow-models/pose-detection']
  }
};
export default nextConfig;
