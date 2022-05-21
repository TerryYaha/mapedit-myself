<template>
  <div class="local-list">
    <div class="upload-file upload">
      <LocalAttr
        attrSvg="video"
        attrName="本地视频"
        :deleteAct="handleDelete"
      ></LocalAttr>
      <Upload
        ref="upload"
        :bulk="100"
        :isOnline="isOnline"
        :resourceType="ResourceType.Video"
        btnText="上传本地视频"
        typeWarn="仅支持上传mp4（Chrome浏览器仅支持H264编码的mp4）、WebM、ogg格式的视频"
        acceptType="audio/mp4,video/mp4,video/webm,application/ogg, audio/ogg"
        :resource="resource"
        tip="视频不能超过100MB，支持的格式为 mp4 （Chrome浏览器仅支持H264编码的mp4）、WebM、ogg"
        :linkType="linkType"
        @uploaded="handleUploaded"
        @change="handleChange"
        :onNotSavedChange="onNotSavedChange"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>

<script>
import LocalAttr from "./LocalAttr.vue";
import Upload from "../Upload/UploadFile.vue";
import { ResourceType,INTERACTIVE_TYPE } from "../../../const.js";
import LocalStatus from "./LocalStatus.vue";

export default {
  components: {
    LocalAttr,
    Upload,
    LocalStatus,
  },
  props: {
    resource: {
      type: Object,
    },
    deleteAct: {
      type: Function,
    },
    isOnline:Boolean,
    onNotSavedChange: {
      type: Function,
    },
  },
  emits: ["change"],
  data(){
    return {
      ResourceType,
      tempResource: null,
      linkType:INTERACTIVE_TYPE.VIDEO,
    };
  },
  methods: {
    handleDelete() {
      if (this.tempResource) {
        this.tempResource = null;
      }
      this.deleteAct();
    },
    handleUploaded({ tempResource }) {
      if (this.tempResource) {
      }
      this.tempResource = tempResource;
    },
    handleChange({ resource }) {
      this.tempResource = null;
      this.$emit("change", resource);
    },
  },
};
</script>

<style lang="scss" scoped>
.local-list {
  margin-top: 16px;
}
</style>
