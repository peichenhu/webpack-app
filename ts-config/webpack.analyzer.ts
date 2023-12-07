// webpack.analyzer.js
import productionConfig from "./webpack.production";
import { merge } from "webpack-merge";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer"; // 引入分析打包结果插件
import { TimeAnalyticsPlugin } from "time-analytics-webpack-plugin";
import { root } from "./webpack.base";
import path from "path";
import * as webpack from "webpack";
/**
 * @优化指标分析 使用 BundleAnalyzerPlugin 分析构建产物
 * @优化指标分析 使用 TimeAnalyticsPlugin 分析编译时间
 *
 * onlyReport 是否仅生成分析报告
 */

export default function (params = false) {
    const onlyReport = params === true;
    const time = Date.now();
    const statsFile = path.resolve(root, `log/analyzer.${time}.stats.json`);
    const speedFile = path.resolve(root, `log/analyzer.${time}.speed.log`);
    let lastProgress: string;
    const config = merge(productionConfig, {
        plugins: [
            // 配置分析打包结果插件
            new BundleAnalyzerPlugin({
                analyzerMode: onlyReport ? "disabled" : "server",
                generateStatsFile: onlyReport,
                statsFilename: statsFile,
                statsOptions: {
                    assetsSort: "size",
                    entrypoints: false,
                    modules: false,
                },
            }), 
            new webpack.ProgressPlugin((percentage, message, ...args) => {
                let percent = (percentage * 100).toFixed(0);
                let join = [
                    percent.padEnd(3, `_`),
                    message.padEnd(10, `_`),
                    ...args,
                ].join(`___`);
                let reg = /\.\.\/node_modules\/*.+\/(.+-(plugin|loader)).+/;
                let [match, g1] = join.match(reg) || [];
                if (match) {
                    join = join.replace(match, g1);
                }
                // if (lastProgress !== join) console.info(join);
                lastProgress = join;
            }),
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
