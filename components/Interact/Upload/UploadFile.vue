<template>
  <div class="upload-button">
    <!-- 文件上传 -->
    <div v-if="!file" class="edit-button primary btn-mt1">
      <p v-text="btnText"></p>
      <input
        ref="input"
        type="file"
        :accept="acceptType"
        @change="handleChange"
      />
    </div>
    <!-- 文件上传过程 -->
    <div v-else class="status-area">
      <LocalStatus
        :isError="file.status === 'fail'"
        :fileName="file.fileName"
        :fileSize="formatedFileSize"
        :resourceType="resourceType"
      />
      <Warn
        v-show="file.status === 'fail'"
        :content="file.errMsg"
        :isWarn="true"
        class="warn-error"
        :linkContent="(file.errMsg==typeWarn && resourceType===1)?'查看支持的格式':''"
        :linkType="linkType"
      />
      <div class="btn-re">
        <div class="edit-button gray btn-mt2" v-show="reuploadVisible">
          <span class="mt2-txt">重新上传</span>
          <input
            ref="input"
            type="file"
            :accept="acceptType"
            @change="handleChange"
          />
        </div>
        <div class="btn-sub" v-show="confrimVisible">
          <ButtonEditNew
            @click="submitFile"
            style="width: 48px; height: 32px"
            msg="确认"
          />
        </div>
      </div>
    </div>
  </div>
  <Warn v-if="!file" class="warn-tip" :content="tip" :linkContent="linkContent" :linkType="linkType"/>
</template>

<script lang="ts">
import { uploadFileToServer} from "@/api/api.js";
import LocalStatus from "../AttrList/LocalStatus.vue";
import input from "@/components/EventDetailed/input.vue";
import Warn from "../Warn/Warn.vue";
import ButtonEditNew from "../../Toolbar/ButtonEditNew.vue";
import { ImageResourceSubtype, ResourceType } from "@/components/MapEditor/const";
import { Resource } from '../../../model/resource';
import { defineComponent } from "vue";
import { getFileExtendingLowerName } from "@/assets/js/tool";

export default defineComponent({
  components: { input, LocalStatus, ButtonEditNew, Warn },
  props: {
    acceptType: {
      // 文件类型
      type: String,
      default: "",
    },
    bulk: {
      // 限制上传文件大小
      type: Number,
      default: 0,
    },
    resource: {
      type: Object,
    },
    btnText: {
      type: String,
      default: "上传本地文档",
    },
    typeWarn: {
      type: String,
      default: "",
    },
    isOnline: Boolean,
    tip: {
      type: String,
      default: "",
    },
    linkType:Number,
    linkContent: {
      type: String,
    },
    // 哪个属性1.文档 2.图片 3.视频 4.音频
    resourceType: {
      type: Number,
      default:-1
    },
    onNotSavedChange: {
      type: Function,
    },
  },
  emits: ['change', 'uploaded'],
  data() {
    return {
      tempResource: <undefined | Resource | null | void>this.resource,
      file: this.getIntialFile(),
    };
  },
  computed: {
    formatedFileSize() {
      if (!this.file || !this.file.fileSize) return 0;
      return parseFloat((this.file.fileSize / 1024 / 1024).toFixed(2)) || 0.01;
    },
    reuploadVisible() {
      return (
        this.file &&
        (this.file.status === "success" || this.file.status === "fail")
      );
    },
    // TODO: 上传文件的状态改成常量
    notSaved() {
      if (!this.file) return false;
      if (this.file.status === 'ready' || this.file.status === 'uploading') return true;
      return this.file.status === 'success'
        && this.file.url !== this.resource?.url;
    },
    confrimVisible() {
      return this.file
        && this.file.status === 'success'
        && this.file.url !== this.resource?.url
    },
  },
  watch: {
    notSaved(newVal:boolean) {
      (<any>this).onNotSavedChange(newVal);
    },
  },
  methods: {
    getIntialFile():object | null {
      if (this.resource == null) return null;
      return {
        url: this.resource?.url,
        fileName: this.resource?.name,
        fileSize: this.resource?.size,
        status: 'success',
        errMsg: null,
      };
    },
    handleChange(e) {
      // if (this.file == null) {
        this.file = {
          url: null,
          fileName: null,
          fileSize: null,
          status: "ready",
          errMsg: null,
        };
      // }
      this.file.status = "uploading";
      this.file.fileName = "";
      this.file.fileSize = "";

      let bufferFile = e.target.files[0];
      let newFile = new File([bufferFile],getFileExtendingLowerName(bufferFile.name),{
        type:bufferFile.type
      });
      this.uploadFile(newFile);
      e.target.value = "";
    },

    async uploadFile(file) {
      if (this.acceptType) {
        try {
          await this.detectorType(file);
        } catch (err) {
          console.error(err);
          this.file.status = 'fail';
          this.file.fileName = null;
          this.file.fileSize = null;
          this.file.errMsg = this.typeWarn;
          return;
        }
      }

      if (this.bulk) {
        try {
          await this.detectorBulk(file);
        } catch (err) {
          console.error(err);
          let resourceName;
          switch(this.resourceType){
            case 1:
              resourceName = "文件";
              break;
            case 2:
              resourceName = "图片";
              break;
            case 3:
              resourceName = "视频";
              break;
            case 4:
              resourceName = "音频";
              break;
            default:
              resourceName = ""
          }
          this.file.status = 'fail';
          this.file.fileName = null;
          this.file.fileSize = null;
          this.file.errMsg = `${resourceName}大小不能超过${this.bulk}M哦`;
          return;
        }
      }

      if (this.isOnline) {
      try {
        this.file.status = 'uploading';
        const resource = await this.uploadResource(file);
        this.tempResource = resource;
        this.file.url = resource?.url;
        this.file.status = 'success';
        this.file.fileName = file.name;
        this.file.fileSize = file.size;
        const data = { tempResource: this.tempResource};
        this.$emit('uploaded', data);
      } catch (err) {
        this.file.status = 'fail';
        this.tempResource = null;
        this.file.fileName = null;
        this.file.fileSize = null;
        this.file.errMsg = '上传文件失败';
      }
      } else {
        this.file.status = "fail";
        this.file.fileName = null;
        this.file.errMsg = "设置失败，请重新联网后再试试吧";
      }
    },

    submitFile() {
      const data = { resource: this.tempResource, };
      this.$emit('change', data);
    },

    reset() {
      this.tempResource = null;
      this.file = this.getIntialFile();
    },

    // TODO: 这里为什么要是异步的呢？
    detectorType(file):Promise<void> {
      return new Promise((resolve, reject) => {
        const typeList = this.acceptType.split(",").map((item) => item.trim()).filter((item) => item);
        let suffix = file.type;
        if(!file.type){
          let reg = /\.[^\.]+$/;
          let matches = reg.exec(file.name);
          if (matches) {
            suffix = matches[0]
          }
        }
        if (!typeList.includes(suffix)) {
          reject();
        } else {
          resolve();
        }
      });
    },

    detectorBulk(file):Promise<void> {
      return new Promise((resolve, reject) => {
        const fileSize = file.size / 1024 / 1024;
        if (fileSize > this.bulk) {
          reject();
        } else {
          resolve();
        }
      });
    },

    uploadResource(file) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", this.resourceType.toString());
      if (this.resourceType === ResourceType.Image) {
        fd.append("typeChild", ImageResourceSubtype.Interactive.toString());
      }
      return uploadFileToServer(fd).then((res) => {
        if (res.data.code === 200) {
          const { resourceId, url } = res.data.data;
          return new Resource({
            id: resourceId,
            url,
            name: file.name,
            size: file.size,
            type: this.resourceType,
            typeChild: this.resourceType === ResourceType.Image ? ImageResourceSubtype.Interactive : null,
          });
        } else {
          throw new Error(res.data.message);
        }
      }).catch((err)=>{});
    },
  },
});
</script>

<style scoped lang="scss">
.edit-button {
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  border: 1px solid transparent;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
}
.btn-mt1 {
  margin-top: 16px;
  width: 192px;
  height: 32px;
}
.status-area {
  margin-top: 16px;
}
.btn-re {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  position: relative;
  right: 15px;
  .btn-mt2 {
    width: 72px;
    height: 32px;
  }
  .gray:hover {
    background: #eeeeee;
  }
  .gray {
    background: #f5f5f5;
    font-weight: bold;
    color: #282c4a;
    font-size: 12px;
  }
  .btn-sub {
    font-size: 12px;
    padding-left: 8px;
  }
}
.warn-error {
  margin-top: 16px;
}
.edit-button input {
  position: absolute;
  font-size: 100px;
  right: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
}
.edit-button:hover {
  background: #8a9df5;
}

.primary {
  background: #8f7ef4;
  color: #fff;
  letter-spacing: 1px;
  border-radius: 4px;
}

.primary:hover {
  background: #8a9df5;
}
.primary:active {
  background: #8a9df5;
}
.disabled {
  background: #f6f6f6;
  color: #cfcfcf;
  line-height: 40px;
  font-size: 14px;
  letter-spacing: 1px;
  border-radius: 4px;
  cursor: not-allowed;
}

.warn-tip {
  margin-top: 16px;
}
</style>

