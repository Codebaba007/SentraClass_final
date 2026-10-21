import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals"),
  { ignores: [".next/**", "node_modules/**", "apps/api/src/generated/prisma/**", "apps/api/dist/**"] },
  { files: ["apps/api/**/*.{ts,tsx}"], rules: { "@next/next/no-html-link-for-pages": "off" } },
];

export default config;
