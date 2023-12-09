import { merge } from "webpack-merge";
import * as path from "node:path";
import common, { root } from "./webpack.base";
import Copy from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import CompressionPlugin from "compression-webpack-plugin";
import { browserslistToTargets } from "lightningcss";
import browserslist from "browserslist";

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
                 * @优化编译速度 使用 CssMinimizerPlugin 借助 lightningcss，优化压缩速度
                 */
                // parallel: true, // 并行压缩
                minify: CssMinimizerPlugin.lightningCssMinify,
                minimizerOptions: {
                    // @ts-ignore
                    targets: browserslistToTargets(browserslist(">= 0.25%")),
                },
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
            filename: "static/css/[name].[contenthash].css", // 抽离 css 的输出目录和名称
            chunkFilename: "static/css/[id].[contenthash].css",
            experimentalUseImportModule: true,
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
