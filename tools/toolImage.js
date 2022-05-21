import { FLOAT_OBJECT_OPACITY } from '../const';
import eventBus from '../eventBus';
import { createCrossOriginImage } from '../util';

const FLOAT_IMAGE_ID = 'TOOL_IMAGE_FLOAT_IMAGE';
const FLOAT_IMAGE_ZINDEX = 99999;

class ToolImage {
  constructor(canvas, businessLogic) {
    this.canvas = canvas;
    this.businessLogic = businessLogic;

    this.imageInfo = null;
    this.floatImageId = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
    this.isAddingFloatImage = false;
  }

  register(imageInfo) {
    console.log('注册图片工具', this, imageInfo);
    this.imageInfo = imageInfo;
    const element = createCrossOriginImage(imageInfo.imageURL);
    element.onload = () => {
      this.imageInfo.element = element;
    };
    element.onerror = (e) => {
      console.error(e);
    };
    // TODO: handle error
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleFloatImageAdded = this.handleFloatImageAdded.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);

    eventBus.on('canvas:mouseDown', this.handleMouseDown);
    eventBus.on('canvas:mouseMove', this.handleMouseMove);
    eventBus.on('canvas:objectAdded', this.handleFloatImageAdded);
    eventBus.on('canvas:dragenter', this.handleDragEnter);
    eventBus.on('canvas:dragover', this.handleDragOver);
    eventBus.on('canvas:dragleave', this.handleDragLeave);
    eventBus.on('canvas:drop', this.handleDrop);
  }

  unregister() {
    console.log('取消注册图片工具', this);
    eventBus.off('canvas:mouseDown', this.handleMouseDown);
    eventBus.off('canvas:mouseMove', this.handleMouseMove);
    eventBus.off('canvas:objectAdded', this.handleFloatImageAdded);

    this.removeFloatImage();
    this.imageInfo = null;
    this.floatImageId = null;
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
    this.isAddingFloatImage = false;
  }

  handleFloatImageAdded({ id }) {
    if (this.floatImageId == null && id === FLOAT_IMAGE_ID) {
      this.floatImageId = id;
      this.isAddingFloatImage = false;
    }
  }

  handleMouseDown(e) {
    if (e.e.ctrlKey) return;

    if (this.imageInfo === null || this.imageInfo.element == null) return;

    const { x: left, y: top } = e.absolutePointer;
    const { imageWidth, imageHeight } = this.imageInfo;

    const data = {
      imageInfo: this.imageInfo,
      left: left - imageWidth / 2,
      top: top - imageHeight / 2,
    }
    this.businessLogic.addImage(data);
  }

  handleMouseMove(e) {
    if (this.imageInfo === null || this.imageInfo.element == null) return;

    const { x: left, y: top } = e.absolutePointer;
    this.addOrUpdateFloatImage(left, top);
    this.lastMoveLeft = left;
    this.lastMoveTop = top;
  }

  handleDragEnter() {
    
  }

  handleDragOver(e) {
    if (this.imageInfo === null || this.imageInfo.element == null) return;

    const { left, top } = e
    if (left === this.lastMoveLeft && top === this.lastMoveTop) return;
    this.addOrUpdateFloatImage(left, top);
    this.lastMoveLeft = left;
    this.lastMoveTop = top;
  }

  handleDragLeave() {
    this.removeFloatImage();
    this.lastMoveLeft = null;
    this.lastMoveTop = null;
  }
  
  handleDrop(e) {
    if (this.imageInfo === null || this.imageInfo.element == null) return;

    const url = e.e.dataTransfer.getData('text/plain');
    if (this.imageInfo.imageURL !== url) return;

    const { left, top } = e;
    const { imageWidth, imageHeight } = this.imageInfo;

    const data = {
      imageInfo: this.imageInfo,
      left: left - imageWidth / 2,
      top: top - imageHeight / 2,
    };
    this.businessLogic.addImage(data);
  }

  async addOrUpdateFloatImage(left, top) {
    const { element, width, height } = this.imageInfo;
    if (this.floatImageId == null && !this.isAddingFloatImage) {
      this.isAddingFloatImage = true;
      const data = {
        id: FLOAT_IMAGE_ID,
        element,
        zIndex: FLOAT_IMAGE_ZINDEX,
        left: left - width / 2,
        top: top - height / 2,
        width,
        height,
        imageWidth: width,
        imageHeight: height,
        opacity: FLOAT_OBJECT_OPACITY,
      };
      this.canvas.addImage(data);
    } else if (this.floatImageId != null) {
      const data = {
        id: this.floatImageId,
        left: left - width / 2,
        top: top - height / 2,
      };
      this.canvas.updateObject(data);
    }
  }

  removeFloatImage() {
    if (this.floatImageId == null) return;

    this.canvas.removeObject(this.floatImageId);
    this.floatImageId = null;
  }
}

export default ToolImage;
