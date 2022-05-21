<template>
  <div @mouseenter="showList" @mouseleave="closeList">
    <div class="list" ref="list" style="display: none">
      <el-tooltip
        effect="dark"
        content="联系我们"
        placement="left-start"
        transition="none"
      >
        <button @click="openQR">
          <IconFont class="icon" type="icon16px-message" />
        </button>
      </el-tooltip>
      <el-tooltip
        effect="dark"
        content="帮助指南"
        placement="left-start"
        transition="none"
      >
        <button @click="openUrl">
          <IconFont class="icon" type="icon16px-helpdcmt" />
        </button>
      </el-tooltip>
    </div>
    <button @click="changeList">
      <IconFont class="icon" type="icon16px-help" v-show="closedState" />
      <IconFont class="icon" type="icon16px-close" v-show="!closedState" />
    </button>
  </div>
  <el-dialog
    v-model="dialogTableVisible"
    title="扫码添加产品经理微信"
    append-to-body
    custom-class="dialog"
  >
    <IconFont class="dialog-icon" type="icon16px-close" @click="closeQR" />
    <img
      class="helpCenter-QRcode"
      src="../../../../../../static/spencerQRcode.png"
    />
  </el-dialog>
</template>

<script>
import IconFont from "../../iconFont";
export default {
  data() {
    return {
      closedState: true,
      dialogTableVisible: false,
    };
  },
  components: {
    IconFont,
  },
  methods: {
    showList() {
      this.$refs.list.style = "display:flex";
      this.closedState = false;
    },
    closeList() {
      this.$refs.list.style = "display:none";
      this.closedState = true;
    },
    changeList() {
      if (this.$refs.list.clientWidth == 36) {
        this.closedState = true;
        this.$refs.list.style = "display:none";
      } else {
        this.closedState = false;
        this.$refs.list.style = "display:flex";
      }
    },
    openQR() {
      this.dialogTableVisible = true;
    },
    closeQR() {
      this.dialogTableVisible = false;
    },
    openUrl() {
      window.open(
        "https://www.wolai.com/vland/2TT7damvrzLWtyg6hKNpsu",
        "_blank"
      );
    },
  },
  computed: {
    listWidth() {
      return this.$refs.list.clientWidth;
    },
  },
};
</script>

<style lang="scss" scoped>
.list {
  display: flex;
  flex-direction: column;
}
button {
  margin-top: 8px;
  border-radius: 100%;
  height: 36px;
  width: 36px;
  background: #ffffff;
  mix-blend-mode: normal;
  /* bg mid grey */
  border: 1px solid #e0e0e0;
  /* shadow low */
  box-shadow: 2px 0px 6px rgba(0, 0, 0, 0.04);
  color: #282c4a;
}
button:hover {
  color: #8f7ef4;
}
.icon {
  font-size: 16px;
  color: inherit;
}
</style>
<style lang="scss">
.el-overlay {
  background-color: rgba(40,44,74, 0.3);
  .dialog {
    //styleName: Headline 4 - Regular;
    --el-dialog-width: 240px;
    --el-dialog-margin-top: 314px;
    --el-dialog-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    --el-dialog-title-font-size: 14px;
    --el-dialog-content-font-size: 14px;
    --el-dialog-font-line-height: 22px;
    //
    height: 272px;
    background: var(--el-dialog-background-color);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
    margin-right: auto;
    margin-left: auto;
    position: relative;
    width: var(--el-dialog-width, 50%);
    //字体
    font-family: Noto Sans SC;
    font-weight: 400;
    letter-spacing: 0em;
    text-align: center;
    .dialog-icon {
      position: absolute;
      right: 21px;
      top: 21px;
      font-size: 10px;
      :hover {
        color: #8f7ef4;
      }
    }
    .el-dialog__body {
      padding: 0px;
    }
    .el-dialog__header {
      padding: 32px 40px 0px 40px;
    }
    .el-dialog__headerbtn {
      display: none;
    }
    .el-dialog__title {
      //styleName: Headline 4 - Regular;
      font-family: Noto Sans SC;
      font-size: 14px;
      line-height: 22px;
      color: #282c4a99;
      //styleName: Headline 4 - Regular;
      font-weight: 400;
      letter-spacing: 0em;
      text-align: center;
    }
  }
}
.helpCenter-QRcode {
  width: 160px;
  height: 160px;
  margin: 18px 40px 40px;
}
</style>






