<template>
  <div class="local-list">
    <div class="upload-file upload">
      <LocalAttr
        attrSvg="music"
        attrName="本地音乐"
        :deleteAct="handleDelete"
      ></LocalAttr>
      <Upload
        ref="upload"
        :bulk="10"
        :isOnline="isOnline"
        :resourceType="ResourceType.Audio"
        btnText="上传本地音乐"
        typeWarn="仅支持上传mp3、ogg格式的音频"
        acceptType="audio/mpeg,audio/ogg"
        :resource="resource"
        tip="音频不能超过10MB，支持的格式为 mp3、ogg。"
        :linkType="linkType"
        linkContent="查看不同浏览器支持的格式"
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
      linkType:INTERACTIVE_TYPE.LOCAL_MUSIC,
      tempResource: null,
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
