// webpack.analyzer.js
import productionConfig from "./webpack.production";
import { merge } from "webpack-merge";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"; // 引入分析打包结果插件
import { TimeAnalyticsPlugin } from "time-analytics-webpack-plugin";
import { root } from "./webpack.base";
import path from "path";
/**
 * @优化指标分析 使用 BundleAnalyzerPlugin 分析构建产物
 * @优化指标分析 使用 TimeAnalyticsPlugin 分析编译时间
 * 
 * onlyReport 是否仅生成分析报告
 */

export default function (onlyReport = false) {
    const time = Date.now();
    const statsFile = path.resolve(root, `log/analyzer.${time}.stats.json`);
    const speedFile = path.resolve(root, `log/analyzer.${time}.speed.log`);
    const config = merge(productionConfig, {
        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: onlyReport ? "disabled" : "server",
                generateStatsFile: onlyReport,
                statsFilename: statsFile,
                statsOptions: {
                    assetsSort: "size",
                    entrypoints: false,
                    modules: false,
                },
            }), // 配置分析打包结果插件
        ],
    });

    // https://www.npmjs.com/package/time-analytics-webpack-plugin
    return TimeAnalyticsPlugin.wrap(config, {
        /* options */
        outputFile: onlyReport ? speedFile : undefined,
        loader: {
            groupedByAbsolutePath: false,
        },
    });
}
