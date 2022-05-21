<template>
  <div
    v-if="visible"
    ref="wrapElem"
    class="menu-wrap"
    :style="{ left: newLeft + 'px', top: newTop + 'px' }"
  >
    <Menu ref="target" :options="options" :onSelect="onSelect" />
  </div>

  <div ref="boxElem" class="menu-box">
    <slot />
  </div> 
</template>

<script>
import { ref, watchEffect } from 'vue'
import { onClickOutside } from '@vueuse/core'
import Menu from './Menu.vue';

export default {
  components: {
    Menu,
  },
  props: {
    options: {
      type: Array,
      default: [],
    },
    visible: {
      type: Boolean,
      default: false,
    },
    left: {
      type: Number,
      default: 0,
    },
    top: {
      type: Number,
      default: 0,
    },
    onSelect: {
      type: Function,
    },
    onClose: {
      type: Function,
    },
  },
  setup(props) {
    const wrapElem = ref(null);
    const boxElem = ref(null);
    const target = ref(null);
    const newLeft = ref(0);
    const newTop = ref(0);

    onClickOutside(target, () => {
      props.onClose();
    });

    // 重新计算上下文菜单的位置，使得其总是显示在画布范围之内
    watchEffect(() => {
      newLeft.value = props.left;
      newTop.value = props.top;

      if (wrapElem.value == null || boxElem.value == null) return;

      const targetPosition = {
        left: props.left,
        top: props.top,
      };
      const width = wrapElem.value.clientWidth;
      const height = wrapElem.value.clientHeight;
      const {
        top: boxTop,
        bottom: boxBottom,
        left: boxLeft,
        right: boxRight,
      } = boxElem.value.getBoundingClientRect();

      if (height + targetPosition.top >= boxBottom) {
        const targetTop = targetPosition.top - height;
        if (targetTop > boxTop) {
          targetPosition.top = targetTop;
        }
      }

      if (width + targetPosition.left >= boxRight) {
        const targetLeft = targetPosition.left - width;
        if (targetLeft > boxLeft) {
          targetPosition.left = targetLeft;
        }
      }

      newLeft.value = targetPosition.left;
      newTop.value = targetPosition.top;
    });

    return {
      wrapElem,
      boxElem,
      target,
      newLeft, 
      newTop,
    };
  },
};
</script>

<style scoped>
.menu-wrap {
  position: fixed;
  /** TODO: 整理编辑中的所有z-index */
  z-index: 100;
  left: 0;
  top: 0;
}
.menu-box {
  width: 100%;
  height: 100%;
}
</style>
