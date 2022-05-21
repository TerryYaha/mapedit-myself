<template>
  <div>
    <div class="mt-4">
      <span>交互类型</span>
      <Select
        :modelValue="interactiveType"
        @update:modelValue="interactiveTypeChange"
        placeholder="交互类型"
        :select-list="interactiveOptions"
      />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.LOCAL_FILE" class="mt-4">
      <UploadDoc :value="docValue" @change="handleDocChange" />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.STICKY_NOTE" class="mt-4">
      <el-input
        :modelValue="stickyNoteValue"
        @update:modelValue="handleStickyNoteChange"
        placeholder="请填写Notes信息"
      />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.VIDEO" class="mt-4">
      <UploadFile :value="videoValue" @change="handleVideoChange" />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.WHITE_BOARD" class="mt-4">
      <el-input
        :modelValue="whiteBoardValue"
        @update:modelValue="handleWhiteBoardChange"
        :disabled="whiteBoardDisabled"
        :placeholder="whiteBoardDisabled ? '自动生成白板ID中...' : '请填写白板ID'"
      />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.HYPER_LINK" class="mt-4">
      <el-input
        :modelValue="hyperLinkValue"
        @update:modelValue="handleHyperLinkChange"
        placeholder="请填写超链接"
      />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.ONLINE_MUSIC" class="mt-4">
      <el-input
        :modelValue="onlineMusicValue"
        @update:modelValue="handleOnlineMusicChange"
        placeholder="请填写网络音乐链接"
      />
    </div>
    <div v-if="interactiveType === INTERACTIVE_TYPE.LOCAL_MUSIC" class="mt-4">
      <UploadFile :value="localMusicValue" @change="handleLocalMusicChange" />
    </div>
    <div class="h-16 w-full text-center" style="line-height: 4rem;">
      <div
        class="inline h-8 hover:underline bg-green-400 hover:bg-green-500 text-sm text-gray-800 font-bold rounded-full my-auto py-2 px-3 shadow-lg"
        @click="save"
      >保存交互</div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Select from '../../BaseTool/Select.vue';
import UploadDoc from '../../BaseTool/UploadDoc.vue';
import UploadFile from '../../BaseTool/UploadFile.vue';
import { INTERACTIVE_TYPE, interactiveOptions } from '../const';

function getWhiteboardUuid() {
  return axios.get('/agora/whiteboard/uuid').then((res) => {
    if (res.data && res.data.code === 200) {
      return res.data.data;
    } else {
      throw new Error(res.data.message);
    }
  });
}

export default {
  components: {
    Select,
    UploadDoc,
    UploadFile,
  },
  props: {
    interactive: {
      type: Object,
      default: {
        interactiveType: INTERACTIVE_TYPE.DEFAULT,
        interactiveMsg: null,
        interactiveURL: null,
      },
    },
  },
  emits: ['change'],  data() {
    return {
      INTERACTIVE_TYPE,
      interactiveOptions,
      whiteBoardDisabled: false,
      interactiveType: this.interactive?.interactiveType,
      interactiveMsg: this.interactive?.interactiveMsg,
      interactiveURL: this.interactive?.interactiveURL,
    };
  },
  watch: {
    interactive(newVal) {
      if (newVal == null) return;
      this.interactiveType = newVal.interactiveType;
      this.interactiveMsg = newVal.interactiveMsg;
      this.interactiveURL = newVal.interactiveURL;
    },
  },
  computed: {
    docValue() {
      if (this.interactiveMsg == null || this.interactiveURL == null) return null;
      return {
        name: this.interactiveMsg,
        documentId: this.interactiveMsg,
        url: this.interactiveURL,
      };
    },
    stickyNoteValue() {
      return this.interactiveMsg;
    },
    videoValue() {
      if (this.interactiveURL == null) return null;
      return {
        name: this.interactiveURL,
        url: this.interactiveURL,
      };
    },
    whiteBoardValue() {
      return this.interactiveMsg;
    },
    hyperLinkValue() {
      return this.interactiveURL;
    },
    onlineMusicValue() {
      return this.interactiveURL;
    },
    localMusicValue() {
      if (this.interactiveURL == null) return null;
      return {
        name: this.interactiveURL,
        url: this.interactiveURL,
      };
    },
  },
  methods: {
    interactiveTypeChange(value) {
      this.interactiveType = value;
      this.interactiveMsg = null;
      this.interactiveURL = null;

      // 自动为用户生成白板ID
      if (value === INTERACTIVE_TYPE.WHITE_BOARD) {
        this.whiteBoardDisabled = true;
        getWhiteboardUuid().then((uuid) => {
          this.$emit('change', {
            interactiveType: value,
            interactiveMsg: uuid,
            interactiveURL: null,
          });
          this.whiteBoardDisabled = false;
        }).catch((error) => {
          Message({
            type: 'error',
            message: '自动生成白板ID失败',
          });
          this.whiteBoardDisabled = false;
        });
        return;
      }
    },
    handleDocChange(value) {
      this.interactiveMsg = value?.documentId;
      this.interactiveURL = value?.url;
    },
    handleStickyNoteChange(value) {
      this.interactiveMsg = value;
      this.interactiveURL = null;
    },
    handleVideoChange(value) {
      this.interactiveMsg = null;
      this.interactiveURL = value?.url;
    },
    handleWhiteBoardChange(value) {
      this.interactiveMsg = value;
      this.interactiveURL = null;
    },
    handleHyperLinkChange(value) {
      this.interactiveMsg = null;
      this.interactiveURL = value;
      console.log("value=============>",value)
    },
    handleOnlineMusicChange(value) {
      this.interactiveMsg = null;
      this.interactiveURL = value;
    },
    handleLocalMusicChange(value) {
      this.interactiveMsg = null;
      this.interactiveURL = value;
    },
    checkInteractive() {
      let errMsg = null;
      switch (this.interactiveType) {
        case INTERACTIVE_TYPE.LOCAL_FILE:
          if (!this.interactiveMsg || !this.interactiveURL) {
            errMsg = '请上传文件';
          }
          break;
        case INTERACTIVE_TYPE.STICKY_NOTE:
          if (!this.interactiveMsg) {
            errMsg = '请填写Notes信息';
          }
          break;
        case INTERACTIVE_TYPE.VIDEO:
          if (!this.interactiveURL) {
            errMsg = '请上传视频';
          }
          break;
        case INTERACTIVE_TYPE.WHITE_BOARD:
          if (!this.interactiveMsg) {
            errMsg = '请填写白板ID';
          }
          break;
        case INTERACTIVE_TYPE.HYPER_LINK:
          if (!this.interactiveURL) {
            errMsg = '请填写超链接';
          }
          break;
        case INTERACTIVE_TYPE.ONLINE_MUSIC:
          if (!this.interactiveURL) {
            errMsg = '请填写网络音乐链接';
          }
          break;
        case INTERACTIVE_TYPE.LOCAL_MUSIC:
          if (!this.interactiveURL) {
            errMsg = '请上传音乐';
          }
          break;
        case INTERACTIVE_TYPE.DEFAULT:
        default:
          break;
      }

      if (errMsg) {
        this.$message({
          type: 'error',
          message: errMsg,
        });
      }

      return !errMsg;
    },
    save() {
      if (!this.checkInteractive()) return;
      const { interactiveType, interactiveMsg, interactiveURL } = this;
      this.$emit('change', { interactiveType, interactiveMsg, interactiveURL });
    },
  },
};
</script>
