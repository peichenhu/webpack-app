import { consola } from "consola";

let startTime: number;
let lastTime: number;
let lastHook: string;

export function progressHandle(
    percentage: number /** 构建进度百分比 */,
    hook: string /** 内置生命周期钩子函数*/,
    ...args: any[] /** 其他数据*/
) {
    const percent = (percentage * 100).toFixed(0);
    if (!startTime) {
        startTime = Date.now();
        lastTime = Date.now();
        consola.start("开始构建：");
        lastHook = hook;
        lastTime = Date.now();
    } else if (lastHook && hook !== lastHook) {
        const time = Date.now() - lastTime + "ms";
        const log = percent === "100" ? consola.success : consola.info;
        log(percent, lastHook, time);
        lastTime = Date.now();
    }
    lastHook = hook;
}

export function createExternals() {
    // 在打包时忽略配置的模块，从而加快打包速度。
    // externals 中配置的模块会被 webpack 忽略。
    // 在 externals 配置中的 key 是依赖的模块名字，value 是全局暴露出来的模块
    const externalList = [
        {
            type: "js",
            key: "jquery",
            value: "jQuery",
            url: "https://cdn.bootcdn.net/ajax/libs/jquery/3.7.1/jquery.min.js",
        },
    ];
    
    const externals: Record<string, string> = {};

    externalList.forEach(({ key, value }) => {
        externals[key] = value;
    });

    return { externals, externalList };
}
