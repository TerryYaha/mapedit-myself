<template>
  <div class="p-6">
    <div class="mt-6">
      <span class="text-title">文字效果</span>
      <span style="font-weight: 400; font-size: 14px; line-height: 22px"
        >不透明度</span
      >
      <div class="text-slider">
        <div style="width: 139.54px; margin-right: 15px">
          <el-slider
            :modelValue="textOpacity"
            :show-tooltip="false"
            size="small"
            @input="handleOpacityChange"
          ></el-slider>
        </div>
        <span style="line-height: 30px">{{ opacityPercentage }}</span>
      </div>
    </div>
    <div class="mt-6">
      <span class="text-title">文字样式</span>
      <div class="mt-5">
        <div class="colorDetail">
          <el-color-picker
            :modelValue="text.color"
            @change="handleColorChange"
            :predefine="predefineColors"
            popper-class="text-picker"
          />
          <div>
            {{ text.color }}
          </div>
        </div>
        <el-select :modelValue="text.fontSize" @change="handleFontSizeChange">
          <el-option
            v-for="item in fontSizeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="text-fontoption flex">
        <div class="text-fontstyle flex">
          <Icon
            iconType="icon-tilt"
            class="text-icon"
            :action="text.isItalic ? 'active' : ''"
            @click="toggleItalic"
          ></Icon>
          <Icon
            iconType="icon-bold"
            class="text-icon"
            :action="text.isBold ? 'active' : ''"
            @click="toggleBold"
            id="middle-icon1"
          ></Icon>
          <Icon
            iconType="icon-underline"
            class="text-icon"
            :action="text.isUnderline ? 'active' : ''"
            @click="toggleUnderline"
          ></Icon>
        </div>
        <div class="text-fontside flex">
          <Icon
            iconType="icon-textleft"
            class="text-icon"
            :action="text.horizontalAlign === TextAlign.Left ? 'active' : ''"
            @click="setAlignLeft"
          ></Icon>
          <Icon
            iconType="icon-textmid"
            class="text-icon"
            :action="text.horizontalAlign === TextAlign.Center ? 'active' : ''"
            @click="setAlignCenter"
            id="middle-icon2"
          ></Icon>
          <Icon
            iconType="icon-textright"
            class="text-icon"
            :action="text.horizontalAlign === TextAlign.Right ? 'active' : ''"
            @click="setAlignRight"
          ></Icon>
        </div>
      </div>
      <div class="text-fontoption flex">
        <div class="flex">
          <Icon iconType="icon-paragraphd" class="text-icon"></Icon>
          <el-input
            :modelValue="text.lineHeight"
            @input="handleLineHeightChange"
          />
        </div>
      </div>
    </div>

    <div>
      <div class="mt-4">
        <span class="text-title">设置基本属性</span>
        <div>
          <span style="line-height: 35px">遮挡人物</span>
          <el-checkbox
            :modelValue="text.isMaskPlayer"
            @change="handleIsMaskPlayerChange"
            size="large"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { fontSizeOptions, TextAlign } from "../const";
import Icon from "./Toolbar/IconStyle.vue";

export default {
  components: {
    Icon,
  },
  props: {
    text: {
      type: Object,
    },
    updateText: {
      type: Function,
    },
  },
  data() {
    return {
      fontSizeOptions,
      TextAlign,
      lineSpacing: 0,
      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585",
      ],
    };
  },
  computed: {
    textOpacity() {
      return this.text.opacity * 100;
    },
    opacityPercentage() {
      return `${Math.round(this.text.opacity * 100)}%`;
    },
  },
  methods: {
    handleFontSizeChange(fontSize) {
      this.updateText(this.text.id, { fontSize });
    },
    handleColorChange(color) {
      this.updateText(this.text.id, { color });
    },
    handleIsMaskPlayerChange(isMaskPlayer) {
      this.updateText(this.text.id, { isMaskPlayer });
    },
    handleOpacityChange(opacityPercent) {
      const opacity = opacityPercent / 100;
      this.updateText(this.text.id, { opacity });
    },
    toggleItalic() {
      const isItalic = !this.text.isItalic;
      this.updateText(this.text.id, { isItalic });
    },
    toggleBold() {
      const isBold = !this.text.isBold;
      this.updateText(this.text.id, { isBold });
    },
    toggleUnderline() {
      const isUnderline = !this.text.isUnderline;
      this.updateText(this.text.id, { isUnderline });
    },
    setAlignLeft() {
      const horizontalAlign = TextAlign.Left;
      this.updateText(this.text.id, { horizontalAlign });
    },
    setAlignCenter() {
      const horizontalAlign = TextAlign.Center;
      this.updateText(this.text.id, { horizontalAlign });
    },
    setAlignRight() {
      const horizontalAlign = TextAlign.Right;
      this.updateText(this.text.id, { horizontalAlign });
    },
    handleLineHeightChange(lineHeightStr) {
      let lineHeight;
      if (lineHeightStr === "") {
        lineHeight = null;
      } else {
        lineHeight = parseInt(lineHeightStr);
        if (Number.isNaN(lineHeight)) {
          lineHeight = this.text.lineHeight;
        }
      }
      this.updateText(this.text.id, { lineHeight });
    },
  },
};
</script>

<style lang='scss' scoped>
.p-6 {
  font-size: 10px;
  text-align: left;
  padding: 0px;
  /* Headline 4 - Bold */
  font-family: "Noto Sans SC";
  font-style: normal;
  /* identical to box height, or 157% */
  /* bg dark */
  color: #282c4a;
  /* Inside auto layout */
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
}
.mt-6 {
  margin-top: 0px;
  padding: 24px 24px;
  border-bottom: 1px solid #f5f5f5;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
}
.mt-5 {
  display: flex;
  width: 60%;
  :deep(.el-select) {
    border: none;
  }
  .el-select {
    margin-left: 16px;
    --el-select-input-focus-border-color: #ffffff;
    :deep(.el-input__inner) {
      width: 88px;
      height: 24px;
      padding-left: 3px;
      border-radius: 3px;
      font-weight: 400;
      font-size: 12px;
      line-height: 20px;
      align-items: center;
      border-color: #f5f5f5;
    }
    :deep(.el-input) {
      border: none;
      border-radius: 3px;
    }
    :deep(.el-input.is-focus) {
      outline: 2px solid #8f7ef4;
    }
    :deep(.el-input:hover) {
      outline: 2px solid #b9adff;
    }
    :deep(.el-input__suffix) {
      top: -8px;
    }
    :deep(.el-icon-arrow-up:before) {
      color: #282c4a;
      height: 100px;
    }
  }
}
.mt-4 {
  padding: 24px 24px;
  margin-top: 0px;
  border-bottom: 1px solid #f5f5f5;
  div {
    display: flex;
    justify-content: space-between;
  }
}
.text-fontoption {
  margin-top: 10px;
  justify-content: space-between;
  .el-input {
    font-weight: 400;
    font-size: 12px;
    line-height: 20px;
    align-items: center;
    margin-left: 4px;
    width: 60px;
    height: 24px;
    border-radius: 3px;
    --el-input-focus-border: white;
    --el-input-hover-border: white;
    :focus {
      outline: 2px solid #8f7ef4;
    }
    :hover {
      outline: 2px solid #b9adff;
    }
    :deep(.el-input__inner) {
      height: 24px;
      width: 60px;
      top: -10px;
      display: block;
      padding: 3px;
      border-color: #f5f5f5;
    }
  }
}

.text-icon {
  width: 24px;
  height: 24px;
  margin-left: 0px;
}

.text-slider {
  display: flex;
  width: 200px;
}
.el-slider {
  --el-slider-main-background-color: #8f7ef4;
  --el-slider-runway-background-color: #e0e0e0;
  --el-slider-margin: 14px 0;
  --el-slider-border-radius: 3px;
  --el-slider-height: 2px;
  --el-slider-button-size: 10px;
  --el-slider-button-wrapper-size: 36px;
  --el-slider-button-wrapper-offset: -11pt;
  :deep(.el-slider__button) {
    border-radius: 50%;
    box-sizing: border-box;
    display: inline-block;
    -webkit-user-select: none;
    user-select: none;
    vertical-align: baseline;
    background: #ffffff;
    /* bg light grey */
    border: 1px solid #f5f5f5;
    box-sizing: border-box;
    /* shadow- small button */
    box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
  }
}

.text-title {
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  display: block;
  margin-bottom: 15px;
}
:deep(.el-color-picker) {
  height: 20px;
}
:deep(.el-color-picker__trigger) {
  height: 20px;
  width: 20px;
  border: none;
  padding: 0px;
  margin-right: 7.69px;
}
:deep(.el-color-picker__color) {
  border: none;
}
:deep(.el-color-picker__color-inner) {
  border-radius: 2px;
}
#middle-icon1 {
  margin: 0 8px;
}
#middle-icon2 {
  margin: 0 8px;
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
}
.colorDetail {
  display: flex;
  min-width: 88px;
  height: 24px;
  border: 1px solid #f5f5f5;
  box-sizing: border-box;
  border-radius: 3px;
  padding: 1px;
}
</style>
