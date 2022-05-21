class CanvasTilemap {
  constructor({
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
  }) {
    this.__typename = __typename;
    this.id = id;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.imageURL = imageURL;
  }
}

export default CanvasTilemap;
