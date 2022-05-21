  <!--白板加载动画-->
<template>
  <div class="wb-loading">
    <div class="loading tip" v-show="loadStatus == 0">
      <span class="text">添加中...</span>
      <img
        class="loading-gif icon"
        style="width: 19px; height: 19px"
        src="@/assets/image/mapedit/loading2.gif"
      />
    </div>
    <div class="loaded tip" v-show="loadStatus == 1">
      <span class="text">添加成功</span>
      <IconFont class="icon" type="icon-success" />
    </div>
    <div class="loadfail tip" v-show="loadStatus == 2">
      <span class="text">添加失败</span>
      <IconFont class="icon" type="icon-fail" />
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";
export default {
  components: { IconFont },
  props: {
    // 0 加载中 1 加载成功 2加载失败
    loadStatus: {
      type: Number,
      default: -1,
    },
  },
};
</script>

<style lang="scss" scoped>
.wb-loading {
  width: 192px;
  .tip {
    display: flex;
    justify-content: space-between;
    line-height: 18px;
    .text {
      font-size: 12px;
      font-family: Noto Sans SC-Regular, Noto Sans SC;
      font-weight: 400;
      color: #b6b6b6;
      line-height: 20px;
      -webkit-background-clip: text;
    }
  }
}
.loadfail {
  .text {
    color: #e34d59 !important;
  }
}
</style>

