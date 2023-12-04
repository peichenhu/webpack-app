import { merge } from "webpack-merge";
import type { Configuration as DevServerConfiguration } from "webpack-dev-server";
import common, { root } from "./webpack.base";
import path from "node:path";

const devServer: DevServerConfiguration = {
    host: "local-ip",
    port: 1024,
    hot: true,
    open: true,
    compress: false, // Gzip 压缩, 开发环境不开启, 提升热更新速度
    historyApiFallback: true, // 解决 history 路由 404 问题
    static: {
        directory: path.join(root, "public"), // 托管静态资源 public 文件夹
    },
};

export default merge(common, {
    devServer,
    mode: "development",
    devtool: "eval-cheap-module-source-map", // 源码调试模式,后面会讲
    module: {
        rules: [
            {
                test: /\.css$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                use: [
                    // "thread-loader",
                    "style-loader",
                    "css-loader",
                ],
            },
        ],
    },
    /**
     * @优化二次编译速度 配置 cache 持久化缓存
     * cache 会在开发 模式被设置成 type: 'memory' 而且在 生产 模式 中被禁用。
     */
    // cache: true,
    optimization: {
        // 告知 webpack 去决定每个模块使用的导出内容。
        // 这取决于 optimization.providedExports 选项。
        usedExports: true,
        // 告知 webpack 去确定那些由模块提供的导出内容，为 export * from ... 生成更多高效的代码。
        // 默认 optimization.providedExports 会被启用。
        providedExports: true,
    },
    plugins: []
});
