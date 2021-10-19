/**
 * 监听svg文件修改热更新
 */
import type { Plugin, PluginOption } from "vite";
import { normalizePath } from "vite";
import path from "path";
import fs from "fs";
import viteSvgIcons from "vite-plugin-svg-icons";
import type { ViteSvgIconsPlugin } from "vite-plugin-svg-icons";

export interface VitePluginSvgPathHotOpt extends Partial<ViteSvgIconsPlugin> {
  /**
   * specify paths to inclue *.svg files
   */
  svgPath: Array<string>;

  /**
   * specify main path to inclue *.svg files
   */
}

const touch = function (path: string) {
  const time = new Date();

  try {
    fs.utimesSync(path, time, time); // 同步修改文件和访问时间戳
  } catch (error) {
    console.log("touch -> error", error);
    fs.closeSync(fs.openSync(path, "r"));
  }
};

export default (opts: VitePluginSvgPathHotOpt): Plugin[] => {
  /**
   * 获取vite.config.ts指定的svg目录（作限制使用）
   */
  const { svgPath } = opts;

  /**
   * svg合并后的数组
   */
  const svgPluginArray: Plugin[] = [];

  /**
   * return all path that includes svg files
   */
  const handleGetSvgDir: (dir: string[], limitsDir: string[]) => string[] =
    function (dir, limitsDir) {
      if (!Array.isArray(dir)) return;
      const fullPath = path.resolve(process.cwd(), ...dir);

      /**
       * return all the files‘ name based on the given path
       *  in this example case, such as ['components', 'router','App.vue',"main.js"]
       */
      const pathArr = fs.readdirSync(fullPath);

      /**
       * init a path array
       */
      let dirArray = [];

      pathArr.forEach((item) => {
        /**
         * dir2: return a full path based on the given path '/src',
         *  such as ./xxx/xxx/src/main.js
         */
        const dir2 = normalizePath(
          path.resolve(process.cwd(), ...[...dir, item])
        );

        /**
         * to see if 'dir2' is a directory
         */
        if (fs.statSync(dir2).isDirectory()) {
          dirArray = dirArray.concat(
            handleGetSvgDir([...dir, item], limitsDir)
          );
        } else if (
          dir2.includes(".svg") &&
          limitsDir.some((p) => dir2.includes(p))
        ) {
          dirArray.push(path.resolve(process.cwd(), ...dir));
        }
      });

      return dirArray;
    };

  /**
   * all path that includes svg files
   */
  const SVG_PATHS = Array.from(new Set(handleGetSvgDir(["src"], svgPath)));

  /**
   * svg热更新插件
   */
  const SVG_PATHS_HOT_PLUGIN: Plugin = {
    name: "vite-plugin-svg-path-hot",
    apply: "serve", // 指定该插件只应用在开发环境

    configureServer(server) {
      let viteConfigFile = "vite.config.ts";
      let popUpFlag = false;

      // 初始化errSvg的数组
      const errSvgPathArr: Array<string> = [];

      // 转换string的数组方法
      const transformStringArr: (arr: typeof errSvgPathArr) => string =
        function (arr) {
          let errStringOutput = "";
          arr.forEach((item: string) => {
            errStringOutput = errStringOutput.concat(`${item}\n`);
          });
          return errStringOutput;
        };

      // 向ws发送错误弹窗
      const sendErrorPopUp: (flag: typeof popUpFlag) => void = function (flag) {
        if (!flag) return; // 如果没弹过窗，则不弹窗
        server.ws.send({
          type: "error",
          err: {
            name: "svg-missing",
            message:
              "若当前svg文件是用作icon图标，请确保其存放路径是在/icons目录，否则svg文件不生效",
            stack: "stack",
            id: transformStringArr(errSvgPathArr),
            plugin: "vite-plugin-svg-path-hot",
          },
        });
      };

      // ws服务器监听：文件新增
      server.watcher.on("add", (path) => {
        const normalPath = normalizePath(path);

        if (normalPath.includes(".svg")) {
          // 放入的svg文件，若在已有的svg目录内，直接刷新即可
          if (SVG_PATHS.some((p) => normalPath.includes(p))) {
            server.ws.send({ type: "full-reload" });
            return;
          }

          if (svgPath.some((i) => normalPath.includes(i))) {
            setTimeout(() => {
              touch(viteConfigFile);
              server.ws.send({ type: "full-reload" });
            });
          } else {
            errSvgPathArr.push(normalPath);
            popUpFlag = true;
            sendErrorPopUp(popUpFlag);
          }
        }
      });

      // ws服务器监听：文件删除
      server.watcher.on("unlink", (path) => {
        const normalPath = normalizePath(path);

        // 排除非svg文件
        if (!normalPath.includes(".svg")) return;

        // 排除在合规的svg文件目录下删除
        if (svgPath.some((i) => normalPath.includes(i))) return;

        // 移除err数组中的item
        const pIndex = errSvgPathArr.indexOf(path);
        errSvgPathArr.splice(pIndex, 1);

        // 如果err数组为空，刷新页面
        if (errSvgPathArr.length === 0) {
          server.ws.send({ type: "full-reload" });
        }

        // 发送错误弹窗
        sendErrorPopUp(popUpFlag);
      });
    },
  };

  svgPluginArray.push(SVG_PATHS_HOT_PLUGIN);

  svgPluginArray.push(
    viteSvgIcons({
      iconDirs: [...SVG_PATHS],
      ...opts,
    })
  );

  return svgPluginArray;
};
