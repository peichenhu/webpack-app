# 测试项目

## 项目文件结构

```bash
.
├── README.md # 项目介绍
├── babel.config.js # 未使用，仅测试
├── node_modules # 项目依赖
├── package.json # 项目配置
├── pnpm-lock.yaml # 项目依赖配置
├── dist # 构建产物
├── log  # 构建分析报告
│   ├── analyzer.1701677078979.speed.log
│   └── analyzer.1701677078979.stats.json
├── public # 静态文件目录
│   ├── favicon.ico
│   └── index.art
├── src # 项目业务文件目录
│   ├── App.vue
│   ├── assets
│   │   ├── style.css
│   │   └── vue.svg
│   ├── components
│   │   └── HelloWorld.vue
│   ├── main.ts
│   ├── shims-vue.d.ts
│   └── test
│       ├── index.ts
│       ├── test-tree-shaking-file.ts
│       └── utils.ts
├── ts-config # 项目构建脚本目录
│   ├── utils.ts
│   ├── webpack.analyzer.ts
│   ├── webpack.base.ts
│   ├── webpack.development.ts
│   ├── webpack.production.ts
│   └── webpack.report.ts
├── ts-plugins # 项目构建脚本的测试插件目录
│   ├── file-list.ts
│   └── remove-comment.ts
└── tsconfig.json # 项目 TS 配置文件
```

## Webpack 优化

```JS
/**
 * @优化指标分析 使用 BundleAnalyzerPlugin 分析构建产物
 * @优化指标分析 使用 TimeAnalyticsPlugin 分析编译时间
 */

/**
 * @优化页面加载 使用异步组件，拆分模块，避免页面初始化阻塞
 * 
 * webpackChunkName: "[chunkname]"  拆分模块
 * webpackPrefetch: true            预先获取
 * webpackPreload: true             预先加载
 */

/**
 * @优化编译速度_优化产物大小 配置 externals 外部扩展，减少构建文件
 * 
 * 在打包时忽略配置的模块，从而加快打包速度。
 * externals 中配置的模块会被 webpack 忽略。
 * 在 externals 配置中的 key 是依赖的模块名字，value 是全局暴露出来的模块
 */

/**
 * @优化编译速度 文件定向查找，定义 resolve.alias 文件后缀名，尽可能减少后缀尝试的可能性
 * @优化编译速度 文件定向查找，定义 resolve.extensions 文件别名，避免文件层级太深查找太慢
 * @优化编译速度 文件定向查找，定义 resolve.modules 模块查找目录，使用绝对路径，只在给定目录中搜索
 */

/**
 * @优化编译速度 配置 module.noParse 对完全不需要解析的库进行忽略
 * 
 * 忽略的文件中 不应该含有 import, require, define 的调用，或任何其他导入机制。
 * 忽略大型的 library 可以提高构建性能。
 */

/**
 * @优化编译速度 尝试 thread-loader 支持 Loader 多线程
 * @优化编译速度 尝试 babel-loader 替换 ts-loader
 * @优化编译速度 使用 esbuild-loader 替换 babel-loader
 * @优化编译速度 使用 module.rule 的 exclude/include  缩小 Loader 解析范围
 */

/**
 * @优化产物大小 使用 HtmlWebpackPlugin minify 压缩 html 文件
 */

/**
 * @优化产物大小 配置 Vue3 环境变量支持 TreeShaking
 *
 * __VUE_OPTIONS_API__ (enable/disable Options API support, default: true)
 * __VUE_PROD_DEVTOOLS__ (enable/disable devtools support in production, default: false)
 * 当使用 esm-bundler 构建 Vue 项目时，
 * 配置全局注入这些编译时功能标志
 * 以便在 production 产物中更好地进行 TreeShaking 。
 */

/**
 * @优化二次编译速度 配置 cache 持久化缓存
 * 
 * cache 会在开发 模式被设置成 type: 'memory' 而且在 生产 模式 中被禁用。
 */

/**
 * @优化产物大小 配置 optimization.sideEffects 和 TreeShaking，减小产物大小
 * 
 * 告知 webpack 去辨识 package.json 中的副作用标记或规则，
 * 以跳过那些当导出不被使用且被标记不包含副作用的模块。
 */

/**
 * @优化渲染速度 使用 splitChunks 分隔公共业务模块，优化编译速度
 * @优化渲染速度 使用 splitChunks 分隔 node_modules 中变动少的模块，优化编译速度
 */

/**
 * @优化产物大小 使用 CssMinimizerPlugin 压缩 css 产物 (比较耗时)
 * @优化产物大小 使用 TerserPlugin 自定义配置 优化压缩
 * @优化产物大小 尝试 EsbuildPlugin 优化压缩
 */

/**
 * @优化编译速度 使用 CssMinimizerPlugin parallel 多线程，优化压缩速度
 */

/**
 * @优化编译速度 使用 SWC 优化压缩速度
 * @优化编译速度 使用 TerserPlugin parallel 多线程 优化压缩速度
 */

/**
 * @优化渲染速度_优化产物大小 使用 CompressionPlugin 构建 Gzip 格式静态文件
 * @优化渲染速度 使用 MiniCssExtractPlugin 拆分 css，修正页面资源加载顺序，提升页面渲染速度
 */
```

## webpack 构建流程

1. `setup` 参数合并：将通过 CLI 或者 Node API 传递的所有选项合并
2. `setup context` 创建执行上下文环境
3. `setup compile` 执行 Compiler 模块，使用 Compilation 模块创建 compilation 实例对象
    - `Compiler:`
    - Compiler 模块是 webpack 的主要引擎，它通过参数创建出一个 compilation 实例。
    - Compiler 模块扩展（extends）自 Tapable 类，提供了生命周期钩子，用来`注册和调用插件`。
    - 大多数面向用户的插件会首先在 Compiler 上注册。
    - `Compilation:`
    - Compilation 模块会被 Compiler 用来创建新的 compilation 对象（或新的 build 对象）。
    - compilation 实例能够访问所有的模块和它们的依赖（大部分是循环依赖）。
    - 它会对应用程序的依赖图中所有模块，进行字面上的编译(literal compilation)。
    - 在编译阶段，模块会被`加载(load)`、`封存(seal)`、`优化(optimize)`、`分块(chunk)`、`哈希(hash)`和`重新创建(restore)`。
    - Compilation 模块扩展(extend)自 Tapable 类，提供了生命周期钩子。
4. `setup compilation` 注册插件
5. `building`: 从 Entry 入口发出，针对每个 Module 串行调用对应的 Loader 去翻译 Module 内容。
6. `building finish`: 构建模块完成
7. `sealing finish module graph`：构建模块之间的依赖图
8. `sealing optimization`: 封装优化，每个模块通过生命周期钩子和插件都会被
    - `加载(load)`、
    - `封存(seal)`、
    - `优化(optimize)`、
    - `分块(chunk)`、
    - `哈希(hash)`和
    - `重新创建(restore)`。
9. `emitting emit` 把各个 chunk 输出到结果文件
10. `done plugins` 结束标识
11. `cache store` 缓存处理
