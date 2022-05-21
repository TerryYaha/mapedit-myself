<template>
  <div class="white-board">
    <LocalAttr attrSvg="whiteboard" attrName="白板" :deleteAct="deleteAct" />
    <WbLoading
      :loadStatus="loadStatus"
      v-if="whiteBoardStatus !== 'ready'"
      class="load"
    />
    <Warn
      class="warn-tip"
      v-if="whiteBoardStatus === 'fail'"
      content="请检查网络连接或查看帮助指南"
      isWarn="true"
      :linkType="linkType"
    />
    <ButtonEditNew
      v-if="whiteBoardStatus === 'ready' || whiteBoardStatus === 'fail'"
      class="sub-btn"
      @click="addWb"
      :msg="whiteBoardStatus === 'fail' ? '重新添加' : '确认添加'"
    />
  </div>
</template>

<script>
import LocalAttr from "./LocalAttr.vue";
import { INTERACTIVE_TYPE } from "../../../const.js";
import WbLoading from "../components/WbLoading.vue";
import ButtonEditNew from "../../Toolbar/ButtonEditNew.vue";
import { getWhiteBoardUuid } from "@/api/api.js";
import Warn from "../Warn/Warn.vue";

export default {
  components: {
    LocalAttr,
    ButtonEditNew,
    WbLoading,
    Warn,
  },
  props: {
    interactive: {
      type: Object,
    },
    deleteAct: {
      type: Function,
    },
    isOnline: Boolean,
    onNotSavedChange: {
      type: Function,
    },
  },
  data() {
    return {
      whiteBoardId: this.interactive?.interactiveMsg ?? null,
      // 可选值：ready | loading | success | fail
      whiteBoardStatus: this.interactive?.interactiveMsg ? "success" : "ready",
      linkType:INTERACTIVE_TYPE.WHITE_BOARD,
    };
  },
  mounted() {
    console.log("isOnline====>", this.isOnline);
  },
  computed: {
    loadStatus() {
      const map = {
        loading: 0,
        success: 1,
        fail: 2,
      };
      return map[this.whiteBoardStatus];
    },
    notSaved() {
      return this.whiteBoardStatus === 'loading';
    },
  },
  watch: {
    notSaved(newVal) {
      this.onNotSavedChange(newVal);
    },
  },
  methods: {
    // 自动为用户生成白板ID
    getUuid() {
      return getWhiteBoardUuid().then((res) => {
        if (res.data && res.data.code === 200) {
          return res.data.data;
        } else {
          throw new Error(res.data.message);
        }
      });
    },
    // 提交白板数据
    addWb() {
      if (this.isOnline) {
        this.whiteBoardStatus = "loading";
        this.getUuid()
          .then((uuid) => {
            this.whiteBoardStatus = "success";
            this.whiteBoardId = uuid;
            this.save();
          })
          .catch(() => {
            this.whiteBoardStatus = "fail";
          });
      }else{
        this.whiteBoardStatus = "fail";
      }
    },
    save() {
      const data = {
        interactiveType: INTERACTIVE_TYPE.WHITE_BOARD,
        interactiveMsg: this.whiteBoardId,
        interactiveURL: null,
      };
      this.$emit("change", data);
    },
  },
  // destroyed() {
  //   window.removeEventListener("online", this.updateOnlineStatus);
  //   window.removeEventListener("offline", this.updateOnlineStatus);
  // },
};
</script>

<style lang="scss" scoped>
.white-board {
  margin-top: 16px;
  .load {
    margin-top: 24px;
  }
  .sub-btn {
    width: 192px;
    height: 32px;
    margin-top: 24px;
  }
  .warn-tip {
    margin-top: 16px;
  }
}
</style>