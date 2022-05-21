<template>
  <div class="toast-box">
    <IconFont class="toast-icon" v-if="type === 'icon-Check'" />
    <IconFont class="toast-icon" v-if="type === 'icon-Alert'" />
    <IconFont class="toast-icon" v-if="type === 'icon-Alert2'" />
    <IconFont class="toast-icon" v-if="type === 'loading'" />
    <p class="toast-value" :style="{ background: background, color: color }">
      {{ message }}
    </p>
    <div class="iconfont toast-close" v-if="showClose">&#xe678;</div>
  </div>
</template>    
<script lang="ts">
import { defineComponent } from "vue";
import Toast from "./toast";
import IconFont from "../../iconFont";

export default defineComponent({
  name: "Toast",
  component: { IconFont },
  props: {
    //内容
    message: {
      type: String,
      default: "",
    },
    //持续时间
    duration: {
      type: Number,
      default: 3000,
    },
    //背景色
    background: {
      type: String,
      default: "#fff",
    },
    //字体颜色
    color: {
      type: String,
      default: "rgba(40, 44, 74, 0.6)",
    },
    //icon类型，可选值：info（默认）、error（提醒）、fail（警告）、sucess（成功）、loading（加载中）
    type: {
      type: String,
      default: "info",
    },
    //是否显示关闭按钮
    showClose: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {};
  },
  methods: {},
});
</script>

<style>
@-webkit-keyframes rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}
@keyframes rotate {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  to {
    -webkit-transform: rotate(1turn);
    transform: rotate(1turn);
  }
}

.toast-box {
  position: fixed;
  min-height: 48px;
  padding: 13px 16px 13px 18px;
  top: 80px;
  left: 50%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0px 8px 10px -5px rgba(0, 0, 0, 0.08),
    0px 0px 30px 5px rgba(0, 0, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
}
.toast-icon {
  position: relative;
  height: 22px;
  width: 24px;
}
.toast-close {
  font-size: 16px;
  margin-left: 24px;
}
.toast-loading {
  position: relative;
  box-sizing: border-box;
  width: 20px;
  max-width: 100%;
  max-height: 100%;
  height: 20px;
  -webkit-animation: rotate 0.8s linear infinite;
  animation: rotate 0.8s linear infinite;
  border-radius: 100%;
  background-clip: padding-box, border-box;
  background-origin: padding-box, border-box;
  background-image: linear-gradient(135deg, #fff, #fff),
    linear-gradient(225deg, #8f7ef4 0%, rgba(255, 255, 255, 0) 100%);
  border: 3.5px solid transparent;
  border-bottom-color: #fff;
}
.toast-value {
  max-width: 312px;
  margin-left: 10px;
  font-size: 14px;
  font-weight: 400;
  border-radius: 4px;
  text-align: center;
  display: inline-block;
  animation: anim 0.5s;
}
@keyframes anim {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>