import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

const featureNames = ['visibility', 'prompts', 'answers', 'marketing'];
const typedConfigs = tseslint.configs.strictTypeChecked.map((config) =>
  config.files ? config : { ...config, files: ['**/*.{ts,tsx,mts,cts}'] },
);

const featureBoundaryConfigs = featureNames.map((featureName) => ({
  files: [`src/features/${featureName}/**/*.{js,jsx,ts,tsx}`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: featureNames
          .filter((otherFeatureName) => otherFeatureName !== featureName)
          .map((otherFeatureName) => ({
            group: [`@/features/${otherFeatureName}`, `@/features/${otherFeatureName}/**`],
            message: 'Features may import shared code, not another feature.',
          })),
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...typedConfigs,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Use named exports outside Next.js route files.',
        },
      ],
    },
  },
  ...featureBoundaryConfigs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'coverage/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
