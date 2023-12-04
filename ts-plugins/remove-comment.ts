import { createRequire } from "node:module";
import acorn from "acorn";
// const acorn = createRequire("acorn");
import * as astring from "astring";
import { RawSource } from "webpack-sources";
import { type WebpackPluginInstance, Compiler } from "webpack";
("webpack");

export class RemoveCommentsPlugin implements WebpackPluginInstance {
    apply(compiler: Compiler) {
        compiler.hooks.emit.tap("RemoveCommentsPlugin", (compilation) => {
            Object.keys(compilation.assets).forEach((name) => {
                if (name.endsWith(".js")) {
                    const asset = compilation.getAsset(name);
                    if (asset) {
                        const oldSource = asset.source.source() as string;
                        const ast = acorn.parse(oldSource, {
                            ecmaVersion: 2020,
                        });
                        const newSource = astring.generate(ast);
                        if (newSource) {
                            const rawSource = new RawSource(newSource) as any;
                            compilation.updateAsset(name, rawSource);
                        }
                    }
                }
            });
        });
    }
}
