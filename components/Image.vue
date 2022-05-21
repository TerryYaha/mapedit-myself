<template>
  <div class="p-6">
    <div class="mt-6">
      <p class="title">{{ image.name }}</p>
      <div class="preview">
        <img :src="image.imageURL" alt="" />
      </div>
    </div>
    <div class="optionBox">
      <p class="title">设置基本属性</p>
      <div class="option">
        <span>遮挡人物</span>
        <el-checkbox
          style="display: inline"
          :modelValue="image.isMaskPlayer"
          @change="handleIsMaskPlayerChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: Object,
    },
    updateImage: {
      type: Function,
    },
  },
  methods: {
    handleIsMaskPlayerChange(isMaskPlayer) {
      this.updateImage(this.image.id, { isMaskPlayer });
    },
    handleIsBackgroundImageChange(isBackgroundImage) {
      this.updateImage(this.image.id, { isBackgroundImage });
    },
  },
};
</script>
<style lang = "scss" scoped>
* {
  padding: 0px;
  margin: 0px;
}
.p-6 {
  font-family: Noto Sans SC;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: left;
  .title {
    font-family: Noto Sans SC;
    font-size: 14px;
    font-style: normal;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: 0em;
    text-align: left;
    margin: 24px 24px 15px 24px;
  }
  .mt-6 {
    border-bottom: 1px solid #f5f5f5;
    .preview {
      width: 128px;
      height: 128px;
      background: #f6f6f6;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0px 56px 24px 56px;
      img {
        max-height: 104px;
        max-width: 104px;
      }
    }
  }
  .optionBox {
    border-bottom: 1px solid #f5f5f5;
    .option {
      display: flex;
      justify-content: space-between;
      margin: 0 24px;
    }
    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      border-color: #8f7ef4;
      background-color: #8f7ef4;
    }
    :deep(.el-checkbox__inner) {
      border: 2px solid #e0e0e0;
      box-sizing: border-box;
      border-radius: 4px;
    }
    :deep(.el-icon-arrow-down:before) {
      content: none;
    }
    :deep(.el-icon-close:before) {
      content: none;
    }
    .el-checkbox {
      --el-checkbox-input-height: 16px;
      --el-checkbox-input-width: 16px;
      --el-checkbox-border-radius: 3px;
      --el-checkbox-input-border-color-hover: #e0e0e0;
      top: 2px;
    }
  }
}
</style>