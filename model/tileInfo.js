class TileInfo {
  constructor({
    tileID,
    tileNums,
    imageURL,
    zIndex,
    left,
    top,
    width,
    height,
    imageheight,
    imagewidth,
    name,
    tileheight,
    tilewidth,
    tileLeft,
    tileTop,
    userLayer,
    isCollider,
    isMaskPlayer,
    interactiveType,
    interactiveURL,
    interactiveMsg,
    isbirth,
    isPrivateSpace,
    isPortal,
    targetMap,
    describe,
    spin,
  }) {
    this.tileID = tileID;
    this.tileNums = tileNums;
    this.imageURL = imageURL;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.imageheight = imageheight;
    this.imagewidth = imagewidth;
    this.name = name;
    this.tileheight = tileheight;
    this.tilewidth = tilewidth;
    this.tileLeft = tileLeft;
    this.tileTop = tileTop;
    this.userLayer = userLayer;
    this.isCollider = isCollider;
    this.isMaskPlayer = isMaskPlayer;
    this.interactiveType = interactiveType;
    this.interactiveURL = interactiveURL;
    this.interactiveMsg = interactiveMsg;
    this.isbirth = isbirth;
    this.isPrivateSpace = isPrivateSpace;
    this.isPortal = isPortal;
    this.targetMap = targetMap;
    this.describe = describe;
    this.spin = spin;
  }
}

export default TileInfo;
