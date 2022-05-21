<template>
  <el-upload
    ref="upload"
    class="upload"
    :accept="accept"
    :action="action"
    :headers="headers"
    :data="{ type: type, typeChild: typeChild }"
    :show-file-list="false"
    :before-upload="beforeUpload"
    :on-exceed="handleExceed"
    :on-progress="handleProgress"
    :on-success="handleSuccess"
    :on-error="handleError"
  >
    <slot />
  </el-upload>
</template>

<script>
import axios from 'axios';
import { ImageResourceSubtype, ResourceType } from '../const';
import { getFileExtendingLowerName } from "@/assets/js/tool";
import Message from './base/toast';

export default {
  props: {
    type: {
      type: Number,
      required: true,
    },
    typeChild: {
      type: Number,
      required: true,
    },
    onProgress: {
      type: Function,
    },
    onSuccess: {
      type: Function,
    },
    onError: {
      type: Function,
    },
  },
  data() {
    const token = localStorage.getItem('my-token');
    const apiUrl = axios.defaults.baseURL;
    return {
      action: `${apiUrl}/member-repository`,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      acceptMIMEs: ['image/jpeg', 'image/png', 'image/bmp'],
    };
  },
  computed: {
    accept() {
      return this.acceptMIMEs.join(',');
    },
    // 最大文件大小，单位 MB
    maxSize() {
      if (this.type === ResourceType.Image) {
        if (this.typeChild === ImageResourceSubtype.Sticker) {
          return 3;
        } else if (this.typeChild === ImageResourceSubtype.Background) {
          return 20;
        }
      }
    },
    // 最大宽高长度，单位 px
    maxLength() {
      if (this.type === ResourceType.Image) {
        if (this.typeChild === ImageResourceSubtype.Sticker) {
          return 2048;
        } else if (this.typeChild === ImageResourceSubtype.Background) {
          return 8000;
        }
      }
    },
  },
  methods: {
    beforeUpload(rawFile) {
      if (!this.acceptMIMEs.includes(rawFile.type)) {
        Message({
          type: 'warning',
          message: '图片格式不支持，请上传JPG、JPEG、PNG、BMP格式的图片',
        });
        return false;
      }
      
      if (rawFile.size / 1024 / 1024 > this.maxSize) {
        Message({
          type: 'warning',
          message: `图片大小不可以超过${this.maxSize}MB哦`,
        });
        return false;
      }

      let newFile = new File([rawFile],getFileExtendingLowerName(rawFile.name),{
        type:rawFile.type
      });
      
      return new Promise((resolve, reject) => {
        const blobUrl = URL.createObjectURL(newFile);
        const img = new Image();
        img.src = blobUrl;
        img.onload = () => {
          const { naturalWidth, naturalHeight } = img;
          console.log(`上传图片宽度 ${naturalWidth} 高度 ${naturalHeight}`);
          URL.revokeObjectURL(blobUrl);
          if (naturalWidth > this.maxLength || naturalHeight > this.maxLength) {
            Message({
              type: 'warning',
              message: `图片尺寸长、宽不可以超过${this.maxLength}px哦`,
            });
            reject();
            return;
          }
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl);
          Message({
            type: 'warning',
            message: '读取图片的宽高失败',
          });
          reject();
        };
      });
    },
    handleExceed(files) {
      // this.onExceed();
    },
    handleProgress(e, file, fileList) {
      this.onProgress(file);
    },
    handleSuccess(response, file, fileList) {
      if (response.code === 200) {
        this.onSuccess(file);
      } else {
        Message({
          type: 'error',
          message: response.message,
        });
        this.onError(file);
      }
    },
    handleError(err, file, fileList) {
      Message({
        type: 'error',
        message: '当前网络已中断，请重新连接哦',
      });
      this.onError(file);
    },
  },
};
</script>

<style scoped>
.upload {
  height: 0;
}
</style>
