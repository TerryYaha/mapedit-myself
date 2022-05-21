import { FLOAT_OBJECT_OPACITY } from '../const';
import eventBus from '../eventBus';
import { Offset } from '../model';
import { createCrossOriginImage } from '../util';

const FLOAT_WALL_ID = 'TOOL_WALL_FLOAT_WALL';
const FLOAT_WALL_ZINDEX = 9999;

class ToolWall {
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
    console.log('注册墙壁工具', this);
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
    console.log('取消注册墙壁工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    eventBus.off('canvas:objectAdded', this.handleFloatTilemapAdded);

    this.removeFloatTilemap();
    this.floatTilemapId = null;
    this.lastMovePoint = null;
    this.isAddingFloatTilemap = false;
  }

  handleFloatTilemapAdded({ id }) {
    if (this.floatTilemapId == null && id === FLOAT_WALL_ID) {
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

    this.panning = true;
    this.businessLogic.addOrReplaceWall(this.tileInfo, point.snapToGrid());
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
      this.businessLogic.addOrReplaceWall(this.tileInfo, movePoint.snapToGrid());
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
      const opacity = FLOAT_OBJECT_OPACITY;
      const data = { id: FLOAT_WALL_ID, element, zIndex: FLOAT_WALL_ZINDEX, left, top, width, height, opacity };
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

export default ToolWall;
