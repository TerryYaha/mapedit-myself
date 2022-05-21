<template>
  <img
    ref="image"
    v-bind="$attrs"
    @error="handleError"
    @load="handleLoad"
  />
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    // 重试次数
    times: {
      type: Number,
      default: 3,
    },
    // 重试间隔，单位毫秒
    interval: {
      type: Number,
      default: 1000,
    },
  },
  data() {
    return {
      remainingTimes: this.times,
    };
  },
  methods: {
    handleError() {
      if (this.remainingTimes === 0) return;

      this.timer = setTimeout(() => {
        this.$refs.image.src = this.$attrs.src + '?t=' + Date.now();
        this.remainingTimes -= 1;
      }, this.interval);
    },
    handleLoad() {
      clearTimeout(this.timer);
      this.remainingTimes = this.times;
    },
  },
};
</script>
