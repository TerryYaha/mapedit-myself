<template>
  <div>
    <div class="attr-area">
      <ul class="attr-list">
        <li v-for="(item, i) in attrList" :key="i">
          <div
            ref="trigger"
            :class="['attr-item',item.isDisabled?'disabled':'abled']"
            :data-disabled="item.isDisabled"
            @click="handleClick(item)"
          >
            <svg-icon
              class="attr-img"
              :iconClass="index == i ? item.img : `${item.img}1`"
            ></svg-icon>

          </div>
          <span>{{ item.attrName }}</span>
        </li>
      </ul>
    </div>
    <Warn
      class="warn-box"
      toolTipContent="点击查看帮助指南"
      content="一个物件只能添加一个可交互属性哦"
    />
  </div>
</template>

<script>
import EventListener from "@/utils/EventListener.js";
import Warn from "../Warn/Warn.vue";
import {
  INTERACTIVE_TYPE,
  INTERACTIVE_TYPE_LABEL,
  INTERACTIVE_TYPE_SVG,
} from "@/components/MapEditor/const.js";

export default {
  props: {
    addInteract: Function,
  },
  components: {
    Warn,
  },
  data() {
    return {
      index: -1,
      attrList: [
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.LOCAL_FILE],
          attrValue: INTERACTIVE_TYPE.LOCAL_FILE,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.LOCAL_FILE],
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.LOCAL_PICTURE],
          attrValue: INTERACTIVE_TYPE.LOCAL_PICTURE,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.LOCAL_PICTURE],
          // isDisabled: true,
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.VIDEO],
          attrValue: INTERACTIVE_TYPE.VIDEO,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.VIDEO],
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.LOCAL_MUSIC],
          attrValue: INTERACTIVE_TYPE.LOCAL_MUSIC,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.LOCAL_MUSIC],
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.LIVE],
          attrValue: INTERACTIVE_TYPE.LIVE,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.LIVE],
          // isDisabled: true,
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.STICKY_NOTE],
          attrValue: INTERACTIVE_TYPE.STICKY_NOTE,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.STICKY_NOTE],
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.WHITE_BOARD],
          attrValue: INTERACTIVE_TYPE.WHITE_BOARD,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.WHITE_BOARD],
        },
        {
          img: INTERACTIVE_TYPE_SVG[INTERACTIVE_TYPE.HYPER_LINK],
          attrValue: INTERACTIVE_TYPE.HYPER_LINK,
          attrName: INTERACTIVE_TYPE_LABEL[INTERACTIVE_TYPE.HYPER_LINK],
        },
      ],
    };
  },
  mounted() {
    this.$nextTick(() => {
      const triger = this.$refs.trigger;
      for (let i = 0; i < triger.length; i++) {
        let isDisabled = triger[i].dataset.disabled;
        if (!isDisabled) {
          this._mouseenterEvent = EventListener.listen(
            triger[i],
            "mouseenter",
            () => {
              this.index = i;
            }
          );
          this._mouseleaveEvent = EventListener.listen(
            triger[i],
            "mouseleave",
            () => {
              this.index = -1;
            }
          );
          this._clickEvent = EventListener.listen(triger[i], "click", () => {
            this.index = i;
          });
        }
      }
    });
  },
  beforeDestroy() {
    if (this._mouseenterEvent) {
      this._mouseenterEvent.remove();
      this._mouseleaveEvent.remove();
    }
    if (this._clickEvent) this._clickEvent.remove();
  },
  methods: {
    handleClick(item) {
      if (item.isDisabled) return;
      this.addInteract(item.attrValue);
    },
  },
};
</script>

<style lang="scss" scoped>
.attr-area {
  margin-top: 16px;
  background: #f5f5f5;
  padding: 0 8px;
  border-radius: 4px;
  .attr-list {
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
    text-align: center;
    .attr-item {
      width: 52px;
      height: 52px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      margin-top: 12px;
      /* bg mid grey */

      border: 1px solid #e0e0e0;
      box-sizing: border-box;
      border-radius: 4px;
      .attr-img {
        width: 24px;
        height: 32px;
      }
    }
    span {
      /* Headline 5 - Regular */
      font-family: "Noto Sans SC";
      font-style: normal;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      color: #282c4a;
    }
  }
}
.attr-list:after {
  content: "";
  width: 30%;
  border: 1px solid transparent;
}
.disabled {
  cursor: not-allowed;
}
.abled:hover{
  border: 2px solid #8f7ef4 !important;
}
.warn-box {
  margin-top: 16px;
}
</style>