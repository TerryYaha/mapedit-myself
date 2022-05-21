<template>
  <div class="load-more" v-show="isShow">
    <div class="loading" v-show="isLoading">
      <loading class="load-icon"></loading>
      <span class="text">加载中...</span>
    </div>
    <div class="has-load loading" v-show="!isLoading">
      <IconFont type="icon-done" class="load-icon done" />
      <span class="text">素材已加载完毕</span>
    </div>
  </div>
</template>

<script>
import Loading from "../../Toolbar/SavingLoading.vue";
import IconFont from "../../iconFont";

export default {
  components: {
    Loading,
    IconFont,
  },
  props: {
    isLoading: {
      type: Boolean,
    },
    isShow: {
      type: Boolean,
    },
  },
};
</script>

<style lang="scss" scoped>
.load-more {
  height: 86px;
  position: relative;
  text-align: center;
  left: 0;
  right: 0;
  margin: auto;

  .loading {
    width: 100px;
    height: 80px;
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-content: center;
    justify-content: space-around;
    .load-icon {
      margin: 0 auto;
    }
  }
  .text {
    font-size: 12px;
    font-weight: 400;
    color: #b6b6b6;
    margin-bottom: 10px;
  }
}
.done {
  font-size: 24px;
  color: #b6b6b6;
}
</style>