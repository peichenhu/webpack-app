<script setup lang="ts">
// import HelloWorld from "./components/HelloWorld.vue";
import { defineAsyncComponent } from "vue";
const HelloWorld = defineAsyncComponent(() => {
    /**
     * @优化页面加载 使用异步组件，拆分模块，避免页面初始化阻塞
     * webpackChunkName: "[chunkname]"  拆分模块
     * webpackPrefetch: true            预先获取
     * webpackPreload: true             预先加载
     */
    return import(
        /* webpackChunkName: "helloWorld" */ "./components/HelloWorld.vue"
    );
});
</script>

<template>
    <div>
        <a href="https://vuejs.org/" target="_blank">
            <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>
    </div>
    <HelloWorld msg="Webpack + Vue" />
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}
.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
