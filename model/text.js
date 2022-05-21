import { OBJECT_TYPE } from "../const";

class Text {
  constructor({
    id,
    zIndex,
    left,
    top,
    width,
    height,
    content,
    fontSize,
    color,
    userLayer,
    isMaskPlayer,
    opacity,
    isItalic,
    isBold,
    isUnderline,
    horizontalAlign,
    lineHeight,
    angle,
  }) {
    this.__typename = OBJECT_TYPE.TEXT;
    this.id = id;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.content = content;
    this.fontSize = fontSize;
    this.color = color;
    this.userLayer = userLayer;
    this.isMaskPlayer = isMaskPlayer;
    this.opacity = opacity;
    this.isItalic = isItalic;
    this.isBold = isBold;
    this.isUnderline = isUnderline;
    this.horizontalAlign = horizontalAlign;
    this.lineHeight = lineHeight;
    this.angle = angle;
  }
}

export default Text;
