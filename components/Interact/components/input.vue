<!-- 超链接、直播流的 输入框业务组件 -->
<template>
  <div class="input-area">
    <el-input
      class="input"
      :placeholder="`请输入${linkName}`"
      v-model="modelValue"
      @input="$emit('update:modelValue', $event), reSub()"
      keypress.enter="submitLink"
      @focus="isOnfocus=true"
    >
      <template #suffix>
        <IconFont v-if="isSuccess && !isOnfocus" class="icon-success" type="icon-success" />
      </template>
    </el-input>
    <Warn
      class="warn-tip"
      toolTipContent="点击查看帮助指南"
      v-show="isShowAlert"
      :content="linkType==5?'请提前确认链接可用，支持 https 开头的链接':linkType==11?'请提前确认直播流链接可用，支持的格式为 M3U8':''"
      :linkType="linkType"
    />
    <button-edit-new
      class="sub-btn"
      msg="确认"
      @click="submitLink"
      :myStyle="isDisabledBtn ? 'disabled' : 'primary'"
    ></button-edit-new>
  </div>
</template>

<script>
import Warn from "../Warn/Warn.vue";
import IconFont from "../../iconFont";
import ButtonEditNew from "../../Toolbar/ButtonEditNew.vue";

export default {
  components: {
    ButtonEditNew,
    IconFont,
    Warn,
  },
  props: {
    // 默认值
    defaultValue: {
      type: String,
    },
    // 链接的名称
    linkName: {
      type: String,
    },
    onNotSavedChange: {
      type: Function,
    },
    isSuccess:Boolean,
    linkType:Number,
  },
  data() {
    return {
      modelValue: this.defaultValue ?? "",
      isShowLoading: false, // 显示loading
      isShowSuccess: false, //解析成功
      isShowAlert: true, // 解析失败
      isDisabledBtn: true, // 确认按钮是否有效
      isOnfocus:false,
    };
  },
  computed: {
    notSaved() {
      return !!this.modelValue && this.modelValue !== this.defaultValue;
    },
  },
  watch: {
    notSaved(newVal) {
      this.onNotSavedChange(newVal);
    },
  },
  methods: {
    async submitLink() {
      if (!this.isDisabledBtn) {
        this.isShowLoading = true;
        this.isDisabledBtn = true;
        this.isShowLoading = false;
        this.$emit("save", this.modelValue);
      }
    },
    // 输入框右侧有状态时，监听数据变动，使得确认按钮可用状态
    reSub() {
      if (this.modelValue.length === 0) {
        this.isDisabledBtn = true;
      }
      if (this.isShowSuccess || this.isShowLoading) {
        this.isShowSuccess = false;
        this.isShowLoading = false;
        if (this.modelValue.length > 0) {
          this.isDisabledBtn = false;
        }
      } else {
        if (this.modelValue.length > 0 && this.isDisabledBtn) {
          this.isDisabledBtn = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.input-area {
  position: relative;
  .input {
    width: 192px;
    height: 40px;
  }
  :deep(.el-input__inner) {
    border: none;
    outline: 2px solid #e0e0e0;
  }
  :deep(.el-input__inner:focus) {
    outline: 2px solid #8f7ef4;
  }
  :deep(.el-input__inner:visited) {
    outline: 2px solid #e0e0e0;
  }

  .sub-btn {
    position: absolute;
    margin-top: 24px;
    right: 15px;
    width: 48px;
    height: 32px;
  }
  .loading-gif {
    position: relative;
    top: 10px;
  }
  .warn-tip {
    margin-top: 24px;
  }
}
.icon-success{
  font-size: 18px;
}
.iconfont {
  font-size: 24px;
}
</style>