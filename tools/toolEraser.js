import eventBus from '../eventBus';
import { CELL_HEIGHT, CELL_WIDTH } from '../const';
import { Offset, Rect } from '../model';

const FLOAT_ERASER_ID = 'TOOL_ERASER_FLOAT_ERASER';
const FLOAT_ERASER_ZINDEX = 9999;

class ToolEraser {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;
    this.zIndexList = [];
    
    this.panning = false;
    this.lastRect = null;
    this.eraser = null;
  }

  register(zIndexList) {
    console.log('注册擦除工具', this);
    this.zIndexList = zIndexList;
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
  }

  unregister() {
    console.log('取消注册擦除工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    this.clearEraser();
    this.clear();
  }


  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    this.panning = true;
    const { x, y } = e.absolutePointer;
    const { left, top } = new Offset(x, y).snapToGrid();
    const rect = Rect.fromLTWH(left, top, CELL_WIDTH, CELL_HEIGHT);
    this.removeAtRect(rect);
    this.lastRect = rect;
  }

  handleMouseMove(e) {
    if (e.e.ctrlKey && this.panning) return;

    const { x, y } = e.absolutePointer;
    const point = new Offset(x, y);
    if (this.businessLogic.isPointOutOfRange(point)) {
      this.clearEraser();
      this.lastRect = null;
      return;
    }

    const { left, top } = point.snapToGrid();
    const rect = Rect.fromLTWH(left, top, CELL_WIDTH, CELL_HEIGHT);
    if (rect.equals(this.lastRect)) {
      return;
    }
    this.drawEraser(rect);
    if (this.panning) {
      const result = this.removeAtRect(rect);
      // 如果删除结果是false，则中断擦除功能
      if (!result) {
        this.panning = false;
        this.clearEraser();
        this.lastRect = null;
        return;
      }
    }
    this.lastRect = rect;
  }

  handleMouseUp() {
    this.panning = false;
  }

  drawEraser(rect) {
    const { left, top, width, height } = rect;
    if (this.eraser === null) {
      this.eraser = new fabric.Rect({
        id: FLOAT_ERASER_ID,
        zIndex: FLOAT_ERASER_ZINDEX,
        left,
        top,
        width,
        height,
        fill: '#000',
        opacity: 0.4,
        selectable: false,
      });
      this.canvas.addObject(this.eraser);
    } else {
      this.eraser.set({ left, top, width, height });
      this.canvas.updateObject(this.eraser);
    }
  }

  clearEraser() {
    if (this.eraser === null) return;
    this.canvas.removeObject(this.eraser.id);
    this.eraser = null;
  }

  clear() {
    this.panning = false;
    this.lastRect = null;
  }

  removeAtRect(rect) {
    return this.businessLogic.removeByRectZIndexList(rect, this.zIndexList);
  }
}

export default ToolEraser;
