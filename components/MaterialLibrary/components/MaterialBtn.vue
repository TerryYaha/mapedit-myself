<template>
    <div class="MaterialBtn">
        <div class="library-btn-open-body"></div>
        <div class="library-btn-close">
            <div class="library-btn-border-top"></div>
            <IconFont v-show="isCollapsed" type="icon16px-right" class="iconfont" @click="toggleCollapsed" />
            <IconFont v-show="!isCollapsed" type="icon16px-left" class="iconfont" @click="toggleCollapsed" />
            
            <div class="library-btn-border-bottom"></div>
        </div>
   </div>
</template>

<script>
import IconFont from "../../iconFont";

export default {
    components: {
        IconFont,
    },
    props: {
        // 素材列表是否收起
        isCollapsed: {
            type: Boolean,
            default: false,
        },
        toggleCollapsed: {
            type: Function,
        },
    },
}
</script>

<style lang="scss" scoped>
.MaterialBtn{
    position: relative;
    width: 8px;
    height: 100%;
}
.library-btn-close {
    position: absolute;
    z-index: 1;
    right: 0;
    top: 50%;
    transform: translate(100%,0);
    width: 16px;
    height: 40px;
    background: #FFFFFF;
    border-radius: 0px 4px 4px 0px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.iconfont {
    font-size: 16px;
    color: #282C4A;
    cursor: pointer;
}
.library-btn-open-body {
    width: 8px;
    height: 100%;
    background: #fff;
    z-index: 200;
}
.library-btn-border-top {
    position: absolute;
    top: 0;
    left: 0;
    background: #fff;
    width: 4px;
    height: 4px;
    transform: translate(0,-100%); 
    background: radial-gradient(8px at right top,transparent 50%,white 50%);
}
.library-btn-border-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    background: #fff;
    width: 4px;
    height: 4px;
    transform: translate(0,100%); 
    background: radial-gradient(8px at right bottom,transparent 50%,white 50%);
}
</style>