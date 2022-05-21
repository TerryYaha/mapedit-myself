<template>
  <div
    ref="wrapper"
    class="w-full h-full overflow-hidden bg-white"
  >
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import _ from 'underscore';
import eventBus from '../eventBus';
import MapCanvas from '../mapCanvas';

export default {
  mounted() {
    this.wrapperElem = this.$refs.wrapper;
    eventBus.on('ui:initializeCanvas', this.initializeCanvas);
  },
  async beforeUnmount() {
    this.offResize();
    this.offCanvasResize();
    eventBus.off('ui:initializeCanvas');
    await new Promise((resolve, reject) => {
      if (this.canvas) {
        this.canvas.dispose();
        this.canvas = null;
        resolve('done');
      }
    });
  },
  methods: {
    initializeCanvas({ width, height }) {  
      const wrapperRect = this.wrapperElem.getBoundingClientRect();
      this.canvas = new MapCanvas({
        canvasElem: this.$refs.canvas,
        width,
        height,
        canvasWidth: wrapperRect.width,
        canvasHeight: wrapperRect.height,
      });
      this.canvas.initialize();
      this.onResize();
      this.onCanvasResize();
      // debug
      window.canvas = this.canvas;
    },
    onResize() {
      this.throttledResizeHandler = _.throttle(this.resizeHandler, 100);
      window.addEventListener('resize', this.throttledResizeHandler);
    },
    offResize() {
      if (this.throttledResizeHandler) {
        window.addEventListener('resize', this.throttledResizeHandler);
      }
    },
    onCanvasResize() {
      eventBus.on('ui:resizeCanvas', this.resizeCanvasHandler);
    },
    offCanvasResize() {
      eventBus.off('ui:resizeCanvas', this.resizeCanvasHandler);
    },
    resizeHandler() {
      const { width, height } = this.wrapperElem.getBoundingClientRect();
      this.canvas.setDimensions({ width, height });
    },
    resizeCanvasHandler({ deltaLeft }) {
      const { width, height } = this.wrapperElem.getBoundingClientRect();
      this.canvas.setDimensions({ width, height });
      // 保持地图相对于整个页面的位置不发生变化
      this.canvas.relativePan({ x: deltaLeft, y: 0 });
    },
  },
};
</script>
