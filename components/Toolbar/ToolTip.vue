<template>
  <div>
    <span ref="trigger">
      <slot> </slot>
    </span>
    <div
      class="tooltip"
      v-bind:class="{
        top: placement === 'top',
        left: placement === 'left',
        right: placement === 'right',
        bottom: placement === 'bottom',
        disable: type === 'disable',
        delete: type === 'delete',
      }"
      ref="popover"
      role="tooltip"
      v-show="show"
    >
      <div class="tooltip-inner">
        <span v-html="content"></span>
      </div>
    </div>
  </div>
</template>

<script>
import EventListener from "@/utils/EventListener.js";

export default {
  props: {
    // 需要监听的事件
    trigger: {
      type: String,
      default: "click",
    },
    effect: {
      type: String,
      default: "fadein",
    },
    title: {
      type: String,
    },
    id: {
      type: Number,
    },
    // toolTip消息提示
    content: {
      type: String,
    },
    header: {
      type: Boolean,
      default: true,
    },
    placement: {
      type: String,
    },
  },
  data() {
    return {
      // 通过计算所得 气泡位置
      position: {
        top: 0,
        left: 0,
      },
      show: false,
    };
  },
  watch: {
    show: function (val) {
      if (val) {
        const popover = this.$refs.popover;
        const triger = this.$refs.trigger.children[0];
        // 通过placement计算出位子
        switch (this.placement) {
          case "top":
            this.position.left =
              triger.offsetLeft -
              popover.offsetWidth / 2 +
              triger.offsetWidth / 2;
            this.position.top = triger.offsetTop - popover.offsetHeight;
            break;
          case "left":
            this.position.left = triger.offsetLeft - popover.offsetWidth;
            this.position.top =
              triger.offsetTop +
              triger.offsetHeight / 2 -
              popover.offsetHeight / 2;
            break;
          case "right":
            this.position.left = triger.offsetLeft + triger.offsetWidth;
            this.position.top =
              triger.offsetTop +
              triger.offsetHeight / 2 -
              popover.offsetHeight / 2;
            break;
          case "bottom":
            this.position.left =
              this.id === 3
                ? triger.offsetLeft - triger.offsetWidth / 2
                : triger.offsetLeft - popover.offsetWidth / 2;
            this.position.top = triger.offsetTop + triger.offsetHeight + 14;
            // alert(triger.offsetLeft,popover.offsetWidth / 2,triger.offsetWidth / 2)
            break;
          default:
            console.log("Wrong placement prop");
        }
        popover.style.top = this.position.top + "px";
        popover.style.left = this.position.left + "px";
      }
    },
  },
  methods: {
    toggle() {
      this.show = !this.show;
    },
  },
  mounted() {
    if (!this.$refs.popover)
      return console.error(
        "Couldn't find popover ref in your component that uses popoverMixin."
      );
    // 获取监听对象
    const triger = this.$refs.trigger.children[0];
    console.log(triger);
    // 根据trigger监听特定事件
    if (this.trigger === "hover") {
      this._mouseenterEvent = EventListener.listen(triger, "mouseenter", () => {
        this.show = true;
      });
      this._mouseleaveEvent = EventListener.listen(triger, "mouseleave", () => {
        this.show = false;
      });
    } else if (this.trigger === "focus") {
      this._focusEvent = EventListener.listen(triger, "focus", () => {
        this.show = true;
      });
      this._blurEvent = EventListener.listen(triger, "blur", () => {
        this.show = false;
      });
    } else {
      this._clickEvent = EventListener.listen(triger, "click", this.toggle);
    }
    this.show = !this.show;
  },
  // 在组件销毁前移除监听，释放内存
  beforeDestroy() {
    if (this._blurEvent) {
      this._blurEvent.remove();
      this._focusEvent.remove();
    }
    if (this._mouseenterEvent) {
      this._mouseenterEvent.remove();
      this._mouseleaveEvent.remove();
    }
    if (this._clickEvent) this._clickEvent.remove();
  },
};
</script>
<style lang="scss" scoped>
.tooltip {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 5px;
  color: #fff;
  .tooltip-inner {
  }
  .tooltip-arrow {
  }
}

.bottom {
  position: absolute;
  width: fit-content;
  height: 24px;
  font-size: 10px;
  font-weight: 400;
  line-height: 16px;
  padding: 4px 8px;
  &::before {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    content: "";
    top: -14px;
    width: 0;
    height: 0;
    overflow: hidden;
    font-size: 0; /*是因为, 虽然宽高度为0, 但在IE6下会具有默认的 */
    line-height: 0; /* 字体大小和行高, 导致盒子呈现被撑开的长矩形 */
    border-width: 8px;
    border-style: solid dashed dashed dashed; /*IE6下, 设置余下三条边的border-style为dashed,即可达到透明的效果*/
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
}
.top {
  position: absolute;
  width: fit-content;
  height: 24px;
  font-size: 10px;
  font-weight: 400;
  line-height: 16px;
  padding: 4px 8px;
  &::before {
    position: absolute;
    left: 0;
    right: 0;
    margin: auto;
    content: "";
    top: -14px;
    width: 0;
    height: 0;
    overflow: hidden;
    font-size: 0; /*是因为, 虽然宽高度为0, 但在IE6下会具有默认的 */
    line-height: 0; /* 字体大小和行高, 导致盒子呈现被撑开的长矩形 */
    border-width: 8px;
    border-style: solid dashed dashed dashed; /*IE6下, 设置余下三条边的border-style为dashed,即可达到透明的效果*/
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
}
</style>