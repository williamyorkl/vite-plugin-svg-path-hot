# vite-plugin-svg-path-hot

A vite plugin that solve integrate [vite-plugin-svg-icons](https://www.npmjs.com/package/vite-plugin-svg-icons) and support hot svg files adding / deleting.

- If you have svg folder in different path, you don't have to specify them all, this plugin will auto detect.
- If you add a folder to place svg files, the page will refresh, and the svg files will be added automatically without restarting the vite service.

All the options in `vite-plugin-svg-icons` will be support in this plugin.

## How to Test Svg Hot updates ？

> the refreshing page update will only trigger when a new folder including svg is created.

1. Move folder `/example/vue2/test/icons` folder to `example/vue2/src/ComponentB`

2. And you will find that the page will refresh and the svg are showing in the `svg spirit html map`

3. But next time when you add a new `svg file` to the `example/vue2/src/components/ComponentB/icons/`, the page wont refresh, but the `svg file` will still update on the `svg spirit html map`

<br/>

## Usage

#### 1. Install

```bash
npm i vite-plugin-svg-path-hot -D
```

#### 2. Add it to `vite.config.js`

```js
// vite.config.js
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
```

2. Some the other options for reference

```ts
export interface VitePluginSvgPathHotOpt extends Partial<ViteSvgIconsPlugin> {
  /**
   * specify paths to inclue *.svg files
   *  for example, if you set svgPath: ['']
   */
  svgPath: Array<string>;
}
```

#### 4. For some the other options

Refer to: https://www.npmjs.com/package/vite-plugin-svg-icons

<br/>

## License

MIT License © 2021 [williamyorkl](https://github.com/williamyorkl)
