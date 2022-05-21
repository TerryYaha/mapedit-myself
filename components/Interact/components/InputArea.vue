<!-- 便签的 输入框业务组件 -->
<template>
  <div class="paper-textarea-warpper">
    <textarea
      class="paper-textarea"
      :placeholder="placeholder"
      :rows="5"
      :value="textAreaValue"
      :maxlength="maxlength"
      @input="getTextAreaValue"
      @focus="isOnfocus=true"
    />
    <IconFont v-if="isSuccess && !isOnfocus" class="sub-success" type="icon-success" />
    <div class="paper-length-maxlength">
      <span>{{ length }}</span> / <span>{{ maxlength }}</span>
    </div>
  </div>
</template>

<script>
import IconFont from "../../iconFont";
export default {
  components: { IconFont },
  props: {
    placeholder: {
      type: String,
      default: "请输入内容",
    },
    textValue: {
      type: String,
      default: null,
    },
    maxlength: {
      type: [Number],
      default: 100,
    },
    isSuccess:Boolean,
  },
  data() {
    return {
      textAreaValue: this.textValue,
      length: this.textValue?.length || 0,
      isOnfocus:false,
    };
  },
  methods: {
    getTextAreaValue(e) {
      const event = e || window.event;
      const target = event.srcElement || event.taget;
      this.length = target.value.length;
      if (length <= this.maxlength) {
        this.textAreaValue = target.value;
      }
      this.$emit("changeValue", this.textAreaValue);
    },
  },
};
</script>

<style lang="scss" scoped>
.paper-textarea-warpper {
  position: relative;
  padding: 8px 11px 36px 11px;
  border-radius: 4px;
  border: 1px solid #cfcfcf;
  &:focus-within {
    outline: 2px solid #8f7ef4;
  }
  .paper-length-maxlength {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 12px;
    color: #e0e0e0;
  }
  .sub-success {
    position: absolute;
    bottom: 11px;
    left: 11px;
    font-size: 20px;
  }
}
.paper-textarea {
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  /** 禁止textarea拉伸 */
  resize: none;
  &:focus {
    outline: none;
  }
  /* WebKit, Blink, Edge */
  &::-webkit-input-placeholder {
    color: #e0e0e0;
  }
  /* Mozilla Firefox 4 to 18 */
  &:-moz-placeholder {
    color: #e0e0e0;
  }
  /* Mozilla Firefox 19+ */
  &::-moz-placeholder {
    color: #e0e0e0;
  }
  /* Internet Explorer 10-11 */
  &:-ms-input-placeholder {
    color: #e0e0e0;
  }
  font-size: 14px;
  font-weight: 400;
  color: #282c4a;
  line-height: 22px;
  -webkit-background-clip: text;
}
</style>