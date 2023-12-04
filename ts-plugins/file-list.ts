import { consola } from "consola";
// import chalk from "chalk";
import { type WebpackPluginInstance, Compiler } from "webpack";
type Options = { outputFile: string };

export class FileListPlugin implements WebpackPluginInstance {
    options: Options;
    // 需要传入自定义插件构造函数的任意选项
    //（这是自定义插件的公开API）
    constructor(options: Partial<Options> = {}) {
        // 在应用默认选项前，先应用用户指定选项
        // 合并后的选项暴露给插件方法
        // 记得在这里校验所有选项
        const defaultOpts = { outputFile: "assets.md" };
        this.options = Object.assign(defaultOpts, options);
    }

    apply(compiler: Compiler) {
        const pluginName = FileListPlugin.name;

        // webpack 模块实例，可以通过 compiler 对象访问，
        // 这样确保使用的是模块的正确版本（不要直接 require/import webpack）
        const { webpack } = compiler;

        // Compilation 对象提供了对一些有用常量的访问。
        const { Compilation } = webpack;

        // RawSource 是其中一种 “源码”("sources") 类型，
        // 用来在 compilation 中表示资源的源码
        const { RawSource } = webpack.sources;

        // 绑定到 “thisCompilation” 钩子，
        // 以便进一步绑定到 compilation 过程更早期的阶段
        compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
            // 绑定到资源处理流水线(assets processing pipeline)
            compilation.hooks.afterOptimizeAssets.tap(
                {
                    name: pluginName,
                    // 用某个靠后的资源处理阶段，
                    // 确保所有资源已被插件添加到 compilation
                    stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
                },
                (assets) => {
                    // assets 是一个包含 compilation 中所有资源的对象。
                    // 该对象的键是资源的路径，值是文件的源码

                    // 遍历所有资源，生成 Markdown 文件的内容
                    let content = ["本次构建产物：\n"];
                    let maxLength = 0;
                    let assetList = Object.entries(assets).map((asset) => {
                        let [name, source] = asset;
                        maxLength = Math.max(maxLength, name.length);
                        return { name, size: source.size() };
                    });
                    // 排序根据资源的大小
                    assetList.sort((a, b) => a.size - b.size);
                    // 拼接 Markdown 文件的内容
                    consola.start(content[0]);
                    assetList.reduce((list, asset) => {
                        let size = (asset.size / 1024).toFixed(2);
                        let name = asset.name.padEnd(maxLength + 4, "-");
                        list.push(`- ${name}\`${size}kb\``);
                        consola.info(list[list.length - 1]);
                        return list;
                    }, content);
                    // 向 compilation 添加新的资源，
                    // webpack 就会自动生成并输出到 output 目录
                    // compilation.emitAsset(
                    //     this.options.outputFile,
                    //     new RawSource(content.join("\n"))
                    // );
                }
            );
        });
    }
}
