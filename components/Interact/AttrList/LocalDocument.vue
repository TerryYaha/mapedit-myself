<template>
  <div class="local-list">
    <div class="upload-file upload">
      <LocalAttr
        attrSvg="file"
        attrName="本地文件"
        :deleteAct="handleDelete"
      ></LocalAttr>
      <Upload
        ref="upload"
        :bulk="30"
        :isOnline="isOnline"
        :resourceType="ResourceType.Document"
        btnText="上传本地文件"
        typeWarn="文件格式暂不支持哦，"
        acceptType="application/vnd.ms-powerpoint,application/vnd.ms-powerpoint.presentation.macroenabled.12,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.presentationml.template,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.ms-powerpoint.slideshow.macroenabled.12,application/vnd.ms-powerpoint.template.macroenabled.12,application/vnd.ms-excel.template.macroenabled.12,application/vnd.ms-excel.sheet.macroenabled.12
        ,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.wordprocessingml.template,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.et,application/vnd.openxmlformats-officedocument.spreadsheetml.template,xltm,application/rtf, text/rtf,application/vnd.ms-works,application/kswps,application/pdf,text/plain,application/vnd.ms-visio.viewer,application/epub.application/dps,.dps,text/csv,.dpt
        ,application/vnd.ms-word.document.macroenabled.12,application/vnd.ms-word.template.macroenabled.12"
        tip="文件不能超过30MB，支持常用文件格式：doc、docx、pdf、ppt、pptx、wps、xls、xlsx、csv 等。"
        linkContent="查看全部支持的格式"
        :linkType="linkType"
        :resource="resource"
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
import { ResourceType, INTERACTIVE_TYPE } from "@/components/MapEditor/const.js";
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
  data() {
    return {
      ResourceType,
      linkType:INTERACTIVE_TYPE.LOCAL_FILE,
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
    handleUploaded({ tempResource, tempDocument }) {
      if (this.tempDocument) {

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
