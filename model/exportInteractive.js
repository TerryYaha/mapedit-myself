class ExportInteractive {
  constructor({
    isPoint,
    zIndex,
    tileLeft,
    tileTop,
    tileID,
    interactiveType,
    interactiveURL,
    interactiveMsg,
  }) {
    // 是否是原点 origin point
    this.isPoint = isPoint;
    this.zIndex = zIndex;
    this.tileLeft = tileLeft;
    this.tileTop = tileTop;
    // 不是tile的ID，而是interactive对象的ID
    this.tileID = tileID;
    this.interactiveType = interactiveType;
    this.interactiveURL = interactiveURL;
    this.interactiveMsg = interactiveMsg;
  }
}

export default ExportInteractive;
