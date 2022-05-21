<template>
  <div class="w-screen h-screen flex flex-col items-stretch editor">
    <div class="flex-none realtive z-50">
      <HeadTool
        :eventName="eventName"
        :spaceName="spaceName"
        :selectedTool="selectedTool"
        :changeTool="changeTool"
        :navigateBack="navigateBack"
        :saveMap="saveMap"
        :nowTime="lastSavedTime"
        :isSaving="isSaving"
        :warnText="warnText"
        :isDisabledBtn="isDisabled"
        :uploadSticker="uploadSticker"
        :uploadBackground="uploadBackground"
      />
    </div>
    <div class="flex-1 flex items-stretch overflow-hidden">
      <div class="flex-none">
        <MaterialLibrary
          v-if="resourcesLoaded"
          :selectedMode="selectedMode"
          :changeMode="changeMode"
          :selectedFloorMaterial="selectedFloorMaterial"
          :setFloorMaterial="setFloorMaterial"
          :selectedWallMaterial="selectedWallMaterial"
          :setWallMaterial="setWallMaterial"
          :selectedObjectMaterial="selectedObjectMaterial"
          :setObjectMaterial="setObjectMaterial"
          :selectedStickerMaterial="selectedStickerMaterial"
          :setStickerMaterial="setStickerMaterial"
          :selectedTileEffectMaterial="selectedTileEffectMaterial"
          :setTileEffectMaterial="setTileEffectMaterial"
          :birthPointEnabled="birthPointEnabled"
          :transferPointEnabled="transferPointEnabled"
          :personalStickers="personalStickers"
          :addPersonalSticker="addPersonalSticker"
          :removePersonalSticker="removePersonalSticker"
          :backgroundImage="backgroundSticker"
          :addBackgroundImage="addBackgroundImage"
          :removeBackgroundImage="removeBackgroundImage"
        />
      </div>
      <div class="flex-1 overflow-hidden">
        <LayerMenu
          :options="contextMenuOptions"
          :visible="contextMenuVisible"
          :left="contextMenuLeft"
          :top="contextMenuTop"
          :onSelect="selectContextMenu"
          :onClose="closeContextMenu"
        >
          <Canvas />
        </LayerMenu>
      </div>
      <div class="flex-none" ref="PropertyBox">
        <div class="help" :style="{ right: propertyWidth + 24 + 'px' }">
          <helpCenter />
        </div>
        <Property
          :object="selectedObject"
          :updateTilemap="updateTilemap"
          :updateImage="updateImage"
          :updateText="updateText"
          :canAddInteractive="canAddInteractive"
          :isOnline="isOnline"
          ref="Property"
        />
      </div>
    </div>
    <SelectSpaceMessage
    ref="selectSpaceRef"
      :setSpaceTransfer="setSpaceTransfer"
      :selectedSpaceTransfer="selectedSpaceTransfer"
      :clearSelectedSpace="clearSelectedSpace"
      :confirmFn="confirmSpaceFn"
    />
  </div>
  <LoadingOverlay v-if="loading" />
</template>

<script>
import { ElMessageBox } from "element-plus";
import {
  getMapJson,
  queryMapData,
  updateMapData,
  deleteMemberResource,
} from "../../api/api";
import LoadingOverlay from "./components/LoadingOverlay.vue";
import HeadTool from "./components/Toolbar/HeadTool.vue";
import MaterialLibrary from "./components/MaterialLibrary/MaterialLibrary.vue";
import Property from "./components/Property.vue";
import Canvas from "./components/Canvas.vue";
import eventBus from "./eventBus";
import BusinessLogic from "./businessLogic";
import { Map, TileCategory, Tilemap, TileInfo } from "./model";
import ToolManager from "./tools/toolManager";
import { updateMap } from "./save";
import {
  layersDesc,
  Tool,
  Mode,
  SavingStatus,
  NEW_LAYERS,
  NEW_LAYER_LABEL,
  TILE_EFFECT_OPACITY,
  ACTIVE_TILE_EFFECT_OPACITY,
  nonIsolatedLayersDesc,
  isolatedLayersDesc,
  USER_LAYER,
  OBJECT_TYPE,
MESSAGE_BOX_CUSTOM_CLASS,
OVERLAY_CUSTOM_CLASS,
} from "./const";
import { migrateFromCanvasJson } from "./migration";
import {
  handleError,
  getImageSizeAsync,
  getUuid,
  getContextMenuOptions,
  completeImageMissingFields,
  completeTextMissingFields,
  trimEdgeObstacles,
  compositeListMapsSequentially,
} from "./util";
import { resetTilemapszIndex, resetTextorImgzIndex } from "./adaptMapData";
import { importExternalScript, nowTimeByMinute } from "../../assets/js/tool";
import LayerMenu from "./components/LayerMenu.vue";
import Message from "./components/base/toast/index";
import { formatCompositLists } from "./group";
import helpCenter from "./components/base/helpCenter/helpCenter.vue";
import { convertResourceToBackgroundAsync } from "./convert";
import ToolSetting from './tools/toolSetting';
import SelectSpaceMessage from './components/SelectSpaceMessage.vue'

let enterTime = +new Date();
let lastSaveTime = +new Date();

export default {
  name: "MapEditor",
  components: {
    LoadingOverlay,
    HeadTool,
    MaterialLibrary,
    Property,
    Canvas,
    LayerMenu,
    helpCenter,
    SelectSpaceMessage,
  },
  data() {
    return {
      Tool,
      loading: true,
      disabled: true,
      // 新的数据
      // 云现场名称
      eventName: "云现场名称",
      // 地图名称
      spaceName: "地图名称",
      // 选择的工具
      selectedTool: Tool.Select,
      // 地图保存的状态
      savingStatus: SavingStatus.Saved,
      // 上一次地图保存的时间
      lastSavedTime: null,
      // 保存状态
      isSaving: false,
      //地图保存错误提示
      warnText: "",
      // 离线/在线
      isOnline: navigator.onLine,
      // 保存button按钮是否失效
      isDisabled: false,
      // 选择的编辑模式
      selectedMode: Mode.Floors,
      selectedFloorMaterial: null,
      selectedWallMaterial: null,
      selectedObjectMaterial: null,
      selectedStickerMaterial: null,
      selectedTileEffectMaterial: null,
      selectedSpaceTransfer:null,
      // 传送门地图信息
      tmpTileInfo:[],
      birthPointEnabled: true,
      transferPointEnabled:true,
      // 选中的对象
      selectedObject: null,
      // 上下文菜单
      contextMenuOptions: [],
      contextMenuVisible: false,
      contextMenuLeft: 0,
      contextMenuTop: 0,
      contextObject: null,
      contextObjectList: [],
      //
      propertyWidth: 0,
      // 个人贴图素材列表
      personalStickers: [],
      // 背景图素材
      backgroundSticker: null,
      resourcesLoaded: false,
    };
  },
  async mounted() {
    // 防止横向scroll时触发浏览器的后退/前进行为
    document.body.style.overscrollBehaviorX = "none";
    document.body.style.msScrollChainingX = "none";

    eventBus.on("ui:useSelectTool", this.useSelectTool);
    eventBus.on("ui:changeMode", this.changeMode);
    eventBus.on("ui:enableBirthPoint", this.enableBirthPoint);
    eventBus.on("ui:disableBirthPoint", this.disableBirthPoint);
    eventBus.on("ui:openContextMenu", this.openContextMenu);
    eventBus.on("ui:closeContextMenu", this.closeContextMenu);
    eventBus.on("ui:listenMapData", (saveStatus) => {
      this.updateSavingStatus(saveStatus);
    });
    eventBus.on("ui:showSelectSpaceMessage",this.showSelectSpaceMessage);
    window.addEventListener("online", this.updateOnlineStatus);
    window.addEventListener("offline", this.updateOnlineStatus);
    window.addEventListener("beforeunload", this.beforeunloadHandler);
    eventBus.on("ui:selectObject", this.selectObject);
    eventBus.on("ui:unselectObject", this.unselectObject);
    importExternalScript("./third/fabric.min.js").then(() => {
      this.initialize();
    });

    const { spaceId, conferenceId } = this.$route.query;
    this.transferPointEnabled = ! await this.$refs['selectSpaceRef'].getIsTransfer();
    console.log("this.transferPointEnabled===>",this.transferPointEnabled)
    try {
      //初始化进入场景的用户埋点uid和环境
      const platformNo = JSON.parse(
        sessionStorage.getItem("userInfo")
      ).platformNo;
      initPamrams(platformNo, cocosDEV);
    } catch (error) {
      console.log("error =>", error);
    }
    try {
      enterTime = +new Date();
      wsUserLogger(
        "mapeditor:enter",
        "mapeditor:enter",
        "enter",
        "mapeditor:enter",
        { eventid: conferenceId, spaceid: spaceId }
      );
    } catch (error) {}
  },
  beforeUnmount() {
    this.userLeaveTrace();
    document.body.style.overscrollBehaviorX = "auto";
    document.body.style.msScrollChainingX = "auto";
    eventBus.off("ui:useSelectTool", this.useSelectTool);
    eventBus.off("ui:changeMode", this.changeMode);
    eventBus.off("ui:enableBirthPoint", this.enableBirthPoint);
    eventBus.off("ui:disableBirthPoint", this.disableBirthPoint);
    eventBus.off("ui:openContextMenu", this.openContextMenu);
    eventBus.off("ui:closeContextMenu", this.closeContextMenu);
    eventBus.off("ui:selectObject", this.selectObject);
    eventBus.off("ui:unselectObject", this.unselectObject);
    eventBus.off("ui:showSelectSpaceMessage",this.showSelectSpaceMessage);
    this.dispose();
  },
  updated() {
    this.propertyWidth = this.$refs.PropertyBox.clientWidth;
  },
  methods: {
    updateOnlineStatus(e) {
      const { type } = e;
      this.isOnline = type === "online";
      this.isOnline
        ? Message({
            type: "success",
            message: "当前网络已连接",
          })
        : Message({
            type: "warning",
            message: "对不起，当前网络已中断，请重新连接哦",
          });
      if (this.loading) {
        if (this.isOnline) {
          importExternalScript("./third/fabric.min.js").then(() => {
            this.initialize();
          });
        }
      }
    },
    confirmSpaceFn(){ //传送门目标地图
      if(!this.selectedSpaceTransfer){
          Message({
            type: "warning",
            message: "请选择一个地图哦",
        });
        return
      }
      const { conferenceId } = this.$route.query;
      const targetSpace = {
        eventId:conferenceId,
        spaceId:this.selectedSpaceTransfer.id,
      }
      if(this.selectObject.isPortal){
        // debugger
      }
      let newTileInfo = {...this.tmpTileInfo.tileInfo};
      newTileInfo.targetMap = targetSpace;
      this.businessLogic.addEffect(newTileInfo,this.tmpTileInfo.point);
      this.$refs['selectSpaceRef'].visible = false;
    },
    showSelectSpaceMessage(tileInfo){
      this.$refs['selectSpaceRef'].visible = true
      this.tmpTileInfo = tileInfo;
      this.useSelectTool();
    },
    setSpaceTransfer(newSpace){
      this.selectedSpaceTransfer = newSpace;
    },
    clearSelectedSpace(){
      this.selectedSpaceTransfer = null;
    },
    updateSavingStatus(saveStatus) {
      this.savingStatus = saveStatus;
      this.isDisabled = false;
    },
    beforeunloadHandler(event) {
      if (this.savingStatus === SavingStatus.NotSaved) {
        event = event || window.event;
        if (event) {
          event.returnValue = "关闭提示";
        }
        return "关闭提示";
      }
    },
    changeTool(newTool) {
      if (newTool === this.selectedTool) return;
      if (newTool === Tool.Select) {
        this.useSelectTool();
      } else if (newTool === Tool.Copy) {
        // TODO: 第二阶段做
      } else if (newTool === Tool.Eraser) {
        this.useEraserTool();
      } else if (newTool === Tool.Hand) {
        this.useHandTool();
      } else if (newTool === Tool.InsertText) {
        this.useInsertTextTool();
      }
    },
    useSelectTool(objectId) {
      const data = { zIndexList: layersDesc, selectedObjectId: objectId };
      this.toolManager.registerTool({ type: Tool.Select, data });
      this.selectedTool = Tool.Select;
      this.selectedStickerMaterial = null;
      this.selectedFloorMaterial = null;
      this.selectedObjectMaterial = null;
      this.selectedTileEffectMaterial = null;
      this.selectedWallMaterial = null;
      if (this.selectedMode === Mode.TileEffects) {
        this.unhighlightEffects();
      }
    },
    useCopyTool(mode, tileCategory) {
      if (mode === Mode.Floors) {
        const tileInfo = new TileCategory(tileCategory).toTileInfo();
        this.toolManager.registerTool({
          type: Tool.InsertFloor,
          data: tileInfo,
        });
        this.selectedTool = Tool.Copy;
        this.selectedStickerMaterial = null;
        this.selectedObjectMaterial = null;
        this.selectedTileEffectMaterial = null;
        this.selectedWallMaterial = null;
      } else if (mode === Mode.TileEffects) {
        const tileInfo = new TileCategory(tileCategory).toTileInfo();
        this.toolManager.registerTool({
          type: Tool.InsertEffect,
          data: tileInfo,
        });
        this.selectedTool = Tool.Copy;
        this.selectedStickerMaterial = null;
        this.selectedFloorMaterial = null;
        this.selectedObjectMaterial = null;
        this.selectedWallMaterial = null;
        this.highlightEffects(this.selectedTileEffectMaterial.id);
      } else if (mode === Mode.Wall) {
        const tileInfo = new TileCategory(tileCategory).toTileInfo();
        this.toolManager.registerTool({
          type: Tool.InsertWall,
          data: tileInfo,
        });
        this.selectedTool = Tool.Copy;
        this.selectedStickerMaterial = null;
        this.selectedFloorMaterial = null;
        this.selectedObjectMaterial = null;
        this.selectedTileEffectMaterial = null;
      } else {
        const tileInfo = new TileCategory(tileCategory).toTileInfo();
        this.toolManager.registerTool({ type: Tool.Copy, data: tileInfo });
        this.selectedTool = Tool.Copy;
        this.selectedStickerMaterial = null;
        this.selectedFloorMaterial = null;
        this.selectedTileEffectMaterial = null;
        this.selectedWallMaterial = null;
      }
    },
    useEraserTool() {
      const zIndexList =
        this.selectedMode === Mode.TileEffects
          ? isolatedLayersDesc
          : nonIsolatedLayersDesc;
      this.toolManager.registerTool({ type: Tool.Eraser, data: zIndexList });
      this.selectedTool = Tool.Eraser;
      this.selectedStickerMaterial = null;
      this.selectedFloorMaterial = null;
      this.selectedObjectMaterial = null;
      this.selectedTileEffectMaterial = null;
      this.selectedWallMaterial = null;
      if (this.selectedMode === Mode.TileEffects) {
        this.unhighlightEffects();
      }
    },
    useHandTool() {
      this.toolManager.registerTool({ type: Tool.Hand });
      this.selectedTool = Tool.Hand;
      this.selectedStickerMaterial = null;
      this.selectedFloorMaterial = null;
      this.selectedObjectMaterial = null;
      this.selectedTileEffectMaterial = null;
      this.selectedWallMaterial = null;
      if (this.selectedMode === Mode.TileEffects) {
        this.unhighlightEffects();
      }
    },
    useInsertStickerTool(sticker) {
      const imageURL = sticker.url;
      getImageSizeAsync(imageURL).then(({ width, height }) => {
        const imageInfo = {
          id: sticker.id,
          imageURL,
          width,
          height,
          imageWidth: width,
          imageHeight: height,
          name: sticker.name,
        };
        this.toolManager.registerTool({
          type: Tool.InsertSticker,
          data: imageInfo,
        });
        this.selectedTool = Tool.InsertSticker;
        this.selectedFloorMaterial = null;
        this.selectedObjectMaterial = null;
        this.selectedTileEffectMaterial = null;
        if (this.selectedMode === Mode.TileEffects) {
          this.unhighlightEffects();
        }
      });
    },
    useInsertTextTool() {
      this.toolManager.registerTool({ type: Tool.InsertText });
      this.selectedTool = Tool.InsertText;
      this.selectedStickerMaterial = null;
      this.selectedFloorMaterial = null;
      this.selectedObjectMaterial = null;
      this.selectedTileEffectMaterial = null;
      if (this.selectedMode === Mode.TileEffects) {
        this.unhighlightEffects();
      }
    },
    changeMode(newMode) {
      if (newMode === this.selectedMode) return;
      const prevMode = this.selectedMode;
      this.selectedMode = newMode;
      if (newMode === Mode.TileEffects) {
        this.enterEffectsMode();
      } else if (
        newMode !== Mode.TileEffects &&
        prevMode === Mode.TileEffects
      ) {
        this.exitEffectsMode();
      }
    },
    enableBirthPoint() {
      this.birthPointEnabled = true;
    },
    disableBirthPoint() {
      this.useSelectTool();
      this.birthPointEnabled = false;
    },
    // 进入效果模式
    enterEffectsMode() {
      this.useSelectTool();
      this.canvas.unselectObject();
      this.canvas.addEffectMask();
      const tilemaps = this.store.tilemaps;
      const flagTilemapIds = tilemaps
        .filter(({ zIndex }) => zIndex === NEW_LAYERS.FLAG_OBJ)
        .map(({ id }) => id);
      flagTilemapIds.forEach((id) => {
        this.canvas.updateObject({ id, opacity: TILE_EFFECT_OPACITY }, false);
      });
      this.canvas.renderAll();
    },
    // 退出效果模式
    exitEffectsMode() {
      this.useSelectTool();
      this.canvas.unselectObject();
      this.canvas.removeEffectMask();
      const tilemaps = this.store.tilemaps;
      const flagTilemapIds = tilemaps
        .filter(({ zIndex }) => zIndex === NEW_LAYERS.FLAG_OBJ)
        .map(({ id }) => id);
      flagTilemapIds.forEach((id) => {
        this.canvas.updateObject({ id, opacity: 0 }, false);
      });
      this.canvas.renderAll();
    },
    setFloorMaterial(newFloorMaterial) {
      this.selectedFloorMaterial = newFloorMaterial;
      if (newFloorMaterial) {
        this.useCopyTool(Mode.Floors, newFloorMaterial);
      } else {
        this.useSelectTool();
      }
    },
    setWallMaterial(newWallMaterial) {
      this.selectedWallMaterial = newWallMaterial;
      if (newWallMaterial) {
        this.useCopyTool(Mode.Wall, newWallMaterial);
      } else {
        this.useSelectTool();
      }
    },
    setObjectMaterial(newObjectMaterial) {
      this.selectedObjectMaterial = newObjectMaterial;
      if (newObjectMaterial) {
        this.useCopyTool(Mode.Objects, newObjectMaterial);
      } else {
        this.useSelectTool();
      }
    },
    setStickerMaterial(newStickerMaterial) {
      this.selectedStickerMaterial = newStickerMaterial;
      if (newStickerMaterial) {
        this.useInsertStickerTool(newStickerMaterial);
      } else {
        this.useSelectTool();
      }
    },
    setTileEffectMaterial(newTileEffectMaterial) {
      this.selectedTileEffectMaterial = newTileEffectMaterial;
      if (newTileEffectMaterial) {
        this.useCopyTool(Mode.TileEffects, newTileEffectMaterial);
      } else {
        this.useSelectTool();
      }
    },
    highlightEffects(materialId) {
      const tilemaps = this.store.tilemaps;
      const flagTilemaps = tilemaps.filter(
        ({ zIndex }) => zIndex === NEW_LAYERS.FLAG_OBJ
      );
      flagTilemaps.forEach(({ id, tileID }) => {
        const opacity =
          tileID === materialId
            ? ACTIVE_TILE_EFFECT_OPACITY
            : TILE_EFFECT_OPACITY;
        this.canvas.updateObject({ id, opacity }, false);
      });
      this.canvas.renderAll();
    },
    unhighlightEffects() {
      const tilemaps = this.store.tilemaps;
      const flagTilemapIds = tilemaps
        .filter(({ zIndex }) => zIndex === NEW_LAYERS.FLAG_OBJ)
        .map(({ id }) => id);
      flagTilemapIds.forEach((id) => {
        this.canvas.updateObject({ id, opacity: TILE_EFFECT_OPACITY }, false);
      });
      this.canvas.renderAll();
    },
    openContextMenu({ clientX, clientY, object, objectList }) {
      this.contextMenuOptions = getContextMenuOptions(object, objectList);
      this.contextMenuVisible = true;
      this.contextMenuLeft = clientX;
      this.contextMenuTop = clientY;
      this.contextObject = object;
      this.contextObjectList = objectList;
    },
    adjustContextMenuPosition(left, top) {
      if (height + targetPosition.top >= window.innerHeight + window.scrollY) {
        const targetTop = targetPosition.top - height;
        if (targetTop > window.scrollY) {
          targetPosition.top = targetTop;
        }
      }
      if (width + targetPosition.left >= window.innerWidth + window.scrollX) {
        const targetWidth = targetPosition.left - width;
        if (targetWidth > window.scrollX) {
          targetPosition.left = targetWidth;
        }
      }
    },
    closeContextMenu() {
      this.contextMenuOptions = [];
      this.contextMenuVisible = false;
      this.contextMenuLeft = 0;
      this.contextMenuTop = 0;
      this.contextObject = null;
      this.contextObjectList = [];
    },
    selectContextMenu(menuKey) {
      this.executeContextMenuAction(
        menuKey,
        this.contextObject,
        this.contextObjectList
      );
      this.contextMenuOptions = [];
      this.contextMenuVisible = false;
      this.contextMenuLeft = 0;
      this.contextMenuTop = 0;
      this.contextObject = null;
      this.contextObjectList = [];
    },
    async executeContextMenuAction(menuKey, object, objectList) {
      const { id } = object;
      const highestObject = objectList[objectList.length - 1];
      const lowestObject = objectList[0];
      const index = objectList.findIndex((obj) => obj.id === id);
      const higherObject = objectList[index + 1];
      const lowerObject = objectList[index - 1];
      switch (menuKey) {
        case "bringToFront":
          this.businessLogic.moveAbove(id, highestObject.id);
          break;
        case "bringForward":
          this.businessLogic.moveAbove(id, higherObject.id);
          break;
        case "sendBackwards":
          this.businessLogic.moveBelow(id, lowerObject.id);
          break;
        case "sendToBack":
          this.businessLogic.moveBelow(id, lowestObject.id);
          break;
        case "delete":
          const canRemove = await this.businessLogic.canRemoveTilemap(id);
          if (canRemove) {
            this.businessLogic.removeObject(id);
            this.businessLogic.unselectObject();
          }
          break;
        default:
          return;
      }
    },
    selectObject(object) {
      this.selectedObject = object;
      // debugger
      // if(this.selectedObject.isPortal){
      //   this.$refs['selectSpaceRef'].visible = true;
      //   this.useSelectTool();
      // }
    },
    unselectObject() {
      this.selectedObject = null;
    },
    updateTilemap(id, data) {
      this.businessLogic.updateTilemap(id, data);
      const tilemap = this.store.getObject(id);
      this.updateObject(tilemap);
      this.updateTileInfo(tilemap);
    },
    updateTileInfo(tilemap) {
      const { currentTool } = this.toolManager;
      if (currentTool && currentTool instanceof ToolSetting) {
        const {
          name,
          imageURL,
          image,
          width,
          height,
          imagewidth,
          imageheight,
          tileNums,
          isCollider,
          isMaskPlayer,
        } = tilemap;
        const newTileInfo = new TileInfo({
          ...currentTool.tileInfo,
          name,
          imageURL,
          image,
          width,
          height,
          imagewidth,
          imageheight,
          tileNums,
          isCollider,
          isMaskPlayer,
        });
        currentTool.updateTileInfo(newTileInfo);
      } 
    },
    updateImage(id, data) {
      this.businessLogic.updateImage(id, data);
      const image = this.store.getObject(id);
      this.updateObject(image);
    },
    updateText(id, data) {
      this.businessLogic.updateText(id, data);
      const text = this.store.getObject(id);
      this.updateObject(text);
    },
    updateObject(object) {
      if (this.selectedObject && this.selectedObject.id === object.id) {
        this.selectedObject = Object.assign({}, object);
      }
    },
    uploadSticker() {
      this.changeMode(Mode.Stickers);
      eventBus.emit("ui:uploadSticker");
    },
    uploadBackground() {
      this.changeMode(Mode.Stickers);
      eventBus.emit("ui:uploadBackground");
    },
    addPersonalSticker(sticker) {
      const index = this.personalStickers.findIndex(
        ({ id }) => id === sticker.id
      );
      if (index > -1) return;
      this.personalStickers.push(sticker);
      // 用户资源发生改变时，触发地图数据变化，因为用户资源存储在json中
      this.updateSavingStatus(SavingStatus.NotSaved);
    },
    removePersonalSticker(sticker) {
      const index = this.personalStickers.findIndex(
        ({ id }) => id === sticker.id
      );
      if (index === -1) return;
      this.personalStickers.splice(index, 1);
      const objectsToRemove = this.store.objects.filter(
        ({ userLayer, materialId }) =>
          userLayer === USER_LAYER.FREE_OBJ && materialId === sticker.id
      );
      objectsToRemove.forEach(({ id }) => {
        this.businessLogic.removeObject(id);
      });
      this.updateSavingStatus(SavingStatus.NotSaved);
      Message({
        type: "success",
        message: "已删除",
      });
    },
    async addBackgroundImage(backgroundImage) {
      const hasBackground = this.businessLogic.hasBackground();
      // 地图有背景图，替换背景素材，替换地图背景图
      if (hasBackground) {
        if (backgroundImage.id !== this.backgroundSticker.id) {
          const backgroundStickerToDelete = this.backgroundSticker;
          this.backgroundSticker = backgroundImage;
          try {
            const background = await convertResourceToBackgroundAsync(
              backgroundImage
            );
            this.businessLogic.replaceBackground(background);
          } catch (err) {
            this.showBackgroundErrorDialog();
          }
        }
        // 地图没有背景图，添加/替换背景素材，添加地图背景图
      } else {
        this.backgroundSticker = backgroundImage;
        try {
          const background = await convertResourceToBackgroundAsync(
            backgroundImage
          );
          this.businessLogic.addBackground(background);
        } catch (err) {
          this.showBackgroundErrorDialog();
        }
      }
      this.updateSavingStatus(SavingStatus.NotSaved);
    },
    showBackgroundErrorDialog() {
      ElMessageBox.alert(
        "添加背景图失败。你可在左侧导航栏>贴图>个人素材中点击“背景图”重新添加",
        "操作提示",
        {
          confirmButtonText: "知道了",
          showClose: false,
          customClass: MESSAGE_BOX_CUSTOM_CLASS,
          modalClass: OVERLAY_CUSTOM_CLASS,
        },
      );
    },
    removeBackgroundImage(image) {
      if (image.id !== this.backgroundSticker.id) return;
      this.backgroundSticker = null;
      this.businessLogic.removeBackground();
      this.updateSavingStatus(SavingStatus.NotSaved);
      Message({
        type: "success",
        message: "已删除",
      });
    },
    async loadMapData(spaceId, conferenceId) {
      // TODO: handle error
      const params = {
        pathID: { id: spaceId },
        queryID: { id: conferenceId },
      };
      const res1 = await queryMapData(params);
      if (res1.data.code === 200) {
        const { eventName, spaceName, jsonUrl: url } = res1.data.data;
        this.eventName = eventName;
        this.spaceName = spaceName;
        const res2 = await getMapJson(url);
        if (res2.status === 200) {
          const mapData = res2.data;
          // 旧数据width，height可能存的字符串格式
          mapData.width = parseInt(mapData.width, 10);
          mapData.height = parseInt(mapData.height, 10);
          return mapData;
        }
      }
    },
    async initialize() {
      const {spaceId, conferenceId} = this.$route.query;
      this.mapData = await this.loadMapData(spaceId, conferenceId);
      const { width, height, version, backgroundSticker, personalStickers } =
        this.mapData;
      this.backgroundSticker = backgroundSticker || null;
      this.personalStickers = personalStickers || [];
      // TODO: 优化
      this.resourcesLoaded = true;

      eventBus.on("canvas:initialized", this.handleCanvasInitialized);
      eventBus.emit("ui:initializeCanvas", { width, height });
      this.isDisabled = version === 1 ? false : true;
      // debug
      window.store = this.store;
      window.businessLogic = this.businessLogic;
      window.toolManager = this.toolManager;
    },
    dispose() {
      eventBus.off("canvas:initialized", this.handleCanvasInitialized);
      eventBus.off("ui:listenMapData", (saveStatus) => {
        this.updateSavingStatus(saveStatus);
      });
      window.removeEventListener("online", this.updateOnlineStatus);
      window.removeEventListener("offline", this.updateOnlineStatus);
      window.removeEventListener("beforeunload", this.beforeunloadHandler);
      this.toolManager?.dispose();
    },
    handleCanvasInitialized({ canvas }) {
      this.canvas = canvas;
      const { width, height, canvasJson } = this.mapData;
      this.canvas.addGrid({ width, height });
      let { backgroundImage, objects, tilemaps, images, texts, version } =
        this.mapData;
      // 迁移旧的的地图数据格式到新的地图数据格式
      if (!tilemaps || !images || !texts) {
        const data = migrateFromCanvasJson(canvasJson);
        tilemaps = data.tilemaps;
        images = data.images;
        texts = data.texts;
      }

      if (!version || version === 1) {
        console.log("====tilemaps====");
        tilemaps && resetTilemapszIndex(tilemaps);

        console.log("====images====");
        if (images) {
          images = images.filter(({ zIndex }) => zIndex !== "");
          resetTextorImgzIndex(images);
        }

        console.log("====texts====");
        if (texts) {
          texts = texts.filter(({ zIndex }) => zIndex !== "");
          resetTextorImgzIndex(texts);
        }
      }

      if (objects === undefined) {
        images.forEach((image) => completeImageMissingFields(image));
        texts.forEach((text) => completeTextMissingFields(text));
        objects = [...tilemaps, ...images, ...texts].sort(
          (a, b) => a.zIndex - b.zIndex
        );
      }

      // TODO: 临时修复地图v2版本旧数据缺少正在开发中的新功能对应的字段
      // TODO: 所有新功能完成后，移除这里的修复，并完善v1->v2的数据迁移
      objects.forEach((object) => {
        const isTilemap =
          object.zIndex === NEW_LAYERS.OBJ_ABOVE_AVATAR ||
          object.zIndex === NEW_LAYERS.OBJ_BELOW_AVATAR;
        if (isTilemap && object.spin == null) {
          object.spin = {
            status: false,
            images: [],
          };
        }
      });

      this.store = new Map();

      const getMode = () => {
        return this.selectedMode;
      };
      this.businessLogic = new BusinessLogic({
        store: this.store,
        width,
        height,
        canvas,
        getMode,
      });
      const allObjects = backgroundImage
        ? [backgroundImage, ...objects]
        : objects;
      this.businessLogic
        .restore(allObjects)
        .then(this.handleRestoreSuccess)
        .catch(this.handleRestoreFail);
      this.birthPointEnabled = !this.businessLogic.hasBirthPoint();
      this.toolManager = new ToolManager(canvas, this.businessLogic);
      this.toolManager.initialize();
    },
    handleRestoreSuccess() {
      this.toolManager.registerTool({ type: Tool.Select, data: layersDesc });
      this.disabled = false;
      this.loading = false;
    },
    handleRestoreFail(error) {
      this.loading = false;
      handleError(new Error("地图初始化失败，请刷新页面重试！"));
    },
    saveMap() {
      if (this.isDisabled) return;
      if (!this.isOnline) {
        ElMessageBox.alert(
          '请检查网络连接。网络恢复后，请重新手动保存地图。已保存的地图不受影响。',
          '网络异常',
          {
            confirmButtonText: '我知道啦',
            showClose: false,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          },
        );
        return;
      }
      // 旧地图（version为1）可以直接保存
      if (!(this.savingStatus === SavingStatus.NotSaved || this.mapData.version === 1)) return;

      const brokenImageObjects = this.canvas.getObjects().filter(({ imageNotFound }) => imageNotFound);
      if (brokenImageObjects.length > 0) {
        ElMessageBox.alert(
          '请删除地图中“Image Not Found”的物体后重新保存',
          '保存失败',
          {
            confirmButtonText: "我知道啦",
            showClose: false,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          },
        );
        return;
      }

      // when map haven't saved
      //断网提示
      if (!this.businessLogic.hasBirthPoint()) {
        ElMessageBox.alert(
          '在地图中设置“出生点”才能保存哦。你可在左侧导航栏>地块效果中设置“出生点”。',
          '保存失败',
          {
            confirmButtonText: "我知道啦",
            showClose: false,
            customClass: MESSAGE_BOX_CUSTOM_CLASS,
            modalClass: OVERLAY_CUSTOM_CLASS,
          },
        );
        return;
      }

      // 保存时，退出效果模式
      if (this.selectedMode === Mode.TileEffects) {
        this.changeMode(Mode.Floors);
      }

      this.disabled = true;
      this.isSaving = true;

      this.saveMessage = Message({
        type: "loading",
        message: "正在保存地图...",
      });
      this.savingStatus = SavingStatus.Saving;

      const {
        objects,
        tilemaps,
        images,
        texts,
        compositeAboveAvatar,
        compositeBelowAvatar,
      } = this.businessLogic.save();
      let compositeTilemaps = [...tilemaps];

      const resetTileMaps = (data, lists, zIndex) => {
        console.log(`resetTileMaps`, compositeTilemaps, lists);
        data.forEach((url, index) => {
          const list = lists[index];
          const { left, top, width, high } = list;
          const name = `${NEW_LAYER_LABEL[zIndex]}-${index}`;
          const tileheight = 64;
          const tilewidth = 64;
          const imageheight = high;
          const imagewidth = width;
          const imageURL = url;
          const tileID = getUuid();
          const tileNums = parseInt(width / 64) * parseInt(high / 64);

          const tilemap = new Tilemap({
            left,
            top,
            name,
            zIndex,
            tileheight,
            tilewidth,
            imagewidth,
            imageheight,
            imageURL,
            tileID,
            tileNums,
          });
          tilemap.isCompress = true;
          compositeTilemaps.push({ ...tilemap });
        });
      };

      new Promise(async (resolve, reject) => {
        let d = null;
        let mapIds = {};
        if (
          compositeAboveAvatar &&
          compositeAboveAvatar.lists &&
          compositeAboveAvatar.lists.length
        ) {
          const lists = formatCompositLists(compositeAboveAvatar.lists);
          d = await compositeListMapsSequentially(lists);
          resetTileMaps(
            d,
            compositeAboveAvatar.lists,
            NEW_LAYERS.OBJ_ABOVE_AVATAR
          );
          mapIds = { ...compositeAboveAvatar.groupIds };
        }

        if (
          compositeBelowAvatar &&
          compositeBelowAvatar.lists &&
          compositeBelowAvatar.lists.length
        ) {
          const lists = formatCompositLists(compositeBelowAvatar.lists);
          d = await compositeListMapsSequentially(lists);
          resetTileMaps(
            d,
            compositeBelowAvatar.lists,
            NEW_LAYERS.OBJ_BELOW_AVATAR
          );
          mapIds = { ...mapIds, ...compositeBelowAvatar.groupIds };
        }
        resolve(mapIds);
      }).then((mapIds) => {
        console.log("mapIds", mapIds);
        // 移除参与分组的物件
        compositeTilemaps = compositeTilemaps.filter(
          ({ id }) => !mapIds[id]
        );
        const newMapData = updateMap(this.mapData, {
          backgroundImage:
            objects.find(
              ({ __typename }) => __typename === OBJECT_TYPE.BACKGROUND
            ) || null,
          objects: objects.filter(
            ({ __typename }) => __typename !== OBJECT_TYPE.BACKGROUND
          ),
          tilemaps,
          compositeTilemaps,
          images,
          texts,
          mapIds,
          backgroundSticker: this.backgroundSticker,
          personalStickers: this.personalStickers,
        });
        console.log(`newMapData => `, newMapData);
        const jsonData = JSON.stringify(newMapData, null, 0);
        const dataUrl = this.businessLogic.exportImage();
        const { spaceId, conferenceId } = this.$route.query;
        try{
            const t = lastSaveTime
            lastSaveTime = (+new Date);
            const delta = lastSaveTime - t;
            wsUserLogger('mapeditor:save', 'mapeditor:save', 'save', 'mapeditor:save', {eventid: conferenceId, spaceid: spaceId, delta});
          }catch(error){

          }
        // 扩展信息
        const { birthPos, width, height, layers } = newMapData;
        const obstacles = Object.keys(layers[NEW_LAYERS.AVATAR - 1].data).map((v) => parseInt(v));
        const expand = {
          birthplaces: [{ x: birthPos.x, y: birthPos.y }],
          width,
          high: height,
          // 移除地图四周边缘的碰撞体
          obstacles: trimEdgeObstacles(obstacles, width, height),
        };
        this.updateMapData(jsonData, dataUrl, expand);
      });
    },
    async updateMapData(jsonData, pngData, expand) {
      // TODO: handle error
      const { conferenceId, spaceId } = this.$route.query;
      const updateData = {
        id: {
          id: conferenceId,
        },
        mapdata: {
          id: spaceId,
          mapData: jsonData,
          image: pngData,
          expand,
        },
      };
      try {
        const res = await updateMapData(updateData);
        if (res.data.code === 200) {
          this.disabled = false;
          this.saveMessage?.close();
          Message({
            type: "success",
            message: "保存地图成功",
          });
          this.isDisabled = true;
          this.savingStatus = SavingStatus.Saved;
          this.isSaving = false;
          this.lastSavedTime = nowTimeByMinute();
        } else {
          this.warnText = "未保存的修改暂存在浏览器，请勿关闭浏览器";
          ElMessageBox.alert(
            '地图保存出现异常，请稍后尝试手动保存地图。已保存的地图不受影响。',
            '保存失败',
            {
              confirmButtonText: '我知道啦',
              showClose: false,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
          );
        }
      } catch (err) {
        if (err instanceof TypeError) {
          //访问不到data，默认为网络请求错误
          ElMessageBox.alert(
            '请检查网络连接。网络恢复后，请重新手动保存地图。已保存的地图不受影响。',
            '网络异常',
            {
              confirmButtonText: '我知道啦',
              showClose: false,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
          );
          this.warnText = "未保存的修改暂存在浏览器，请勿关闭浏览器";
          console.error("catch error", err);
        }
      }
    },
    async navigateBack() {
      if (this.savingStatus === SavingStatus.NotSaved) {
        try {
          await ElMessageBox.confirm(
            '返回后，地图修改将不会保存。请先保存地图修改。',
            '重要提示',
            {
              confirmButtonText: '取消返回',
              cancelButtonText: '继续返回',
              type: 'warning',
              distinguishCancelAndClose: true,
              customClass: MESSAGE_BOX_CUSTOM_CLASS,
              modalClass: OVERLAY_CUSTOM_CLASS,
            },
          );
          return;
        } catch (action) {
          if (action === 'cancel') {
            // 继续返回
          } else {
            return;
          }
        }
      }

      if (window.history.length > 2) {
        let backPath = window.history.state.back;
        if (backPath.indexOf("scene") != -1) {
          this.$router.push({
            path: backPath,
            query: {
              eventId: this.$route.query.conferenceId,
              spaceId: this.$route.query.spaceId,
            },
          });
        } else if (backPath.indexOf("EventDetailed") != -1) {
          this.$router.push({ name: "EventDetailed", params: { fn: 1 } });
        }
      } else {
        this.$router.push({ name: "EventDetailed", params: { fn: 1 } });
      } // 如果是一个页面回到详情页
    },
    canAddInteractive(object) {
      return this.businessLogic.canAddInteractive(object);
    },
    userLeaveTrace(){
       try{
          const { spaceId, conferenceId } = this.$route.query;
          const delta = (+new Date) - enterTime;
          wsUserLogger('mapeditor:leave', 'mapeditor:leave', 'leave', 'mapeditor:leave', {eventid: conferenceId, spaceid: conferenceId, delta});
        }catch(error){

        }
    }
  },
};
</script>

<style scoped>
.editor {
  min-width: 1024px;
}
.help {
  position: fixed;
  z-index: 2;
  bottom: 24px;
}
</style>

<style lang="scss">
.el-overlay.is-message-box.mapedit-overlay {
  background-color: rgba(0, 0, 0, 0.3);

  .mapedit-message-box {
    width: 464px;
    background: #ffffff;
    box-shadow: 0px 0px 30px 5px rgba(0, 0, 0, 0.1),
      0px 8px 10px -5px rgba(0, 0, 0, 0.08);
    border-radius: 4px;
    padding-bottom: 24px;
  }
  .el-message-box__header {
    padding: 24px 32px 8px;
  }
  .el-message-box__title {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
  }
  .el-message-box__headerbtn {
    display: none;
  }
  .el-message-box__content {
    padding: 8px 32px;
    font-size: 14px;
    color: rgba(40, 44, 74, 0.6);
  }
  .el-message-box__message {
    padding: 0;
    p {
      line-height: 22px;
    }
  }
  .el-message-box__status {
    display: none;
  }
  .el-message-box__btns {
    padding: 16px 32px 0;
    button:nth-child(2) {
      margin-left: 8px;
    }
  }
  .el-button {
    border: none;
    color: #282C4A;
    background: #f5f5f5;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    line-height: 20px;
    &:focus, &:hover {
      background: #e0e0e0;
    }
    &:active {
      background: #e0e0e0;
    }
  }
  .el-button--small {
    padding: 6px 12px;
  }
  .el-button--primary {
    color: #F6F6F6;
    background: #8F7EF4;
    &:focus, &:hover {
      background: #8A9DF5;
    }
    &:active {
      background: #8A9DF5;
    }
  }
}
</style>
