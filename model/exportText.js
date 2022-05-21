class ExportText {
  constructor({
    textColor,
    textContent,
    textHeight,
    textLeft,
    textSize,
    textTop,
    textWidth,
    zIndex,
    opacity,
    isItalic,
    isBold,
    isUnderline,
    horizontalAlign,
    lineHeight,
    angle,
  }) {
    // 文字不允许缩放，因为在cocos中放大的文字会显示模糊
    this.scaleX = 1;
    this.scaleY = 1;
    this.textColor = textColor;
    this.textContent = textContent;
    this.textHeight = textHeight;
    this.textLeft = textLeft;
    this.textSize = textSize;
    this.textTop = textTop;
    this.textWidth = textWidth;
    this.zIndex = zIndex;
    this.opacity = opacity;
    this.isItalic = isItalic;
    this.isBold = isBold;
    this.isUnderline = isUnderline;
    this.horizontalAlign = horizontalAlign;
    this.lineHeight = lineHeight;
    this.angle = angle;
  }
}

export default ExportText;
