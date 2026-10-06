import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

const moduleAwareQuotes = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Use double quotes for module specifiers and single quotes for other strings',
    },
    fixable: 'code',
    schema: [],
    messages: {
      incorrectQuote: 'Use {{quote}} quotes for {{target}}.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;

        const parent = node.parent;
        const isModuleSpecifier =
          ((parent.type === 'ImportDeclaration' ||
            parent.type === 'ExportNamedDeclaration' ||
            parent.type === 'ExportAllDeclaration') &&
            parent.source === node) ||
          (parent.type === 'ImportExpression' && parent.source === node) ||
          (parent.type === 'TSImportType' && parent.parameter === node);
        const expectedQuote = String.fromCharCode(isModuleSpecifier ? 34 : 39);
        const raw = context.sourceCode.getText(node);

        if (raw.startsWith(expectedQuote)) return;

        context.report({
          node,
          messageId: 'incorrectQuote',
          data: {
            quote: isModuleSpecifier ? 'double' : 'single',
            target: isModuleSpecifier ? 'module specifiers' : 'strings',
          },
          fix(fixer) {
            const serialized = JSON.stringify(node.value);
            const replacement = isModuleSpecifier
              ? serialized
              : `'${serialized.slice(1, -1).replaceAll(String.fromCharCode(39), String.fromCharCode(92, 39))}'`;

            return fixer.replaceText(node, replacement);
          },
        });
      },
    };
  },
};

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'auth_info_baileys/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: {
      '@stylistic': stylistic,
      local: {
        rules: {
          'module-aware-quotes': moduleAwareQuotes,
        },
      },
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/indent': ['error', 2, { SwitchCase: 1 }],
      '@stylistic/semi': ['error', 'always'],
      'local/module-aware-quotes': 'error',
    },
  },
);
