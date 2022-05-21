import { HOVER_TILE_EFFECT_OPACITY,TileEffectType} from '../const';
import eventBus from '../eventBus';
import { Offset } from '../model';
import { createCrossOriginImage } from '../util';

const FLOAT_EFFECT_ID = 'TOOL_EFFECT_FLOAT_EFFECT';
const FLOAT_EFFECT_ZINDEX = 9999;

class ToolEffect {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;
    this.tileInfo = null;
    
    this.panning = false;
    this.floatTilemapId = null;
    this.lastMovePoint = null;
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
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleFloatTilemapAdded = this.handleFloatTilemapAdded.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
    eventBus.on('canvas:objectAdded', this.handleFloatTilemapAdded);
  }

  unregister() {
    console.log('取消注册物件工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    eventBus.off('canvas:objectAdded', this.handleFloatTilemapAdded);
    this.panning = false;

    this.removeFloatTilemap();
    this.floatTilemapId = null;
    this.lastMovePoint = null;
    this.isAddingFloatTilemap = false;
  }

  handleFloatTilemapAdded({ id }) {
    if (this.floatTilemapId == null && id === FLOAT_EFFECT_ID) {
      this.floatTilemapId = id;
      this.isAddingFloatTilemap = false;
    }
  }

  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    if (this.tileInfo === null || this.tileInfo.element === null) return;
    const { x, y } = e.absolutePointer;
    const point = new Offset(x, y);
    const { left, top } = point.snapToGrid();
    if (this.businessLogic.isPointOutOfRange(point)) return;
    this.panning = true;

    const isTransferPoint = this.tileInfo.name === TileEffectType.TransferDoor;
    if(isTransferPoint){
      // 如果是传送门，目标位置不可是已放置的传送门地块，边缘地图，禁行区域地块，碰撞体的物件
      const canCreate = this.businessLogic.canCreateTransferPoint({ left, top });
      if (!canCreate) {
        return false;
      }
      const params = {
        tileInfo:this.tileInfo,
        point:point.snapToGrid(),
      }
      eventBus.emit('ui:showSelectSpaceMessage',params);
      this.panning = false;
      return false
    }

    const result = this.businessLogic.addEffect(this.tileInfo, point.snapToGrid());
    if (!result) {
      this.panning = false;
    }
  }

  handleMouseMove(e) {
    if (e.e.ctrlKey && this.panning) return;

    if (this.tileInfo === null || this.tileInfo.element === null) return;

    const { x, y } = e.absolutePointer;
    const movePoint = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(movePoint)) {
      this.removeFloatTilemap();
      return;
    }

    const { left, top } = movePoint.snapToGrid();
    if (this.lastMovePoint) {
      const { left: lastLeft, top: lastTop } = this.lastMovePoint.snapToGrid();
      if (left === lastLeft && top === lastTop) return;
    }

    this.addOrUpdateFloatTilemap(left, top);
    if (this.panning) {
      const result = this.businessLogic.addEffect(this.tileInfo, movePoint.snapToGrid());
      if (!result) {
        this.panning = false;
      }
    }
    this.lastMovePoint = movePoint;
  }

  handleMouseUp() {
    this.panning = false;
  }

  addOrUpdateFloatTilemap(left, top) {
    if (this.floatTilemapId == null && !this.isAddingFloatTilemap) {
      this.isAddingFloatTilemap = true;
      const { element, width, height } = this.tileInfo;
      const opacity = HOVER_TILE_EFFECT_OPACITY;
      const data = { id: FLOAT_EFFECT_ID, element, zIndex: FLOAT_EFFECT_ZINDEX, left, top, width, height, opacity };
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

export default ToolEffect;
