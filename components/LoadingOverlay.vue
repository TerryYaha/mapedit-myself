<template>
  <Overlay>
    <div class="content">
      <!-- <EditorLoading /> -->
      <svg-icon iconClass="editor-loading-animated"></svg-icon>
      <span class="content__text">加载中...</span>
    </div>
  </Overlay>
</template>

<script>
// import EditorLoading from '../../../../static/editor-loading-animated.svg';
import Overlay from './base/overlay/overlay.vue';

export default {
  components: {
    // EditorLoading,
    Overlay,
  },
};
</script>

<style scoped>
.content {
  width: 72px;
  height: 84px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.content__text {
  height: 20px;
  font-size: 14px;
  line-height: 22px;
  text-align: center;
  color: #FFFFFF;
}
</style>
