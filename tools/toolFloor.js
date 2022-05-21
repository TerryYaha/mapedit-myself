import { FLOAT_OBJECT_OPACITY } from '../const';
import eventBus from '../eventBus';
import { Rect, Offset } from '../model';
import { createCrossOriginImage } from '../util';

const FLOAT_FLOOR_ID = 'TOOL_FLOOR_FLOAT_FLOOR';
const FLOAT_FLOOR_ZINDEX = 9999;
const FLOAT_GRID_ID = 'TOOL_FLOOR_FLOAT_GRID';
const FLOAT_GRID_ZINDEX = 9999;

class ToolFloor {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;
    this.tileInfo = null;
    this.floatFoorId = null;
    this.isAddingFloatFloor = false;
    
    this.panning = false;
    this.downPoint = null;
    this.movePointSnap = null;
    this.rect = null;
    this.grid = null;
  }

  register(tileInfo) {
    console.log('注册地板工具', this);
    this.tileInfo = tileInfo;
    const element = createCrossOriginImage(tileInfo.imageURL);
    element.onload = () => {
      this.tileInfo.element = element;
    };
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleFloatFloorAdded = this.handleFloatFloorAdded.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
    eventBus.on('canvas:objectAdded', this.handleFloatFloorAdded);
  }

  unregister() {
    console.log('取消注册地板工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    eventBus.off('canvas:objectAdded', this.handleFloatFloorAdded);

    this.clear();
    this.removeFloatFloor();
    this.floatFoorId = null;
    this.isAddingFloatFloor = false;
  }

  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    if (this.tileInfo === null || this.tileInfo.element === null) return;

    const { x, y } = e.absolutePointer;
    this.downPoint = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(this.downPoint)) return;

    this.panning = true;
    this.removeFloatFloor();
    this.drawGrid(this.downPoint, this.downPoint);
  }

  handleMouseMove(e) {
    if (e.e.ctrlKey && this.panning) return;

    const { x, y } = e.absolutePointer;
    const movePoint = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(movePoint)) {
      this.removeFloatFloor();
      return;
    }
    
    const movePointSnap = movePoint.snapToGrid();
    if (this.panning) {
      this.drawGrid(this.downPoint, movePoint);
    } else {
      if (movePointSnap.left !== this.movePointSnap?.left || movePointSnap.top !== this.movePointSnap?.top) {
        this.addOrUpdateFloatFloor(movePointSnap.left, movePointSnap.top);
      }
    }
    this.movePointSnap = movePointSnap;
  }

  handleMouseUp(e) {
    if (!this.panning) return;
    if (this.rect == null) return;

    this.businessLogic.batchAddOrReplaceFloor(this.tileInfo, this.rect);
    this.clear();

    const { x, y } = e.absolutePointer;
    const movePoint = new Offset(x, y);
    const { left, top } = movePoint.snapToGrid();
    this.addOrUpdateFloatFloor(left, top);
  }

  handleFloatFloorAdded({ id }) {
    if (this.floatFoorId == null && id === FLOAT_FLOOR_ID) {
      this.floatFoorId = id;
      this.isAddingFloatFloor = false;
    }
  }

  drawGrid(point1, point2) {
    if (this.grid === null) {
      this.rect = Rect.fromPoints(point1, point2).snapToGrid().resizeInRect(this.businessLogic.mapRect);
      const { left, top, width, height } = this.rect;
      this.grid = new fabric.Rect({
        id: FLOAT_GRID_ID,
        zIndex: FLOAT_GRID_ZINDEX,
        left,
        top,
        width,
        height,
        fill: '#8F7EF4',
        opacity: 0.6,
        selectable: false,
      });
      this.canvas.addObject(this.grid);
    } else {
      const rect = Rect.fromPoints(point1, point2).snapToGrid().resizeInRect(this.businessLogic.mapRect);
      if (rect.equals(this.rect)) return;
      this.rect = rect;
      const { left, top, width, height } = this.rect;
      this.grid.set({ left, top, width, height });
      this.canvas.updateObject(this.grid);
    }
  }

  clearGrid() {
    if (this.grid === null) return;
    this.canvas.removeObject(this.grid.id);
    this.grid = null;
    this.rect = null;
  }

  clear() {
    this.clearGrid();
    this.panning = false;
    this.downPoint = null;
  }

  addOrUpdateFloatFloor(left, top) {
    if (this.floatFoorId == null && !this.isAddingFloatFloor) {
      this.isAddingFloatFloor = true;
      const { element, width, height } = this.tileInfo;
      const opacity = FLOAT_OBJECT_OPACITY;
      const data = { id: FLOAT_FLOOR_ID, element, zIndex: FLOAT_FLOOR_ZINDEX, left, top, width, height, opacity };
      this.canvas.addTilemap(data);
    } else if (this.floatFoorId != null) {
      const data = { id: this.floatFoorId, left, top };
      this.canvas.updateObject(data);
    }
  }

  removeFloatFloor() {
    if (this.floatFoorId == null) return;

    this.canvas.removeObject(this.floatFoorId);
    this.floatFoorId = null;
  }
}

export default ToolFloor;
