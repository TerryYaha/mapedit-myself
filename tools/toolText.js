import eventBus from "../eventBus";

class ToolText {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;

    this.editingText = null;
  }

  register() {
    console.log('注册文字工具', this);
    this.handleMouseDown = this.handleMouseDown.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);

    this.canvas.setDefaultCursor('text');
    this.canvas.setHoverCursor('text');
  }

  unregister() {
    console.log('取消注册文字工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);

    this.canvas.setDefaultCursor('default');
    this.canvas.setHoverCursor('default');
  }
  
  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    const data = { left: e.absolutePointer.x, top: e.absolutePointer.y };
    this.businessLogic.addText(data);
  }
}

export default ToolText;
