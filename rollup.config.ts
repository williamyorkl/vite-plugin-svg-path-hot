import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

export default {
  input: "./src/index.ts",
  output: [
    {
      file: "./dist/index.js",
      format: "cjs",
    },
  ],
  external: ["vite-plugin-svg-icons", "vite"],
  plugins: [
    terser({
      output: {
        ascii_only: true, // 仅输出ascii字符
      },
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      tsconfigOverride: {
        compilerOptions: { module: "esnext" },
      },
    }),
  ],
};
