<template>
  <div class="stickers">
    <UploadResource
      :type="2"
      :typeChild="2"
      :onProgress="handleBackgroundProgress"
      :onSuccess="handleBackgroundSuccess"
      :onError="handleBackgroundError"
    >
      <button hidden ref="backgroundTrigger"></button>
    </UploadResource>
    <UploadResource
      :type="2"
      :typeChild="1"
      :onProgress="handleStickerProgress"
      :onSuccess="handleStickerSuccess"
      :onError="handleStickerError"
    >
      <button hidden ref="stickerTrigger"></button>
    </UploadResource>
    <PersonalUploadButton
      class="stickers__add"
      :uploadSticker="uploadSticker"
      :uploadBackground="uploadBackground"
    />
    <el-scrollbar>
      <PersonalImageEmpty v-if="isEmpty" />
      <div v-else class="stickers__list">
        <PersonalImage
          v-if="background"
          :image="background"
          :isBackground="true"
          class="stickers__item"
          :onRemove="handleBackgroundRemove"
          @click="handleClickBackground(background)"
        />
        <PersonalImage
          v-for="sticker in reversedStickers"
          :key="sticker.uid"
          :image="sticker"
          :selected="isStickerSelected(sticker)"
          class="stickers__item"
          :onRemove="handleStickerRemove"
          @click="handleClickSticker(sticker)"
          :draggable="true"
          @dragstart="handleDragStart($event, sticker)"
          @dragEnd="handleDragEnd(sticker)"
        />
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { ElMessageBox } from 'element-plus';
import { ImageResourceSubtype, MESSAGE_BOX_CUSTOM_CLASS, OVERLAY_CUSTOM_CLASS, ResourceType, TRANSPARENT_1PX } from "../const";
import PersonalImage from "./PersonalImage.vue";
import PersonalUploadButton from "./PersonalUploadButton.vue";
import UploadResource from "./UploadResource.vue";
import PersonalImageEmpty from './PersonalImageEmpty.vue';
import { resourceToTileCategory, getUuid } from '../util';

export default {
  components: {
    PersonalImage,
    PersonalUploadButton,
    PersonalImageEmpty,
    UploadResource,
  },
  props: {
    selectedStickerMaterial: {
      type: Object,
    },
    setStickerMaterial: {
      type: Function,
    },
    backgroundImage: {
      type: Object,
    },
    addBackgroundImage: {
      type: Function,
    },
    removeBackgroundImage: {
      type: Function,
    },
    personalStickers: {
      type: Array,
    },
    addPersonalSticker: {
      type: Function,
    },
    removePersonalSticker: {
      type: Function,
    },
  },
  data() {
    return {
      background: null,
      stickers: [],
    };
  },
  computed: {
    isEmpty() {
      return this.background == null && this.stickers.length === 0;
    },
    reversedStickers() {
      return [...this.stickers].reverse();
    },
  },
  mounted() {
    this.registerEvents();
    this.prepareTransparentImage();

    if (this.backgroundImage) {
      const { id, name, url } = this.backgroundImage;
      this.background = {
        sticker: this.backgroundImage,
        uid: id,
        name,
        url,
        status: 'success',
      };
    }
    this.stickers = this.personalStickers.map((sticker) => {
      const { id, name, url } = sticker;
      return {
        sticker,
        uid: id,
        name,
        url,
        status: 'success',
      };
    });
  },
  beforeUnmount() {
    this.unregisterEvents();
  },
  methods: {
    registerEvents() {
      eventBus.on('ui:uploadSticker', this.uploadSticker);
      eventBus.on('ui:uploadBackground', this.uploadBackground);
    },
    unregisterEvents() {
      eventBus.off('ui:uploadSticker', this.uploadSticker);
      eventBus.off('ui:uploadBackground', this.uploadBackground);
    },
    uploadSticker() {
      this.$refs.stickerTrigger.click();
    },
    isStickerSelected(sticker) {
      if (sticker.status !== 'success') return false;

      return sticker.sticker.id === this.selectedStickerMaterial?.code;
    },
    handleClickSticker(sticker) {
      if (sticker.status !== 'success') return false;

      resourceToTileCategory(sticker.sticker).then((stickerMaterial) => {
        this.setStickerMaterial(stickerMaterial);
      });
    },
    handleStickerProgress(file) {
      if (file.url == null) {
        file.url = URL.createObjectURL(file.raw);
      }
      const index = this.stickers.findIndex(({ uid }) => uid === file.uid);
      if (index === -1) {
        this.stickers.push(file);
        return;
      }
      this.stickers.splice(index, 1, file);
    },
    handleStickerSuccess(file) {
      const { url } = file.response.data;
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      file.url = url;
      file.sticker = {
        // 因为上传资源库的接口返回的 resourceId 对于 md5 相同的文件来说是相同的。所以
        // 前端给每一个上传的资源生成一个唯一的 uuid
        id: getUuid(),
        name: file.name,
        url,
        type: ResourceType.Image,
        typeChild: ImageResourceSubtype.Sticker,
      };
      const index = this.stickers.findIndex(({ uid }) => uid === file.uid);
      if (index === -1) {
        this.stickers.push(file);
        return;
      }
      this.stickers.splice(index, 1, file);
      this.addPersonalSticker(file.sticker);
    },
    handleStickerError(file) {
      if (file.url == null) {
        file.url = URL.createObjectURL(file.raw);
      }
      const index = this.stickers.findIndex(({ uid }) => uid === file.uid);
      if (index === -1) {
        this.stickers.push(file);
        return;
      }
      this.stickers.splice(index, 1, file);
    },
    async handleStickerRemove(file) {
      const index = this.stickers.findIndex(({ uid }) => uid === file.uid);
      if (index === -1) return;

      if (file.status === 'success') {
        try {
          await ElMessageBox.confirm(
            '图片删除后无法找回哦，已经添加在地图中的贴图也将被删除，您确定要删除吗？',
            '操作提示',
            {
              confirmButtonText: '取消',
              cancelButtonText: '继续删除',
              type: 'warning',
              distinguishCancelAndClose: true,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
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

      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      this.stickers.splice(index, 1);
      // 删除选中的贴图时，设置选中贴图为null
      if (file.status === 'success' && file.sticker.id === this.selectedStickerMaterial?.code) {
        this.setStickerMaterial(null);
      }
      this.removePersonalSticker(file.sticker);
    },
    async uploadBackground() {
      if (this.background) {
        const { status } = this.background;
        if (status === 'ready' || status === 'uploading') {
          return;
        }

        try {
          await ElMessageBox.confirm(
            '只能上传一张背景图，现有的背景图将被替换。确认要上传吗？',
            '操作提示',
            {
              confirmButtonText: '取消',
              cancelButtonText: '上传并替换',
              type: 'warning',
              distinguishCancelAndClose: true,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
          );
          // 取消
          return;
        } catch (action) {
          if (action === 'cancel') {
            // 上传并替换
          } else {
            // 关闭
            return;
          }
        }
      }
      this.$refs.backgroundTrigger.click();
    },
    handleBackgroundProgress(file) {
      if (this.background?.status === 'success') {
        this.backgroundToReplace = this.background;
      }

      if (file.url == null) {
        file.url = URL.createObjectURL(file.raw);
      }
      this.background = file;
    },
    handleBackgroundSuccess(file) {
      this.backgroundToReplace = null;

      const { url } = file.response.data;
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      file.url = url;
      file.sticker = {
        id: getUuid(),
        name: file.name,
        url,
        type: ResourceType.Image,
        typeChild: ImageResourceSubtype.Sticker,
      };
      this.background = file;
      this.addBackgroundImage(file.sticker);
    },
    handleBackgroundError(file) {
      if (this.background?.status === 'success') {
        this.backgroundToReplace = this.background;
      }

      if (file.url == null) {
        file.url = URL.createObjectURL(file.raw);
      }
      this.background = file;

      if (this.backgroundToReplace) {
        setTimeout(() => {
          this.background = this.backgroundToReplace;
          this.backgroundToReplace = null;
        }, 1000);
      }
    },
    async handleBackgroundRemove(file) {
      if (file.status === 'success') {
        try {
          await ElMessageBox.confirm(
            '图片删除后无法找回哦，已经添加在地图中的背景图也将被删除，您确定要删除吗？',
            '操作提示',
            {
              confirmButtonText: '取消',
              cancelButtonText: '继续删除',
              type: 'warning',
              distinguishCancelAndClose: true,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
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

      if (file.url && file.url.startsWith('blob:')) {
        URL.revokeObjectURL(file.url);
      }
      this.background = null;
      this.removeBackgroundImage(file.sticker);
    },
    handleClickBackground(file) {
      this.addBackgroundImage(file.sticker);
    },
    handleDragStart(e, sticker) {
      if (sticker.status !== 'success') return;

      e.dataTransfer.setDragImage(this.dragImg, 0, 0);
      e.dataTransfer.setData('text/plain', sticker.sticker?.url);
  
      resourceToTileCategory(sticker.sticker).then((stickerMaterial) => {
        this.setStickerMaterial(stickerMaterial);
      });
    },
    handleDragEnd(sticker) {
      // do nothing
    },
    prepareTransparentImage() {
      // 拖拽时使用透明图片代替默认图片
      this.dragImg = new Image();
      this.dragImg.src = TRANSPARENT_1PX;
    },
  },
};
</script>

<style scoped>
.stickers {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stickers__add {
  flex: none;
  margin: 16px 16px 0;
}

.stickers__list {
  flex: 1;
  padding: 16px 20px 0;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
}

.stickers__item {
  margin-bottom: 16px;
}
.stickers__item:nth-child(2n+1) {
  margin-right: 16px;
}
</style>
