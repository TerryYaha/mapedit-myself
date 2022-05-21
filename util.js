import  Message from './components/base/toast/message';
import { USER_LAYER, NEW_LAYERS, Mode, BROKEN_IMAGE_PLACEHOLDER } from './const';
import TileCategory from './model/tileCategory';
import { compositeListMaps } from '../../api/api';

function createCrossOriginImage(url) {
  const image = new Image();
  image.setAttribute('crossOrigin', 'anonymous');
  image.src = url;
  return image;
}

async function createPlaceholder(width, height) {
  const imgElem = new Image();
  imgElem.setAttribute('crossOrigin', 'anonymous');
  imgElem.src = BROKEN_IMAGE_PLACEHOLDER;
  await new Promise((resolve, reject) => {
    imgElem.onload = () => {
      resolve();
    };
    imgElem.onerror = () => {
      reject();
    };
  })
  const placeholderSize = 104;
  const scale = Math.min(width, height) / placeholderSize;
  return new Promise((resolve, reject) => {
    const image = new fabric.Image(imgElem, {});
    image.cloneAsImage((obj) => {
      console.log('cloned image', obj);
      resolve(obj);
    }, {
      multiplier: scale,
    });
  });
}

function getUuid() {
  var d = new Date().getTime();
  if (window.performance && typeof window.performance.now === "function") {
    d += performance.now(); //use high-precision timer if available
  }
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;    // d是随机种子
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

function downloadJson(jsonData, mapName) {
  const blob = new Blob([jsonData]);
  const URL = window.webkitURL || window.URL;
  const link = document.createElement("a");
  const src = URL.createObjectURL(blob);
  link.href = src;
  link.download = `${mapName || 'map'}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(src);
}

function handleError(error) {
  if(document.getElementsByClassName('message error').length > 2) return;
  Message({
    message: error.message,
    type: 'error',
  });
}

function getImageSizeAsync(url) {
  return new Promise((resolve, reject) => {
    const imgElem = new Image();
    imgElem.src = url;
    imgElem.onload = () => {
      const data = {
        width: imgElem.naturalWidth,
        height: imgElem.naturalHeight,
      };
      resolve(data);
    };
    imgElem.onerror = (error) => {
      reject(error);
    };
  });
}

function rotateMatrix(matrix) {
  const width = matrix.length;
  const height = matrix[0].length;
  const rotatedWidth = height;
  const rotatedHeight = width;
  const rotatedMatrix = [];

  for (let i = 0; i < rotatedWidth; i++) {
    const rotatedRow = [];
    for (let j = 0; j < rotatedHeight; j++) {
      rotatedRow[j] = matrix[j][i];
    }
    rotatedMatrix[i] = rotatedRow;
  }

  return rotatedMatrix;
}

function copyMatrix(matrix) {
  const width = matrix.length;
  const height = matrix[0].length;
  const matrixCopy = matrix;
  for (let i = 0; i < width; i++) {
    const row = [];
    for (let j = 0; j < height; j++) {
      row[j] = matrix[i][j];
    }
    matrixCopy[i] = row;
  }
  return matrixCopy;
}

function mapToList(map) {
  return Object.keys(map).map((key) => map[key]);
}

function getBase64Image(img) {  
  var canvas = document.createElement("canvas");  
  canvas.width = img.width;  
  canvas.height = img.height;  
  var ctx = canvas.getContext("2d");  
  ctx.drawImage(img, 0, 0, img.width, img.height);  
  var ext = img.src.substring(img.src.lastIndexOf(".")+1).toLowerCase();  
  var dataURL = canvas.toDataURL("image/"+ext);  
  return dataURL;  
}

function getEmptyMapBase64() {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = 'https://verseland.oss-cn-shanghai.aliyuncs.com/images/emptyMap.png';
    img.onload = () => {
      resolve(getBase64Image(img));
    };
    img.onerror = (err) => {
      reject(err);
    };
  });
}

function getZIndex(userLayer, isMaskPlayer) {
  switch (userLayer) {
    case USER_LAYER.FLAG :  //标记图层
        return NEW_LAYERS.FLAG_OBJ;
    case USER_LAYER.OBJ :  //物件层
        return isMaskPlayer ? NEW_LAYERS.OBJ_ABOVE_AVATAR : NEW_LAYERS.OBJ_BELOW_AVATAR;
    case USER_LAYER.WALL :  //墙体层
        return isMaskPlayer ? NEW_LAYERS.WALL_FRONT : NEW_LAYERS.WALL_BEHIND;
    case USER_LAYER.FLOOR :  //地面层
        return NEW_LAYERS.GROUND;
    case USER_LAYER.FREE_OBJ : //自由物体层
        return isMaskPlayer ? NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR : NEW_LAYERS.FREE_OBJ_BELOW_AVATAR;
    default :   //异常处理
        return "";
  }
}

// 根据选中对象的zIndex判定该对象对应的编辑模式
function getModeByZIndex(zIndex) {
  // 背景图
  if (zIndex === 0) return Mode.Stickers;

  switch (zIndex) {
    case NEW_LAYERS.FLAG_OBJ:
      return Mode.TileEffects;
    case NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR:
    case NEW_LAYERS.FREE_OBJ_BELOW_AVATAR:
      return Mode.Stickers;
    case NEW_LAYERS.WALL_FRONT:
    case NEW_LAYERS.WALL_BEHIND:
      return Mode.Walls;
    case NEW_LAYERS.OBJ_ABOVE_AVATAR:
    case NEW_LAYERS.OBJ_BELOW_AVATAR:
      return Mode.Objects;
    case NEW_LAYERS.GROUND:
      return Mode.Floors;
    default:
      return '';
  }
}

function getZIndexListByMode(mode) {
  if (mode === Mode.TileEffects) {
    return [NEW_LAYERS.FLAG_OBJ];
  } else {
    return [
      NEW_LAYERS.FREE_OBJ_ABOVE_AVATAR,
      NEW_LAYERS.WALL_FRONT,
      NEW_LAYERS.OBJ_ABOVE_AVATAR,
      NEW_LAYERS.AVATAR,
      NEW_LAYERS.OBJ_BELOW_AVATAR,
      NEW_LAYERS.FREE_OBJ_BELOW_AVATAR,
      NEW_LAYERS.WALL_BEHIND,
      NEW_LAYERS.GROUND,
      // 背景图的zIndex
      0,
    ];
  }
}

function getContextMenuOptions(object, objectList) {
  const index = objectList.findIndex((obj) => obj === object);
  if (index === -1) return;

  const total = objectList.length;
  if (total === 1) {
    return [
      {
        key: 'delete',
        label: '删除',
      },
    ];
  } else if (total >= 2 && index === 0) {
    return [
      {
        key: 'bringToFront',
        label: '置于顶层',
      },
      {
        key: 'bringForward',
        label: '上移一层',
      },
      'divider',
      {
        key: 'delete',
        label: '删除',
      },
    ];
  } else if (total >= 2 && index === total - 1) {
    return [
      {
        key: 'sendBackwards',
        label: '下移一层',
      },
      {
        key: 'sendToBack',
        label: '置于底层',
      },
      'divider',
      {
        key: 'delete',
        label: '删除',
      },
    ];
  } else {
    return [
      {
        key: 'bringToFront',
        label: '置于顶层',
      },
      {
        key: 'bringForward',
        label: '上移一层',
      },
      {
        key: 'sendBackwards',
        label: '下移一层',
      },
      {
        key: 'sendToBack',
        label: '置于底层',
      },
      'divider',
      {
        key: 'delete',
        label: '删除',
      },
    ];
  }
}

// 补全图片缺少的新增字段
function completeImageMissingFields(image) {
  image.name = '贴图';
  image.userLayer = USER_LAYER.FREE_OBJ;
  image.isMaskPlayer = image.zIndex > NEW_LAYERS.AVATAR;
}

// 补全文字缺少的新增字段
function completeTextMissingFields(text) {
  text.userLayer = USER_LAYER.FREE_OBJ;
  text.isMaskPlayer = text.zIndex > NEW_LAYERS.AVATAR;
}

// TODO: 尝试使用 fabric.Object() 自带的几何关系检测函数
function transformPoint(point, origin, angle, fabric) {
  const rotatedPoint = rotatePoint({ x: point.left, y: point.top }, { x: origin.left, y: origin.top }, -angle, fabric);
  return { left: rotatedPoint.x, top: rotatedPoint.y };
}

function rotatePoint(point, origin, angle, fabric) {
  const { calcRotateMatrix, multiplyTransformMatrices, transformPoint } = fabric.util;
  const translateMatrix1 = [1, 0, 0, 1, origin.x, origin.y];
  const rotateMatrix = calcRotateMatrix({ angle });
  const translateMatrix2 = [1, 0, 0, 1, -origin.x, -origin.y];
  const finalMatrix = multiplyTransformMatrices(multiplyTransformMatrices(translateMatrix1, rotateMatrix), translateMatrix2);
  return transformPoint(point, finalMatrix);
}

function rotateRect(rect, fabric) {
  const { left, top, width, height, angle } = rect;
  const tl = { x: left, y: top };
  const tr = { x: left + width, y: top };
  const br = { x: left + width, y: top + height };
  const bl = { x: left, y: top + height };
  return {
    tl,
    tr: rotatePoint(tr, tl, angle, fabric),
    br: rotatePoint(br, tl, angle, fabric),
    bl: rotatePoint(bl, tl, angle, fabric),
  };
}

function intersectRectRect(rect1, rect2, fabric) {
  const { tl: tl1, tr: tr1, br: br1, bl: bl1 } = rotateRect(rect1, fabric);
  const { tl: tl2, tr: tr2, br: br2, bl: bl2 } = rotateRect(rect2, fabric);
  const polygon1 = [tl1, tr1, br1, bl1];
  const polygon2 = [tl2, tr2, br2, bl2];
  const intersection = fabric.Intersection.intersectPolygonPolygon(polygon1, polygon2);
  return intersection.status === 'Intersection';
}

function getInitialTagsByItem(item) {
  if (item.children.length === 0) {
    return [item.id];
  }
  if (item.children[0].children.length === 0) {
    return [item.id];
  }
  return item.children.map(({ id }) => id);
}

function resourceToTileCategory(resource) {
  const { id, name, url, w, h } = resource;
  return getImageSizeAsync(url).then(({ width, height }) => {
    return new TileCategory({
      id,
      code: id,
      name,
      describe: '',
      url,
      w: width,
      h: height,
      layer: 5,
      obstacle: false,
      shelter: true,
      spin: {
        status: false,
        images: [
          {
            name,
            url,
            h,
            w,
          },
        ],
      },
      node: {
        type: 0,
        images: [],
      },
    });
  });
}

function trimEdgeObstacles(obstacles, width, height) {
  const excludeList = [];
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const isEdge = i === 0 || i === height - 1 || j === 0 || j === width - 1;
      if (isEdge) {
        excludeList.push(i * width + j);
      }
    }
  }
  return obstacles.filter((item) => !excludeList.includes(item));
}

// 从图片url中提取出图片文件名
function getNameFromImageURL(imageURL) {
  return imageURL.substring(imageURL.lastIndexOf("/") + 1);
}

// 叠加图片的接口有超时限制，一次处理太多group会超时，group的objects太多耗时也长。所以决定
// 按顺序每个group请求一次接口，最后合并数据后返回
// TODO: 如果后续遇到了单个group调用接口超时的情况，需要向后端反馈，调整超时限制
async function compositeListMapsSequentially(lists) {
  let result = [];
  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];
    const res = await compositeListMaps([list]);
    if (res.data && res.data.code === 200 && res.data.data) {
      result = result.concat(res.data.data);
    } else {
      throw new Error(res.data && res.data.message);
    }
  }
  return result;
}

export {
  createCrossOriginImage,
  getUuid,
  downloadJson,
  handleError,
  getImageSizeAsync,
  rotateMatrix,
  copyMatrix,
  mapToList,
  getBase64Image,
  getEmptyMapBase64,
  getZIndex,
  getModeByZIndex,
  getZIndexListByMode,
  getContextMenuOptions,
  completeImageMissingFields,
  completeTextMissingFields,
  transformPoint,
  intersectRectRect,
  getInitialTagsByItem,
  resourceToTileCategory,
  trimEdgeObstacles,
  getNameFromImageURL,
  rotateRect,
  compositeListMapsSequentially,
  createPlaceholder,
};
