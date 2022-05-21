import { FLOAT_OBJECT_OPACITY } from '../const';
import eventBus from '../eventBus';
import { Offset } from '../model';
import { createCrossOriginImage } from '../util';

const FLOAT_TILEMAP_ID = 'TOOL_SETTING_FLOAT_TILEMAP';
const FLOAT_TILEMAP_ZINDEX = 9999;

class ToolSetting {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;

    this.tileInfo = null;
    this.floatTilemapId = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
    this.isAddingFloatTilemap = false;
  }

  register(tileInfo) {
    console.log('注册物件工具', this);
    this.tileInfo = tileInfo;
    const element = createCrossOriginImage(tileInfo.imageURL);
    element.onload = () => {
      this.tileInfo.element = element;
    };
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleFloatTilemapAdded = this.handleFloatTilemapAdded.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:objectAdded', this.handleFloatTilemapAdded);
  }

  unregister() {
    console.log('取消注册物件工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:objectAdded', this.handleFloatTilemapAdded);

    this.removeFloatTilemap();
    this.floatTilemapId = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
    this.isAddingFloatTilemap = false;
  }

  updateTileInfo(tileInfo) {
    this.tileInfo = tileInfo;
    const element = createCrossOriginImage(tileInfo.imageURL);
    element.onload = () => {
      this.tileInfo.element = element;
      // 如果此时地图中有悬浮物件则删除该悬浮物件，使用新的tileInfo创建悬浮物件
      if (this.floatTilemapId) {
        const canvasObject = this.canvas.getObject(this.floatTilemapId);
        if (canvasObject) {
          const { left, top } = canvasObject;
          this.removeFloatTilemap();
          this.addOrUpdateFloatTilemap(left, top);
        }
      }
    };
  }

  handleFloatTilemapAdded({ id }) {
    if (this.floatTilemapId == null && id === FLOAT_TILEMAP_ID) {
      this.floatTilemapId = id;
      this.isAddingFloatTilemap = false;
    }
  }

  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    if (this.tileInfo === null || this.tileInfo.element === null) return;

    const { x, y } = e.absolutePointer;
    const point = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(point)) return;

    const { left, top } = point.snapToGrid();
    this.businessLogic.addTilemap({ tileInfo: this.tileInfo, left, top });
  }

  handleMouseMove(e) {
    if (this.tileInfo === null || this.tileInfo.element === null) return;

    const { x, y } = e.absolutePointer;
    const point = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(point)) {
      this.removeFloatTilemap();
      return;
    }

    const { left, top } = point.snapToGrid();
    if (left === this.lastMoveLeft && top === this.lastMoveTop) return;

    this.addOrUpdateFloatTilemap(left, top);
    this.lastMoveLeft = left;
    this.lastMoveTop = top;
  }

  addOrUpdateFloatTilemap(left, top) {
    if (this.floatTilemapId == null && !this.isAddingFloatTilemap) {
      this.isAddingFloatTilemap = true;
      const { element, width, height } = this.tileInfo;
      const opacity = FLOAT_OBJECT_OPACITY;
      const data = { id: FLOAT_TILEMAP_ID, element, zIndex: FLOAT_TILEMAP_ZINDEX, left, top, width, height, opacity };
      this.canvas.addTilemap(data);
    } else if (this.floatTilemapId != null) {
      const data = { id: this.floatTilemapId, left, top };
      this.canvas.updateObject(data);
    }
  }

  removeFloatTilemap() {
    if (this.floatTilemapId == null) return;

    this.canvas.removeObject(this.floatTilemapId);
    this.floatTilemapId = null;
  }
}

export default ToolSetting;
