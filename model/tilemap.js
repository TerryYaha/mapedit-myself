import { OBJECT_TYPE } from "../const";
import Rect from './rect';

class Tilemap {
  constructor({
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    // 物件库的物件种类ID
    tileID,
    userLayer,
    isCollider,
    isMaskPlayer,
    // 是否是出生点
    isbirth,
    isPrivateSpace,
    isPortal,
    targetMap,
    describe,
    imageheight,
    imagewidth,
    name,
    tileLeft,
    tileNums,
    tileTop,
    tileheight,
    tilewidth,
    interactiveType,
    interactiveURL,
    interactiveMsg,
    spin,
  }) {
    this.__typename = OBJECT_TYPE.TILEMAP,
    this.id = id;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.image = imageURL.substring(imageURL.lastIndexOf("/") + 1),
    this.imageURL = imageURL;
    this.tileID = tileID;
    this.userLayer = userLayer;
    this.isCollider = isCollider;
    this.isMaskPlayer = isMaskPlayer;
    this.isbirth = isbirth;
    this.isPrivateSpace = isPrivateSpace;
    this.isPortal = isPortal;
    this.targetMap = targetMap,
    this.describe = describe;
    this.imageheight = imageheight;
    this.imagewidth = imagewidth;
    this.name = name;
    this.tileLeft = tileLeft;
    this.tileNums = tileNums;
    this.tileTop = tileTop;
    this.tileheight = tileheight;
    this.tilewidth = tilewidth;
    this.interactiveType = interactiveType;
    this.interactiveURL = interactiveURL;
    this.interactiveMsg = interactiveMsg;
    this.spin = spin;
  }

  getRect() {
    return Rect.fromLTWH(this.left, this.top, this.width, this.height);
  }
}

export default Tilemap;
