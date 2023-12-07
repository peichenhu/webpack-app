import * as path from "node:path";
import * as webpack from "webpack";
import type { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { VueLoaderPlugin } from "vue-loader";
import { createExternals } from "./utils";

export const root = path.resolve(__dirname, "../");

const { externals, externalList } = createExternals();

const config: Configuration = {
    target: "web",
    context: path.resolve(root, "src"),
    entry: {
        main: "./main.ts",
        test: "./test/index.ts",
    },
    output: {
        clean: true,
        path: path.resolve(root, "dist"),
        filename: "static/js/[name].[chunkhash:8].js", // 每个输出js的名称
        // assetModuleFilename: "assets/[name][ext][query]",
        publicPath: "/", // 打包后文件的公共前缀路径
        crossOriginLoading: "anonymous",
        scriptType: "module",
    },
    externals: {
        /**
         * @优化编译速度_优化产物大小 配置 externals 外部扩展，减少构建文件
         * 在打包时忽略配置的模块，从而加快打包速度。
         * externals 中配置的模块会被 webpack 忽略。
         * 在 externals 配置中的 key 是依赖的模块名字，value 是全局暴露出来的模块
         */
        ...externals,
    },
    resolve: {
        /**
         * @优化编译速度 文件定向查找，定义 alias 文件后缀名，尽可能减少后缀尝试的可能性
         * @优化编译速度 文件定向查找，定义 extensions 文件别名，避免文件层级太深查找太慢
         * @优化编译速度 文件定向查找，定义 modules 模块查找目录，使用绝对路径，只在给定目录中搜索
         */
        modules: [path.resolve(root, "src"), "node_modules"],
        extensions: [".vue", ".ts", ".js", ".json"],
        alias: {
            "@": path.join(root, "src"),
        },
    },
    module: {
        /**
         * @优化编译速度 配置 module.noParse 对完全不需要解析的库进行忽略
         * 忽略的文件中 不应该含有 import, require, define 的调用，或任何其他导入机制。
         * 忽略大型的 library 可以提高构建性能。
         */
        noParse: /jquery/,
        rules: [
            /**
             * @优化编译速度 尝试 thread-loader 支持 Loader 多线程
             * @优化编译速度 尝试 babel-loader 替换 ts-loader
             * @优化编译速度 尝试 esbuild-loader 替换 babel-loader
             * @优化编译速度 使用 swc-loader 替换 esbuild-loader
             * @优化编译速度 使用 module.rule exclude/include  缩小 Loader 解析范围
             */
            {
                test: /\.vue$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                use: [
                    // "thread-loader",
                    "vue-loader",
                ],
            },
            {
                test: /\.ts$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                use: [
                    // "thread-loader",
                    {
                        loader: "swc-loader",
                        options: {
                            jsc: {
                                parser: {
                                    syntax: "typescript",
                                },
                            },
                        },
                    },
                ],
            },
            // 自定义 Loader，处理 "*.esm" 后缀名的文件, 将其转化为 js。
            {
                test: /\.esm$/,
                include: [path.resolve(root, "src")],
                // exclude: [/node_modules/],
                use: [
                    {
                        loader: path.resolve(root, "ts-loader/esm-loader.ts"),
                    },
                ],
            },
            {
                test: /\.art$/,
                // include: [path.resolve(root, "src")],
                // exclude: [/node_modules/],
                use: [
                    // "thread-loader",
                    "art-template-loader",
                ],
            },
            // 图片文件
            {
                test: /.(png|jpg|jpeg|gif|svg)$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        // maxSize: 10 * 1024, // 小于 1kb 转 base64 位
                        maxSize: 0,
                    },
                },
                generator: {
                    filename: "static/images/[name].[contenthash][ext]", // 文件输出目录和命名
                },
            },
            // 字体图标文件
            {
                test: /.(woff2?|eot|ttf|otf)$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        // maxSize: 10 * 1024, // 小于 10kb 转 base64 位
                        maxSize: 0,
                    },
                },
                generator: {
                    filename: "static/fonts/[name].[contenthash][ext]", // 文件输出目录和命名
                },
            },
            // 媒体文件
            {
                test: /.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
                include: [path.resolve(root, "src")],
                // exclude: [],
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        // maxSize: 10 * 1024, // 小于 10kb 转 base64 位
                        maxSize: 0,
                    },
                },
                generator: {
                    filename: "static/media/[name].[contenthash][ext]", // 文件输出目录和命名
                },
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            /**
             * @优化产物大小 使用 HtmlWebpackPlugin minify 压缩 html 文件
             */
            title: "测试项目",
            minify: true,
            template: path.resolve(root, "public/index.art"),
            favicon: path.resolve(root, "public/favicon.ico"),
            inject: true,
            externals: externalList,
            // defer 文档被解析后，但在触发 DOMContentLoaded 事件之前执行的。阻塞 DOMContentLoaded 事件触发.
            // module 此值导致代码被视为 JavaScript 模块。其中的代码内容会延后处理,模块代码需要使用 CORS 协议来跨源获取。
            scriptLoading: "module",
        }),
        new webpack.DefinePlugin({
            // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            // "process.env.NODE_ENV": JSON.stringify("development"),
            // "process.env.NODE_ENV": JSON.stringify("production"),
            /**
             * @优化产物大小 配置 Vue3 环境变量支持 TreeShaking
             *
             * __VUE_OPTIONS_API__ (enable/disable Options API support, default: true)
             * __VUE_PROD_DEVTOOLS__ (enable/disable devtools support in production, default: false)
             * 当使用 esm-bundler 构建 Vue 项目时，
             * 配置全局注入这些编译时功能标志
             * 以便在 production 产物中更好地进行 TreeShaking 。
             */
            __VUE_OPTIONS_API__: JSON.stringify(false),
            __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        }),
    ],
    optimization: {
        // nodeEnv: "production",
        moduleIds: "size", // 模块 id 时需要使用哪种算法
        runtimeChunk: "single", // 设置多入口使用一个 runtimeChunk
    },
    stats: {
        assetsSort: "size",
        entrypoints: false,
        modules: false,
    },
};

export default config;
