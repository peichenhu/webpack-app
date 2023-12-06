import { join } from "lodash-es";
import { getDate } from "./utils";
import "./test-tree-shaking-file";
import "./test-1.esm"

function component() {
    // 创建元素
    const datetime = getDate();
    const text = join(["测试", "TreeShaking", datetime], "--");
    const comment = document.createComment(text);
    // 返回元素
    return comment;
}

document.body.appendChild(component());
