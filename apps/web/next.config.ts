import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Игнорируем ошибки линтера во время сборки на продакшене,
    // так как они часто вызваны конфликтами ESLint 9 и Next.js в монорепозиториях
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ошибки TypeScript мы продолжаем проверять для надежности
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
