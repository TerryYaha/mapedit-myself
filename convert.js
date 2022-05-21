import { CELL_HEIGHT, DEFAULT_LINE_HEIGHT } from './const';
import { CanvasText, ExportImage, ExportText, CanvasImage, CanvasTilemap, Background, CanvasBackground, ExportBackground } from './model';
import { getImageSizeAsync, getUuid } from './util';

function convertTilemapToCanvasTilemap(tilemap) {
  const {
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
  } = tilemap;
  return new CanvasTilemap({
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
  });
}

function convertImageToCanvasImage(image) {
  const {
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    imageWidth,
    imageHeight,
    angle,
  } = image;
  return new CanvasImage({
    __typename,
    id,
    zIndex,
    left,
    top,
    width: imageWidth,
    height: imageHeight,
    scaleX: width / imageWidth,
    scaleY: height / imageHeight,
    angle,
    imageURL,
  });
}

function convertImageToExportImage(image, mapHeight) {
  const {
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    imageWidth,
    imageHeight,
    angle,
    isBackgroundImage,
  } = image;

  return new ExportImage({
    zIndex: zIndex - 1,
    imageLeft: left,
    // 转换y坐标，canvas中左上角原点，cocos中左下角原点
    imageTop: (mapHeight * CELL_HEIGHT) - (top + height),
    imageWidth: imageWidth,
    imageHeight: imageHeight,
    scaleX: width / imageWidth,
    scaleY: height / imageHeight,
    angle,
    imageURL,
    isBackgroundImage,
  });
}

function convertTextToCanvasText(text) {
  const {
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    content,
    fontSize,
    color,
    opacity,
    isItalic,
    isBold,
    isUnderline,
    horizontalAlign,
    lineHeight,
    angle,
  } = text;

  return new CanvasText({
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    text: content,
    opacity,
    fontSize,
    fill: color,
    fontStyle: isItalic ? 'italic' : 'normal',
    fontWeight: isBold ? 700 : 400,
    underline: isUnderline ?? false,
    textAlign: horizontalAlign ? horizontalAlign.toLowerCase() : 'left',
    lineHeight: lineHeight === null ? DEFAULT_LINE_HEIGHT : lineHeight / fontSize,
    angle,
  });
}

function convertTextToExportText(text, mapHeight) {
  const {
    zIndex,
    left,
    top,
    width,
    height,
    content,
    fontSize,
    color,
    opacity,
    isItalic,
    isBold,
    isUnderline,
    horizontalAlign,
    lineHeight,
    angle,
  } = text;

  return new ExportText({
    textColor: color,
    textContent: content,
    textHeight: height,
    textLeft: left,
    textSize: fontSize,
    // 转换y坐标，canvas中左上角原点，cocos中左下角原点
    textTop: (mapHeight * CELL_HEIGHT) - (top + height),
    textWidth: width,
    zIndex: zIndex - 1,
    opacity,
    isItalic,
    isBold,
    isUnderline,
    horizontalAlign,
    lineHeight: lineHeight === null ? fontSize * DEFAULT_LINE_HEIGHT : lineHeight,
    angle,
  });
}

function convertResourceToBackgroundAsync(resource) {
  const { id, name, url } = resource;
  return getImageSizeAsync(url).then(({ width, height }) => {
    return new Background({
      id: getUuid(),
      materialId: id,
      zIndex: 0,
      left: 0,
      top: 0,
      width,
      height,
      imageURL: url,
      imageWidth: width,
      imageHeight: height,
      name,
      angle: 0,
    });
  });
}

function convertBackgroundToCanvasBackground(background) {
  const {
    __typename,
    id,
    zIndex,
    left,
    top,
    width,
    height,
    imageURL,
    imageWidth,
    imageHeight,
    angle,
  } = background;

  return new CanvasBackground({
    __typename,
    id,
    zIndex,
    left,
    top,
    width: imageWidth,
    height: imageHeight,
    scaleX: width / imageWidth,
    scaleY: height / imageHeight,
    angle,
    imageURL,
  });
}

function convertBackgroundToExportBackground(background, mapHeight) {
  const {
    left,
    top,
    width,
    height,
    imageURL,
    imageWidth,
    imageHeight,
  } = background;
  
  return new ExportBackground({
    imageURL,
    imageWidth,
    imageHeight,
    scaleX: width / imageWidth,
    scaleY: height / imageHeight,
    imageLeft: left,
    imageTop: (mapHeight * CELL_HEIGHT) - (top + height),
    zIndex: 0,
    angle: 0,
  });
}

export {
  convertTilemapToCanvasTilemap,
  convertImageToCanvasImage,
  convertImageToExportImage,
  convertTextToCanvasText,
  convertTextToExportText,
  convertResourceToBackgroundAsync,
  convertBackgroundToCanvasBackground,
  convertBackgroundToExportBackground,
};
