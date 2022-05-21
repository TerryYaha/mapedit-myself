<template>
  <div class="MaterialLibrary">
    <MaterialType :selectedMode="selectedMode" :changeMode="changeMode" />
    <div v-if="materialItems.length > 0" :class="{ 'library-warp': true, 'library-warp--in': isCollapsed }">
      <!-- 地板库 -->
      <MaterialFloors
        v-show="selectedMode === Mode.Floors"
        :item="floorItem"
        :selectedFloorMaterial="selectedFloorMaterial"
        :setFloorMaterial="setFloorMaterial"
      />
      <!-- 墙壁库 -->
      <MaterialWalls
        v-show="selectedMode === Mode.Walls"
        :item="wallItem"
        :selectedWallMaterial="selectedWallMaterial"
        :setWallMaterial="setWallMaterial"
      />
      <!-- 物件库 -->
      <MaterialObjects
        v-show="selectedMode === Mode.Objects"
        :item="objectItem"
        :selectedObjectMaterial="selectedObjectMaterial"
        :setObjectMaterial="setObjectMaterial"
      />
      <!-- 贴图库 -->
      <MaterialStickers
        v-show="selectedMode === Mode.Stickers"
        :item="stickerItem"
        :selectedStickerMaterial="selectedStickerMaterial"
        :setStickerMaterial="setStickerMaterial"
        :backgroundImage="backgroundImage"
        :addBackgroundImage="addBackgroundImage"
        :removeBackgroundImage="removeBackgroundImage"
        :personalStickers="personalStickers"
        :addPersonalSticker="addPersonalSticker"
        :removePersonalSticker="removePersonalSticker"
      />
      <!-- 特殊效果库 -->
      <MaterialTileEffects
        v-show="selectedMode === Mode.TileEffects"
        :item="tileEffectItem"
        :selectedTileEffectMaterial="selectedTileEffectMaterial"
        :setTileEffectMaterial="setTileEffectMaterial"
        :birthPointEnabled="birthPointEnabled"
        :transferPointEnabled="transferPointEnabled"
      />
    </div>
    <div>
      <MaterialBtn
        :isCollapsed="isCollapsed"
        :toggleCollapsed="toggleCollapsed"
      />
    </div>
  </div>
</template>

<script>
import { getMaterialItems } from '../../../../api/api';
import eventBus from "../../eventBus";
import { Mode } from "../../const";

import MaterialType from "./components/MaterialType.vue";
import MaterialBtn from "./components/MaterialBtn.vue";
import MaterialObjects from "./MaterialObjects.vue";
import MaterialFloors from "./MaterialFloors.vue";
import MaterialStickers from "./MaterialStickers.vue";
import MaterialWalls from "./MaterialWalls.vue";
import MaterialTileEffects from "./MaterialTileEffects.vue";

export default {
  components: {
    MaterialType,
    MaterialBtn,
    MaterialObjects,
    MaterialFloors,
    MaterialStickers,
    MaterialWalls,
    MaterialTileEffects,
  },
  props: {
    selectedMode: {
      type: String,
      required: true,
    },
    changeMode: {
      type: Function,
    },
    selectedFloorMaterial: {
      type: Object,
    },
    setFloorMaterial: {
      type: Function,
    },
    selectedWallMaterial: {
      type: Object,
    },
    setWallMaterial: {
      type: Function,
    },
    selectedObjectMaterial: {
      type: Object,
    },
    setObjectMaterial: {
      type: Function,
    },
    selectedStickerMaterial: {
      type: Object,
    },
    setStickerMaterial: {
      type: Function,
    },
    selectedTileEffectMaterial: {
      type: Object,
    },
    setTileEffectMaterial: {
      type: Function,
    },
    birthPointEnabled: {
      type: Boolean,
    },
    transferPointEnabled:{
      type:Boolean,
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
      Mode,

      // 素材列表（官方素材/个人素材）是否收起
      isCollapsed: false,
      // 所有物件项
      materialItems: [],
    };
  },
  computed: {
    floorItem() {
      return this.getItemByName("地板");
    },
    wallItem() {
      return this.getItemByName("墙壁");
    },
    objectItem() {
      return this.getItemByName("物件");
    },
    stickerItem() {
      return this.getItemByName("贴图");
    },
    tileEffectItem() {
      return this.getItemByName("地块效果");
    },
  },
  mounted() {
    this.fetchMaterialItems();
  },
  methods: {
    // 收起/展开素材库
    toggleCollapsed() {
      this.isCollapsed = !this.isCollapsed;

      // 素材库收起/展开渲染完成之后，通知canvas层更新宽高。
      this.$nextTick(function () {
        const materialListWidth = 264;
        // 收起时，画布左侧增加宽度；展开时，画布左侧减少宽度
        const deltaLeft = this.isCollapsed
          ? materialListWidth
          : -materialListWidth;
        eventBus.emit("ui:resizeCanvas", { deltaLeft });
      });
    },
    fetchMaterialItems() {
      getMaterialItems()
        .then((res) => {
          if (res.data.code === 200) {
            this.materialItems = res.data.data;
          } else {
            // TODO: handle error
          }
        })
        .catch(() => {
          // TODO: handle error
        });
    },
    getItemByName(name) {
      return this.materialItems.find((item) => item.name === name);
    },
  },
};
</script>

<style lang="scss" scoped>
.MaterialLibrary {
  height: 100%;
  display: flex;
  position: relative;
  z-index: 9;
  filter: drop-shadow(2px 0px 6px rgba(0, 0, 0, 0.04));
  .library-warp {
    overflow: hidden;
    width: 264px;
    height: 100%;
    background: #fff;
    position: relative;
  }
  .library-warp--in {
    width: 0;
  }
}
</style>
