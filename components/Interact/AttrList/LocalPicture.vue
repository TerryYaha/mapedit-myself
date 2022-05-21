<template>
  <div class="local-list">
    <div class="upload-file upload">
      <LocalAttr
        attrSvg="picture"
        attrName="本地图片"
        :deleteAct="handleDelete"
      ></LocalAttr>
      <Upload
        ref="upload"
        :bulk="3"
        :isOnline="isOnline"
        :resourceType="ResourceType.Image"
        btnText="上传本地图片"
        typeWarn="仅支持上传 jpg、png、bmp、gif格式的图片"
        acceptType="image/jpeg,image/png,image/bmp,image/gif"
        :resource="resource"
        tip="图片不能超过3MB，支持的格式为 jpg、png、bmp、gif"
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
import Warn from "../Warn/Warn.vue";

export default {
  components: {
    LocalAttr,
    Upload,
    Warn,
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
      linkType:INTERACTIVE_TYPE.LOCAL_PICTURE,
    };
  },
  methods: {
    // TODO: 优化可交互物这一块的资源删除代码
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
