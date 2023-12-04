// babel.config.js
module.exports = {
    // 执行顺序由右往左, 所以先处理 ts, 再处理 jsx, 最后再试一下 babel 转换为低版本语法
    presets: [
        ["@babel/preset-env"],
        [
            "@babel/preset-typescript",
            {
                allExtensions: true, // 支持所有文件扩展名，很关键
                cacheDirectory: true,
            },
        ],
    ],
};
