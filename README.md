# 测试项目

## 优化打包速度

1. 生产模式默认使用 Tree Shaking

    - 仅支持 `ESM` 模块的导入导出。
    - 需要自己在 `package.json` 配置 `sideEffects` 副作用代码文件，以免丢失必要代码。
    - 需要设置 `optimization.sideEffects=true`, 告知 `webpack` 去读取 `package.json` 中的 `sideEffects` 配置。

2. 多线程压缩
3. 使用 SWC 压缩

## 优化产物大小
