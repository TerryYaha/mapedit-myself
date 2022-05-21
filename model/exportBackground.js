class ExportBackground {
  constructor({
    imageURL,
    imageWidth,
    imageHeight,
    scaleX,
    scaleY,
    imageLeft,
    imageTop,
    zIndex,
    angle,
  }) {
    this.imageURL = imageURL;
    // 图片的固有宽度
    this.imageWidth = imageWidth;
    // 图片的固有高度
    this.imageHeight = imageHeight;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.imageLeft = imageLeft;
    this.imageTop = imageTop;
    this.zIndex = zIndex;
    this.angle = angle;
  }
}

export default ExportBackground;
