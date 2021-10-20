import { createVuePlugin } from "vite-plugin-vue2";
import VitePluginVue2Suffix from "vite-plugin-vue2-suffix";
import VitePluginSvgPathHot from "../../dist";

import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    createVuePlugin(),
    VitePluginVue2Suffix(),
    VitePluginSvgPathHot({
      svgPath: [
        // public svg icons
        "/src/icons/svg/",

        // separate svg icons in every components page
        "/icons/",
      ],
      symbolId: "icon-[name]",

      // other props are all available,which extends from ‘vite-plugin-svg-icons’
    }),
  ],
});
