<template>
  <div class="MaterialListStickers">
    <div
      class="MaterialListItem"
      v-for="item in objList"
      draggable="true"
      :key="item.id"
      :class="item.id === stickerMaterialId ? 'checked' : ''"
      @click="setStickerMaterial(item)"
      @dragstart="onDragStart($event, item)"
      @dragEnd="onDragEnd(sticker)"
    >
      <div class="img-wrap">
        <img class="img" :src="item.url" alt="" />
      </div>
      <div class="obj-title">
        <span>{{ formatName(item.name) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { TRANSPARENT_1PX } from '../../../const';

export default {
  props: {
    objList:{
        type:Array,
        default:() => []
    },
    selectedStickerMaterial: {
      type: Object,
    },
    setStickerMaterial: {
      type: Function,
    },
  },
  computed: {
    stickerMaterialId() {
      return this.selectedStickerMaterial?.id;
    },
  },
  mounted() {
    this.prepareTransparentImage();
  },
  methods: {
    onDragStart(e, sticker) {
      e.dataTransfer.setDragImage(this.dragImg, 0, 0);
      e.dataTransfer.setData('text/plain', sticker.url);
  
      this.setStickerMaterial(sticker);
    },
    onDragEnd(sticker) {
      // do nothing
    },
    prepareTransparentImage() {
      // 拖拽时使用透明图片代替默认图片
      this.dragImg = new Image();
      this.dragImg.src = TRANSPARENT_1PX;
    },
    formatName(name) {
      return name ? name.slice(0, 8) : '';
    },
  },
};
</script>

<style scoped lang="scss">
.MaterialListStickers {
  display: flex;
  justify-content: flex-start;
  align-items:center;
  flex-wrap: wrap;
  .MaterialListItem {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 104px;
    height: 128px;
    margin-bottom: 16px;
    margin-right: 16px;
    cursor: pointer;
    .img {
      width: 104px;
      height: 104px;
      object-fit: contain;
      border-radius: 3px;
    }
    .obj-title {
      font-size: 12px;
      color: #282c4a;
    }
  }
  .MaterialListItem:nth-of-type(2n+0){margin-right: 0;}
  .checked .img {
    outline: 2px solid #8F7EF4;
    outline-offset: 2px;
  }
  .MaterialListItem:not(.checked):hover .img {
    outline: 2px solid #B9ADFF;
    outline-offset: 2px;
  }
}
</style>
