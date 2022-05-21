class ExportLayer {
  constructor({
    name,
    type,
    tiles,
    zIndex,
    height,
    width,
    visible,
    opacity,
    x,
    y,
    data,
  }) {
    this.name = name;
    this.type = type;
    this.tiles = tiles;
    this.zIndex = zIndex;
    this.height = height;
    this.width = width;
    this.visible = visible;
    this.opacity = opacity;
    this.x = x;
    this.y = y;
    this.data = data;
  }
}

export default ExportLayer;
