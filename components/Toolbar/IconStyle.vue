<template>
  <div class="icon-box" :class="action">
     <IconFont class="iconfont" :type="iconType" />
    <span class="back-text">{{content}}</span>
  </div>
</template>

<script>
import IconFont from "../iconFont"

export default {
  components:{
    IconFont,
  },
  props: {
    iconType: {
      type: String,
    },
    action: {
      type: String,
      default: "default",
    },
    // 工具栏返回
    content: {
      type: String,
    },
  },
};
</script>

<style scoped lang="scss">
.icon-box {
  cursor: pointer;
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: 4px;
  .iconfont {
    font-weight: 400;
    font-size: 24px;
  }
  .back-text {
    font-size: 14px;

    }

}
// 默认样式
.default {
}
// 鼠标悬浮（hover）样式

.icon-box:hover{
    background: #f5f5f5;
    border-radius: 4px;
}
.hover {
background: #f5f5f5;
border-radius: 4px;
}
// 鼠标点击样式
.icon-box:active{
    color: #8f7ef4;
    background: #f5f5f5;
    border-radius: 4px;
}
.active {
color: #8f7ef4;
background: #f5f5f5;
border-radius: 4px;
}
// 按钮失效效果
.disabled {
  color: #282c4a;
  cursor: not-allowed;
  opacity: 0.2;
}
.disabled:hover,
.disabled:disabled {
  color: #282c4a;
  background: none;
  border-radius: 0;
}
</style>