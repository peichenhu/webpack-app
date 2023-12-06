import fs from "fs";
import path from "path";
import { log } from "console";
import { LoaderContext } from "webpack";
import { transform, type TransformOptions } from "@babel/core";
import traverse from "@babel/traverse";
import * as t from "@babel/types";
// import { parse } from "@babel/parser";
import generator from "@babel/generator";
// import * as loaderUtils from 'loader-utils';
// import * as schemaUtils from "schema-utils";
// import type { Schema } from "schema-utils/declarations/validate";

const transformOptions: TransformOptions = {
    parserOpts: {
        sourceType: "module",
        plugins: [],
    },
    code: true,
    sourceMaps: true,
    ast: true,
};

// 缓存优化
const depCache = new Set();

export type Context = LoaderContext<TransformOptions>;

export default function (this: Context, source: string) {
    depCache.clear();
    // Loader 如果 "循环依赖" 和 "异步依赖" 怎么处理？

    const options = this.getOptions();
    const callback = this.async(); // 异步回调钩子

    Object.assign(transformOptions, options);

    /**
     * 模块依赖处理: 把 import 转化成 require 语句
     */
    transform(source, transformOptions, (err, result) => {
        const { code, map, ast, metadata } = result || {};
        log("metadata", metadata);
        if (code && map && ast) {
            /**
             * @注意
             * webpack 默认支持 JS 和 JSON 两种语言处理
             * - 如果是 文件，需要使用 emitFile 产生一个文件
             * - 如果是 JS，需要转换成 CommonJS (require 模式)，
             *   最后使用 SyncLoader/AsyncLoader/RawLoader/PitchLoader 其中一种方式返回资源。
             * - 返回的 CommonJS 模块，内部的 require 依赖资源 webpack 会自动处理（不需要手动）。
             */

            /**
             * @注意
             * 因为此处的 code 已是 CommonJS 模块形式，
             * 所以不再需要自定义处理 AST（也可以在此处使用 traverse 遍历 AST 做更多操作），
             * 直接返回编译好的资源即可。
             */

            /**
             * 处理依赖，使用 traverse 遍历 AST 语法树
             * handleDependency(ast, this);
             */

            /**
             * 如果修改了 AST 语法树，则需要使用新 AST 语法树生成新 SourceCode 资源。
             * const { code } = generator(ast, {}, source);
             */

            /**
             * 使用 新AST 和 新 Source 生成 参考文件
             * const basename = path.basename(this.resourcePath);
             * this.emitFile(`esm/${basename}.json`, JSON.stringify(ast));
             * this.emitFile(`esm/${basename}.esm`, code);
             */

            // 处理完成，执行异步回调函数
            callback(null, code, map); // 考虑同步 return output.code;
        }
    });
}

/**
 * 模块依赖(module dependencies) 的两种处理方式：
 *      1. 通过把它们转化成 require 语句。
 *      2. 使用 this.resolve 函数解析路径。
 */
export function resolveDependency(ast: any, context: LoaderContext<any>) {
    traverse(ast, {
        ImportDeclaration: (astPath) => {
            const dirnamePath = path.dirname(context.resourcePath);
            const request = astPath.node.source.value;
            context.resolve(dirnamePath, request, (err, result) => {
                /**
                 * 像 require 表达式一样解析一个 request。
                 *      - context 必须是一个目录的绝对路径。此目录用作解析的起始位置。
                 *      - request 是要被解析的 request。通常情况下，
                 *        像 ./relative 的相对请求或者像 module/path 的模块请求会被使用，
                 *        但是像 /some/path 也有可能被当做 request。
                 *      - callback 是一个给出解析路径的 Node.js 风格的回调函数。
                 * 解析操作的所有依赖项都会自动作为依赖项添加到当前模块中
                 */

                if (err) context.emitError(err);
                if (result) {
                    // 自定义操作：依赖入口做处理
                    // changeImport(astPath);
                }
            });
        },
    });
}

/**
 * loader 依赖(loader dependencies) 的处理方式：
 *      - 声明 this.addDependency(loaderUtils.urlToRequest(url));
 *      - 返回 callback(null, source + '\n' + depSource);
 */
export function addDependency(ast: any, context: LoaderContext<any>) {
    var callback = this.async();
    traverse(ast, {
        ImportDeclaration: (astPath) => {
            const depAbsolutePath = path.resolve(
                path.dirname(context.resourcePath), // 当前文件所在目录的绝对路径
                astPath.node.source.value // 依赖文件相对当前文件的路径
            );

            this.addDependency(depAbsolutePath);

            // 自定义操作：依赖入口做处理
            // changeImport(astPath);

            // 依赖入口做处理后，生成 newSource
            const { code: newSource } = generator(ast, {});

            fs.readFile(depAbsolutePath, "utf-8", function (err, depSource) {
                if (err) return callback(err);
                callback(null, depSource + "\n" + newSource);
            });
        },
    });
}

// 重置依赖入口
export function changeImport(path: any) {
    const newIdentifier = path.node.specifiers[0].local.name;
    const newSource = path.node.source.value;
    const newRequire = t.variableDeclaration("const", [
        t.variableDeclarator(
            t.identifier(newIdentifier),
            t.callExpression(t.identifier("require"), [
                t.stringLiteral(newSource),
            ])
        ),
    ]);
    // 新入口替换旧入口
    path.replaceWith(newRequire);
}
