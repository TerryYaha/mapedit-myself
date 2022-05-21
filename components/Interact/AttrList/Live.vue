<template>
  <div class="link-list">
    <div class="hyper-link">
      <LocalAttr attrSvg="link" attrName="直播流" :deleteAct="deleteAct" />
      <Input
        class="input-box"
        ref="input"
        linkName="直播流"
        :defaultValue="link"
        :isSuccess="successHide"
        @save="save"
        :onNotSavedChange="onNotSavedChange"
        :linkType="linkType"
      />
    </div>
  </div>
</template>

<script>
import LocalAttr from "./LocalAttr.vue";
import Input from "../components/input.vue";
import { INTERACTIVE_TYPE } from "../../../const.js";

export default {
  components: {
    LocalAttr,
    Input,
  },
  props: {
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
  computed: {
    link() {
      return this.interactive?.interactiveURL ?? "";
    },
    successHide() {
      return !!this.interactive?.interactiveURL;
    },
  },
  data(){
    return {
      linkType:INTERACTIVE_TYPE.LIVE,
    }
  },
  methods: {
    save(link) {
      const data = {
        interactiveType: INTERACTIVE_TYPE.LIVE,
        interactiveMsg: null,
        interactiveURL: link,
      };
      this.$emit("change", data);
      this.$refs["input"].isOnfocus = false
    },
  },
};
</script>

<style lang="scss" scopd>
.link-list {
  margin-top: 16px;
  .input-box {
    margin-top: 24px;
  }
}
</style>