import { merge } from "webpack-merge";
import * as path from "node:path";
import common, { root } from "./webpack.base";
import Copy from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";

// import { EsbuildPlugin } from "esbuild-loader";
import type { JsMinifyOptions as SwcOptions } from "@swc/core";
import TerserPlugin from "terser-webpack-plugin";

export default merge(common, {
    mode: "production",
    module: {
        rules: [
            {
                test: /\.css$/i,
                include: [path.resolve(root, "src")],
                // exclude: [],
                use: [
                    // "thread-loader",
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                ],
            },
        ],
    },
    optimization: {
        /**
         * @优化产物大小 配置 optimization.sideEffects 和 TreeShaking，减小产物大小
         * 告知 webpack 去辨识 package.json 中的副作用标记或规则，
         * 以跳过那些当导出不被使用且被标记不包含副作用的模块。
         */
        sideEffects: true,
        splitChunks: {
            /**
             * @优化渲染速度 使用 splitChunks 分隔公共业务模块，优化编译速度
             * @优化渲染速度 使用 splitChunks 分隔 node_modules 中变动少的模块，优化编译速度
             */
            cacheGroups: {
                vendors: {
                    // 提取 node_modules 代码
                    test: /node_modules/, // 只匹配 node_modules 里面的模块
                    name: "vendors", // 提取文件命名为 vendors,js后缀和 chunkhash 会自动加
                    minChunks: 1, // 只要使用一次就提取出来
                    chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
                    minSize: 0, // 提取代码体积大于0就提取出来
                    priority: 1, // 提取优先级为1
                },
                commons: {
                    // 提取公共代码
                    name: "commons", // 提取文件命名为 commons
                    minChunks: 2, // 只要使用两次就提取出来
                    chunks: "initial", // 只提取初始化就能获取到的模块,不管异步的
                    minSize: 0, // 提取代码体积大于 0 就提取出来
                },
            },
        },
        minimize: true,
        minimizer: [
            /**
             * @优化产物大小 使用 CssMinimizerPlugin 压缩 css 产物 (比较耗时)
             * @优化产物大小 使用 TerserPlugin 自定义配置 优化压缩
             * @优化产物大小 尝试 EsbuildPlugin 优化压缩
             */
            new CssMinimizerPlugin({
                /**
                 * @优化编译速度 使用 CssMinimizerPlugin parallel 多线程，优化压缩速度
                 */
                parallel: true, // 并行压缩
            }),
            new TerserPlugin<SwcOptions>({
                /**
                 * @优化编译速度 使用 SWC 优化压缩速度
                 * @优化编译速度 使用 TerserPlugin parallel 多线程 优化压缩速度
                 */
                minify: TerserPlugin.swcMinify, // 将删除所有注释
                // parallel: true, // 开启多线程压缩
                terserOptions: {
                    // `swc` options
                },
            }),
            // new EsbuildPlugin(), // 没 TerserPlugin 效果好
        ],
    },
    plugins: [
        /**
         * @优化渲染速度_优化产物大小 使用 CompressionPlugin 构建 Gzip 格式静态文件
         * @优化渲染速度 使用 MiniCssExtractPlugin 拆分 css，修正页面资源加载顺序，提升页面渲染速度
         */
        new CompressionPlugin({
            test: /\.(js|css)$/, // 只生成css,js压缩文件
        }),
        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:8].css", // 抽离css的输出目录和名称
        }),
        new Copy({
            patterns: [
                {
                    from: path.resolve(root, "public"),
                    to: "./",
                    filter: function (filePath) {
                        if (filePath.endsWith(".art")) return false;
                        if (filePath.endsWith(".ico")) return false;
                        return true;
                    },
                },
            ],
        }),
    ],
});
