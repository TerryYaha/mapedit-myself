<template>
  <div class="attr">
    <div class="svg-box">
      <svg-icon class="icon" :iconClass="attrSvg"></svg-icon>
    </div>
    <span class="text">{{ attrName }}</span>
    <div class="delete-box" @click="deleteAct()">
      <el-tooltip
        class="box-item"
        effect="dark"
        content="删除该属性"
        placement="top"
      >
        <IconFont type="icon-delete3" />
      </el-tooltip>
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";

export default {
  components: {
    IconFont,
  },
  props: {
    attrSvg: String,
    attrName: {
      type: String,
      default: "属性名",
    },
    deleteAct: Function,
  },
};
</script>

<style lang="scss" scoped>
.attr {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 192px;
  height: 64px;
  border-radius: 5px 5px 5px 5px;
  background: rgb(245, 245, 245);
  .svg-box {
    width: 40px;
    height: 40px;
    background: #fff;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    .icon {
      width: 18px;
      height: 24px;
    }
  }
  .text {
    position: relative;
    right: 15px;
    font-size: 14px;
    font-family: Noto Sans SC-Regular, Noto Sans SC;
    font-weight: 400;
    color: #282c4a;
    line-height: 22px;
    -webkit-background-clip: text;
  }
  .delete-box {
    cursor: pointer;
    border-radius: 50%;
    background: #fff;
    width: 24px;
    height: 24px;
    background: #ffffff;
    box-shadow: 0px 0px 6px 1px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }
}
</style>