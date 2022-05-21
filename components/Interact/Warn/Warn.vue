<template>
  <div class="warn">
    <div v-if="toolTipContent" class="warn-light">
      <el-tooltip :content="toolTipContent" placement="left">
        <IconFont type="Question" class="Question" @click="openHelpLink" />
      </el-tooltip>
    </div>
    <div class="warn-content">
      <span :class="isWarn ? 'warning' : ''">{{ content }}</span>
      <span v-if="linkContent" :class="['link-content',isWarn ? 'warning' : '']" @click="openHelpLink">{{
        linkContent
      }}</span>
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";
import { INTERACTIVE_TYPE } from "@/components/MapEditor/const.js";
export default {
  components: {
    IconFont,
  },
  props: {
    // 文字提示
    content: String,
    // 提示内容
    toolTipContent: {
      type: String,
      default: "点击查看帮助指南",
    },
    // 是否需要红色提示
    isWarn: {
      type: Boolean,
      default: false,
    },
    // 带有链接的提示（查看全部支持类型）
    linkContent: String,
    linkType: {
      type: Number,
      default: INTERACTIVE_TYPE.DEFAULT,
    },
  },
  methods: {
    openHelpLink() {
      switch (this.linkType) {
        case INTERACTIVE_TYPE.LOCAL_FILE:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#qsa7WiKoVS8zvMF9aWrko5"
          );
          break;
        case INTERACTIVE_TYPE.VIDEO:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#cwmvj2jpLLK1AxZAmrmken"
          );
          break;
        case INTERACTIVE_TYPE.LOCAL_MUSIC:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#4iwtsRhisw2yaN7PVg5rh4"
          );
          break;
        case INTERACTIVE_TYPE.LOCAL_PICTURE:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#5kLWaQqWQrdQbvH8Lz511w"
          );
          break;
        case INTERACTIVE_TYPE.STICKY_NOTE:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#33JF1E95fj57pj7Q7SuYS6"
          );
          break;
        case INTERACTIVE_TYPE.WHITE_BOARD:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#22a4JoGxSYRNVSsKbbet1d"
          );
          break;
        case INTERACTIVE_TYPE.HYPER_LINK:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#tdGQRxBtPAQLMECfEmRAL6"
          );
          break;
        case INTERACTIVE_TYPE.LIVE:
          window.open(
            "https://www.wolai.com/kxZDxmQxjK2Rni25jvGC9r#qokYYNE74r1a6jA8P4bKMA"
          );
          break;
        default:
          window.open(
            "https://www.wolai.com/vland/kxZDxmQxjK2Rni25jvGC9r"
          );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.warn {
  width: 192px;
  display: flex;
  .warn-light {
    margin-top: 3px;
    padding-right: 4px;
    text-align: center;
    line-height: 0;
    .Question {
      color: #b6b6b6;
      font-size: 16px;
      cursor: pointer;
    }
  }
  .warn-content {
    line-height: 20px;
    span {
      font-size: 12px;
      font-family: Noto Sans SC-Regular, Noto Sans SC;
      font-weight: 300;
      color: #b6b6b6;
      -webkit-background-clip: text;
    }
    .warning {
      color: #e34d59;
    }
    .link-content {
      text-decoration: underline;
      cursor: pointer;
    }
  }
}
</style>