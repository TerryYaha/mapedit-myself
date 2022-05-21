import _ from 'underscore';
import eventBus from '../eventBus';

class ToolGrab {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;

    this.panning = false;
  }

  register() {
    console.log('注册拖拽工具', this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
    
    this.canvas.setDefaultCursor('grab');
    this.canvas.setHoverCursor('grab');
  }

  unregister() {
    console.log('取消注册拖拽工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);

    this.canvas.setDefaultCursor('default');
    this.canvas.setHoverCursor('default');
  }

  handleMouseDown(e) {
    this.panning = true;
  }

  handleMouseUp(e) {
    this.panning = false;
  }

  handleMouseMove(e) {
    if (this.panning && !e.e.ctrlKey) {
      const point = { x: e.e.movementX, y: e.e.movementY };
      this.canvas.relativePan(point);
    }
  }
}

export default ToolGrab;
