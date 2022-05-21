class ExportTileset {
  constructor({
    tileID,
    firstgid,
    endgid,
    tileNums,
    imageURL,
    zIndex,
    image,
    imageheight,
    imagewidth,
    name,
    tileheight,
    tilewidth,
  }) {
    // 物件种类的ID
    this.tileID = tileID;
    this.firstgid = firstgid;
    this.endgid = endgid;
    // 网格数量
    this.tileNums = tileNums;
    this.imageURL = imageURL;
    // 层级，从 0 开始
    this.zIndex = zIndex;
    this.image = image;
    // 图片固有高度
    this.imageheight = imageheight;
    // 图片固有宽度
    this.imagewidth = imagewidth;
    this.name = name;
    // 网格高度
    this.tileheight = tileheight;
    // 网格宽度
    this.tilewidth = tilewidth;
  }
}

export default ExportTileset;
