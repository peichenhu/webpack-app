import * as swc from "@swc/core";
import { LoaderContext } from "webpack";

function loader(this: LoaderContext<swc.Options>, source: string) {
    const callback = this.async();
    const swcOptions: swc.Options = {
        jsc: {
            parser: {
                syntax: "ecmascript",
            },
            target: "es2020",
            preserveAllComments: true,
            minify: undefined,
        },
        isModule: true,
    };
    const pm = swc.transform(source, swcOptions);
    pm.then((output: swc.Output) => {
        callback(null, output.code, output.map); // 考虑同步 return output.code;
    }).catch((err) => {
        callback(err);
    });
}

export default loader;
