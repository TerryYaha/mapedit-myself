class CanvasText {
  constructor({
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    text,
    opacity,
    fontSize,
    fill,
    fontStyle,
    fontWeight,
    underline,
    textAlign,
    lineHeight,
    angle,
  }) {
    this.__typename = __typename;
    this.id = id;
    this.zIndex = zIndex;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.text = text;
    this.opacity = opacity;
    this.fontSize = fontSize;
    this.fill = fill;
    this.fontStyle = fontStyle;
    this.fontWeight = fontWeight;
    this.underline = underline;
    this.textAlign = textAlign;
    this.lineHeight = lineHeight;
    this.angle = angle;
  }
}

export default CanvasText;
