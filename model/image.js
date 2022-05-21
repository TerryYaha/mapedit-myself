import { OBJECT_TYPE } from "../const";

class Image {
  constructor({
    id,
    // 素材id
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
    userLayer,
    isMaskPlayer,
    isBackgroundImage,
    angle,
  }) {
    this.__typename = OBJECT_TYPE.IMAGE;
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
    this.userLayer = userLayer;
    this.isMaskPlayer = isMaskPlayer;
    this.isBackgroundImage = isBackgroundImage;
    this.angle = angle;
  }
}

export default Image;
