class CanvasImage {
  constructor({
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    scaleX,
    scaleY,
    angle,
    imageURL,
  }) {
    this.__typename = __typename;
    this.id = id;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    this.angle = angle;
    this.imageURL = imageURL;
  }
}

export default CanvasImage;
