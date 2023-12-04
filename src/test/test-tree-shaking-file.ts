// 测试类型：无用 ESM 模块代码 TreeShaking
// 测试结果：总是会被删除
export function TestTreeShakingFile() {
    console.log("测试 Tree Shaking 文件");
}

// 测试类型：无用代码 TreeShaking
// 测试结果：总是会被删除
// @ts-ignore
function TestTreeShakingFileNoModule() {
    console.log("测试 Tree Shaking 文件: TestTreeShakingFileNoModule");
}

// 测试类型：副作用代码 TreeShaking
// 测试结果：sideEffects=true 时不会被删除
// 测试结果：sideEffects=false 时会被删除
Object.defineProperty(Array.prototype, "sum", {
    value: function () {
        return this.reduce((sum: number, num: number) => (sum += num), 0);
    },
});

// 测试类型：副作用代码 TreeShaking
// 测试结果：sideEffects=true 时 setTitle 不会被删除（title 会被删除）
// 测试结果：sideEffects=false 时 setTitle 会被删除
const sideEffects = () => {
    const text = "副作用函数 ";
    document.body.setAttribute("test", text);
    return text;
};
// @ts-ignore
const res = sideEffects();
