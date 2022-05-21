import { OBJECT_TYPE } from "../const";

class Background {
  constructor({
    id,
    materialId,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    imageWidth,
    imageHeight,
    name,
    angle,
  }) {
    this.__typename = OBJECT_TYPE.BACKGROUND;
    this.id = id;
    this.materialId = materialId;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.imageURL = imageURL;
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.name = name;
    this.angle = angle;
  }
}

export default Background;
