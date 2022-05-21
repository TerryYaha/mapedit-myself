<template>
  <div class="interact" ref="interact">
    <span class="interact-title">选择可交互属性</span>
    <Interact v-if="!interactiveType" :addInteract="addInteract" />
    <LocalDocument
      v-if="interactiveType === INTERACTIVE_TYPE.LOCAL_FILE"
      :resource="interactive.resource"
      :deleteAct="deleteAct"
      :isOnline="isOnline"
      @change="handleDocumentChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <!-- v-bind="$attrs"传递文件上传缓存状态 notSaved -->
    <LocalPicture
      v-if="interactiveType === INTERACTIVE_TYPE.LOCAL_PICTURE"
      :resource="interactive.resource"
      :deleteAct="deleteAct"
      :isOnline="isOnline"
      @change="handlePictureChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <LocalVideo
      v-if="interactiveType === INTERACTIVE_TYPE.VIDEO"
      :resource="interactive.resource"
      :deleteAct="deleteAct"
      :isOnline="isOnline"
      @change="handleVideoChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <LocalMusic
      v-if="interactiveType === INTERACTIVE_TYPE.LOCAL_MUSIC"
      :resource="interactive.resource"
      :deleteAct="deleteAct"
      :isOnline="isOnline"
      @change="handleMusicChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <HyperLink
      v-if="interactiveType === INTERACTIVE_TYPE.HYPER_LINK"
      :interactive="interactive"
      :deleteAct="deleteAct"
      @change="handleChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <Live
      v-if="interactiveType === INTERACTIVE_TYPE.LIVE"
      :interactive="interactive"
      :deleteAct="deleteAct"
      @change="handleChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <Note
      v-if="interactiveType === INTERACTIVE_TYPE.STICKY_NOTE"
      :interactive="interactive"
      :deleteAct="deleteAct"
      @change="handleChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
    <WhiteBoard
      v-if="interactiveType === INTERACTIVE_TYPE.WHITE_BOARD"
      :interactive="interactive"
      :deleteAct="deleteAct"
      :isOnline="isOnline"
      @change="handleChange"
      :onNotSavedChange="handleNotSavedChange"
      v-bind="$attrs"
    />
  </div>
</template>

<script>
import { ElMessageBox } from "element-plus";
import Interact from "./InteractAttr/index.vue";
import LocalDocument from "./AttrList/LocalDocument.vue";
import LocalPicture from "./AttrList/LocalPicture.vue";
import LocalVideo from "./AttrList/LocalVideo.vue";
import LocalMusic from "./AttrList/LocalMusic.vue";
import HyperLink from "./AttrList/HyperLink.vue";
import Live from "./AttrList/Live.vue";
import Note from "./AttrList/Note.vue";
import WhiteBoard from "./AttrList/WhiteBoard.vue";
import eventBus from "../../eventBus";
import { INTERACTIVE_TYPE, MESSAGE_BOX_CUSTOM_CLASS, OVERLAY_CUSTOM_CLASS } from "../../const";

export default {
  components: {
    Interact,
    LocalDocument,
    LocalPicture,
    LocalVideo,
    LocalMusic,
    HyperLink,
    Live,
    WhiteBoard,
    Note,
  },
  props: {
    interactive: {
      type: Object,
    },
    canAddInteractive: {
      type: Function,
    },
    isOnline: Boolean,
  },
  emits: ["change"],
  data() {
    return {
      INTERACTIVE_TYPE,
      interactiveType: "",
      notSaved:false,
    };
  },
  watch: {
    interactive(newVal) {
      this.interactiveType = newVal?.interactiveType;
    },
  },
  mounted() {
    this.interactiveType = this.interactive?.interactiveType;
    window.addEventListener("mousedown", this.handleMouseDown, { capture: true });
  },
  beforeUnmount() {
    window.removeEventListener("mousedown", this.handleMouseDown, { capture: true });
  },
  methods: {
    addInteract(interactiveType) {
      if (!this.canAddInteractive()) {
        ElMessageBox.alert(
          "与其他添加了可交互属性的素材重叠咯，建议移开此素材再执行此操作或在其他素材上添加可交互属性哦～",
          "操作提示",
          {
            confirmButtonText: "知道了",
            showClose: false,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          }
        );
        return;
      }
      this.interactiveType = interactiveType;
    },
    handleMouseDown(e) {
      const interacrtArea = this.$refs["interact"];

      if (this.notSaved) {
        if (!e.path.includes(interacrtArea)) {
          let classList = [];
          e.path.forEach((item) => {
            classList.push(item.classList);
          });
          const classObj = [].concat.apply([], classList);
          let isClickMsg = false;
          for (let i = 0; i <= classObj.length; i++) {
            if (classObj[i]) {
              let arr3 = classObj[i];
              let arr4 = Object.values(arr3);
              if (arr4.indexOf("msgCached") != -1) {
                isClickMsg = true;
              }
            }
          }
          if (!isClickMsg) {
            e.stopPropagation();
            ElMessageBox.alert(
              "你还有可交互属性未确定，请先确定添加的可交互属性。",
              "操作提示",
              {
                confirmButtonText: "知道了",
                customClass: `msgCached ${MESSAGE_BOX_CUSTOM_CLASS}`,
                modalClass: `msgCached ${OVERLAY_CUSTOM_CLASS}`,
              }
            );
          }
        }
      }
    },
    handleNotSavedChange(notSaved) {
      this.notSaved = notSaved;
      eventBus.emit('ui:interactiveNotSavedChange', notSaved);
    },
    async deleteAct() {
      if (this.notSaved) {
        try {
          await ElMessageBox.confirm(
            "您还有可交互属性未确认，若执行其他操作，附加在可交互物体上的文件、链接、文字等都会被清除且无法找回。请谨慎操作！",
            "操作提示",
            {
              confirmButtonText: "取消",
              cancelButtonText: "继续",
              type: "warning",
              customClass: `msgCached ${MESSAGE_BOX_CUSTOM_CLASS}`,
              modalClass: `msgCached ${OVERLAY_CUSTOM_CLASS}`,
              distinguishCancelAndClose: true,
              closeOnClickModal: false, // 取消点击遮罩层关闭弹窗
            }
          )
          // 取消
          return;
        } catch (action) {
          if (action) {
            // 继续
          } else {
            // 关闭
            return;
          }
        }
      } else {
        if (
          this.interactive?.interactiveType &&
          this.interactive?.interactiveType !== INTERACTIVE_TYPE.DEFAULT
        ) {
          try {
            await ElMessageBox.confirm(
              "删除后，可交互物中的文件、链接、文字等将被清除且无法恢复。确定要删除吗？",
              "删除提示",
              {
                confirmButtonText: "取消",
                cancelButtonText: "继续删除",
                type: "warning",
                distinguishCancelAndClose: true,
                customClass: MESSAGE_BOX_CUSTOM_CLASS,
                modalClass: OVERLAY_CUSTOM_CLASS,
              }
            );
            // 取消
            return;
          } catch (action) {
            if (action === 'cancel') {
              // 继续删除
            } else {
              // 关闭
              return;
            }
          }
        }
      }
      this.clearInteractive();
      this.notSaved = false;
      eventBus.emit('ui:interactiveNotSavedChange', false);
    },
    clearInteractive() {
      this.interactiveType = "";
      const data = {
        interactiveType: INTERACTIVE_TYPE.DEFAULT,
        interactiveMsg: null,
        interactiveURL: null,
        resource: null,
      };
      this.$emit("change", data);
    },
    handleChange(e) {
      this.$emit("change", e);
    },
    handleDocumentChange( resource ) {
      // 使用上传资源库接口返回的url存入到msg，供阿里云文档预览
      const data = {
        interactiveType: INTERACTIVE_TYPE.LOCAL_FILE,
        interactiveMsg: resource.url,
        interactiveURL: null,
        resource,
      };
      this.$emit("change", data);
    },
    handlePictureChange(resource) {
      const data = {
        interactiveType: INTERACTIVE_TYPE.LOCAL_PICTURE,
        interactiveMsg: null,
        interactiveURL: resource.url,
        resource,
      };
      this.$emit("change", data);
    },
    handleVideoChange(resource) {
      const data = {
        interactiveType: INTERACTIVE_TYPE.VIDEO,
        interactiveMsg: null,
        interactiveURL: resource.url,
        resource,
      };
      this.$emit("change", data);
    },
    handleMusicChange(resource) {
      const data = {
        interactiveType: INTERACTIVE_TYPE.LOCAL_MUSIC,
        interactiveMsg: null,
        interactiveURL: resource.url,
        resource,
      };
      this.$emit("change", data);
    },
  },
};
</script>

<style lang="scss" scoped>
.interact {
  width: 208px;
  padding-bottom: 40px;
}
.interact-title {
  font-family: "Noto Sans SC";
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 22px;
  color: #282c4a;
}
.warn-box {
  margin-top: 16px;
}
</style>
