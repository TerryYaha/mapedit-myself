import _ from 'underscore';
import eventBus from '../eventBus';

class ToolDefault {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;
    
    this.panning = false;
  }

  register() {
    console.log('注册默认工具', this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    
    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:mouseUp', this.handleMouseUp);
    eventBus.on('canvas:mouseWheel', this.handleMouseWheel);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  unregister() {
    console.log('取消注册默认工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:mouseUp', this.handleMouseUp);
    eventBus.off('canvas:mouseWheel', this.handleMouseWheel);
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleMouseDown(e) {
    this.canvas.disableSelection();
    this.panning = true;
  }

  handleMouseMove(e) {
    if (this.panning && e.e.ctrlKey) {
      const point = { x: e.e.movementX, y: e.e.movementY };
      this.canvas.relativePan(point);
    }
  }

  handleMouseUp(e) {
    this.canvas.enableSelection();
    this.panning = false;
  }

  handleMouseWheel(e) {
    // 防止过度滚动导致浏览器回弹，防止缩放导致浏览器页面缩放
    e.e.preventDefault();
    
    if (e.e.ctrlKey) { 
      // 缩放
      let zoom = e.e.deltaY > 0 ? e.zoom / 1.09 : e.zoom * 1.09;
      zoom = Math.max(0.1, zoom);
      zoom = Math.min(3, zoom);
      if (zoom == e.zoom) return;

      this.canvas.zoomToPoint(e.pointer, zoom);
    } else {
      // 移动
      const point = { x: -e.e.deltaX, y: -e.e.deltaY };
      this.canvas.relativePan(point);
    }
  }

  handleKeyDown(e) {
    if (e.key === 'v' || e.key === 'Escape') {
      const targetTag = e.target.tagName.toUpperCase();
      const isTargetInput = targetTag === 'INPUT' || targetTag === 'TEXTAREA';
      if (!isTargetInput) {
        // TODO: 在编辑模式下，按V键不做任何事情（注：目前会丢失选中状态）
        eventBus.emit('ui:useSelectTool');
      }
    }
  }

}

export default ToolDefault;
