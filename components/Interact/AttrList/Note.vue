<template>
  <div class="note">
    <LocalAttr attrSvg="notes" attrName="便签" :deleteAct="deleteAct" />
    <div style="margin: 16px 0 16px 0">
      <input-area
        class="paper-textarea"
        ref="paper-textarea"
        placeholder="请输入便签内容"
        :isSuccess="successHide"
        :textValue="stickyNoteValue"
        @changeValue="onInputValueChange"
        :maxlength="80"
      ></input-area>
    </div>
    <ButtonEditNew
      @click="addNotes"
      :class="['sub-btn', notSaved ? '' : 'disabled']"
      msg="确认"
    />
  </div>
</template>

<script>
import LocalAttr from "./LocalAttr.vue";
import { INTERACTIVE_TYPE } from "../../../const.js";
import InputArea from "../components/InputArea.vue";
import ButtonEditNew from "../../Toolbar/ButtonEditNew.vue";

export default {
  components: { LocalAttr, ButtonEditNew, InputArea },
  props: {
    attrValue: {
      type: Number,
      default: -1,
    },
    isOnline: Boolean,
    deleteAct: Function,
    interactive: {
      type: Object,
    },
    deleteAct: {
      type: Function,
    },
    onNotSavedChange: {
      type: Function,
    },
  },
  emits: ["change"],
  data() {
    return {
      stickyNoteValue: this.interactive ? this.interactive.interactiveMsg : "",
    };
  },
  computed: {
    notSaved() {
      return (
        !!this.stickyNoteValue &&
        this.stickyNoteValue !== this.interactive?.interactiveMsg
      );
    },
    successHide() {
      return !!this.interactive?.interactiveMsg;
    },
  },
  watch: {
    notSaved(newVal) {
      this.onNotSavedChange(newVal);
    },
  },
  methods: {
    onInputValueChange(value) {
      this.stickyNoteValue = value;
    },
    addNotes() {
      if (!this.notSaved) return;

      const data = {
        interactiveType: INTERACTIVE_TYPE.STICKY_NOTE,
        interactiveMsg: this.stickyNoteValue,
        interactiveURL: null,
      };
      this.$emit("change", data);
      this.$refs["paper-textarea"].isOnfocus = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.note {
  position: relative;
  margin-top: 16px;
  .sub-btn {
    position: absolute;
    width: 48px;
    height: 32px;
    right: 15px;
  }
}

.el-textarea {
  height: 198px !important;
  width: 192px;
  border-radius: 5px;
}
.paper-textarea {
  width: 192px;
  height: 198px;
}
:deep(.el-textarea__inner) {
  font-family: "Noto Sans SC";
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0em;
  text-align: left;
  //styleName: Headline 4 - Regular;
  height: 198px !important;
  width: 192px;
  border-radius: 5px;

  padding: 8px 11px 0;
}
</style>