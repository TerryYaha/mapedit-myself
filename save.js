import { CELL_HEIGHT, CELL_WIDTH, INTERACTIVE_TYPE, NEW_LAYERS, NEW_LAYER_LABEL } from "./const";
import { convertBackgroundToExportBackground, convertImageToExportImage, convertTextToExportText } from "./convert";
import { getUuid, copyMatrix, rotateMatrix } from './util';

// 返回一个空的mapData数据，因为有的用户新建完地图之后可能不会点击保存，直接退出。所以需要新建
// 完成之后直接绑定一个空地图Json
function getEmptyMap(mapHeight, mapWidth, name) {
  const mapData = {
    version: 2,
    name,
    width: parseInt(mapWidth, 10),
    height: parseInt(mapHeight, 10),
    tilewidth: CELL_WIDTH,
    tileheight: CELL_HEIGHT,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    properties: {},
    privateSpace: [],
    tilesets: [],
    layers: [],
    birthPos: {
      x: 0,
      y: 0,
    },
    interactivePos: [],
    imagePos: [],
    textPos: [],
    background: null,
    // 新版本编辑器新增字段
    // tilemaps: [],
    // images: [],
    // texts: [],
    // 更新的版本，使用字段objects代替字段tilemaps,images,texts
    objects: [],
    // 背景图
    backgroundImage: null,
    // 用户上传的背景图
    backgroundSticker: null,
    // 用户上传的贴图
    personalStickers: [],
    // 不再包含旧版本编辑器字段 MEData 和 canvasJson
  };
  const json = JSON.stringify(mapData, null, 0);
  // 空图片
  const base64Png = 'data:,';
  return {
    jsonData: json,
    pngData: base64Png,
  };
}

function updateMap(mapData, { backgroundImage, objects, tilemaps, compositeTilemaps, images, texts, mapIds = {}, backgroundSticker, personalStickers}) {
  const { width, height } = mapData;
  const tilesets = getTilesets(compositeTilemaps, mapIds);
  const layers = getLayers(width, height, tilemaps, compositeTilemaps, tilesets);
  const birthPos = getBirthPos(tilemaps);
  const portals = getPortalPos(tilemaps);
  const interactivePos = getInteractivePos(tilemaps);
  const imagePos = getImagePos(images, height);
  const textPos = getTextPos(texts, height);
  const background = backgroundImage ? convertBackgroundToExportBackground(backgroundImage, height) : null;
  mapData.version = 2;
  const newData = {
    ...mapData,
    objects,
    birthPos,
    portals,
    tilesets,
    layers,
    interactivePos,
    imagePos,
    textPos,
    background,
    backgroundImage,
    backgroundSticker,
    personalStickers,
  };
  // 移除旧数据
  delete newData.MEData;
  delete newData.canvasJson;
  delete newData.tilemaps;
  delete newData.images;
  delete newData.texts;
  return newData;
}

function getBirthPos(tilemaps) {
  const birthTilemap = tilemaps.find((tilemap) => tilemap.isbirth);
  const { left, top, tilewidth, tileheight } = birthTilemap;
  return {
    x: left / tilewidth,
    y: top / tileheight,
  };
}

function getPortalPos(tilemaps) {
  const portalTilemap = tilemaps.filter((tilemap) => tilemap?.isPortal);
  let portals = [];
  for(let i=0;i<portalTilemap.length;i++){
    let portal = {};
    const { left, top, tilewidth, tileheight ,targetMap} = portalTilemap[i]
    portal.location = {
      x: left / tilewidth,
      y: top / tileheight,
    }
    portal.target = {
      eventId:targetMap.eventId,
      spaceId:targetMap.spaceId,
    }
    portals.push(portal)
  }
  return portals;
}

function getTilesets(tilemaps, mapIds) {
  const tilesets = [
    //这里的这个Tile，是一个透明的图片
    //用处是，我在地图编辑器使用绿块画禁行区域的时候
    //在导出Json的时候得把这个绿色的禁行区域变成这个透明的图片
    {
      firstgid: 1,
      endgid: 1,
      image: "Verse_A.png",
      imageURL: "static/Verse_A.png",
      imageheight: 64,
      imagewidth: 64,
      name: "碰撞空方块",
      tileID: "customID001geilaozipa",
      tileNums: 1,
      tileheight: 64,
      tilewidth: 64,
      // 记录物体在编辑器中的zIndex，从1开始的。Cocos中不会用到该zIndex
      zIndex: NEW_LAYERS.AVATAR,
    },
  ];

  let currentGid = 1;
  const uniqueImageIds = ['Verse_A.png'];

  tilemaps.forEach((tilemap) => {
    const { id, tileID, tileNums, imageURL, zIndex, image, imageheight, imagewidth, name, tileheight, tilewidth } = tilemap;
    if (uniqueImageIds.includes(image) || mapIds[id]) return;

    //firstgid  和 endgid 分别代表什么意思
    //比如物体 A 占4个格子，物体 B 占2个格子,物体 C 占1个格子
    //现在一次把他放在 newTileSets 中
    //一个 A 物体 将分成 4 块，firstgid = 1,endgid = 4，tileNums = 4
    //一个 B 物体 将分成 2 块，firstgid = 5，endgid = 6，tileNums = 2
    //一个 C 物体 将分成 1 块，firstgid = 7，endgid = 7，tileNums = 1
    const firstgid = currentGid + 1;
    const endgid = firstgid + tileNums - 1;
    currentGid = endgid;
    uniqueImageIds.push(image);

    tilesets.push({
      tileID,
      firstgid,
      endgid,
      tileNums,
      imageURL,
      // 记录物体在编辑器中的zIndex，从1开始的。Cocos中不会用到该zIndex
      zIndex,
      image,
      imageheight,
      imagewidth,
      name,
      tileheight,
      tilewidth,
    });
  });

  return tilesets;
}

function getLayers(width, height, tilemaps, compositeTilemaps, tilesets) {
  const layers = createEmptyLayers(width, height);

  compositeTilemaps.forEach((tilemap) => {
    const { left, top, tilewidth, tileheight, zIndex } = tilemap;
    const tileLeft = left / tilewidth;
    const tileTop = top / tileheight;
    // console.log(`${zIndex} => `, tileLeft, tileTop);
    layers[zIndex - 1].data[tileLeft][tileTop] = tilemap;
  });

  tilemaps.forEach((tilemap) => {
    const { left, top, tilewidth, tileheight, imagewidth, imageheight, zIndex, isCollider } = tilemap;
    const tileLeft = left / tilewidth;
    const tileTop = top / tileheight;
    const countX = imagewidth / tilewidth;
    const countY = imageheight / tileheight;
    //除了地板层,和原有的碰撞层之外
    //其他层都可能有物体会设置为碰撞物体
    //那么这里就是要把其他的的所有碰撞位置都合并到Collider层上
    if (isCollider && zIndex !== NEW_LAYERS.GROUND) {
      for (let top = tileTop; top < tileTop + countY; top++) {
        for (let left = tileLeft; left < tileLeft + countX; left++) {
          layers[NEW_LAYERS.AVATAR - 1].data[left][top] = 1;
        }
      }
    }
  });

  layers.forEach((layer) => {
    const data = transformLayerData(layer.data, layer.zIndex, tilesets);
    layer.data = {};
    console.log('transformLayerData');
    data.forEach((e, index) => {
      if(e){
        layer.data[index] = e;
      }
    })
  });

  return layers;
}

function createEmptyLayers(width, height) {
  const getData = () => Array(width).fill(0).map(() => Array(height).fill(0));
  const ascLayers = Object.values(NEW_LAYERS).sort();
  return ascLayers.map((layer) => ({
    name: NEW_LAYER_LABEL[layer],
    type: 'tilelayer',
    tiles: [],
    zIndex: layer,
    data: getData(),
    height,
    width,
    visible: true,
    opacity: 1,
    x: 0,
    y: 0,
  }));
}

function transformLayerData(data, zIndex, tilesets) {
  //这个数组里存放的是 analysisData 数组中 切割之后的 firstgid 到 endgid
  //一个 A 物体 将分成 4 块，firstgid = 1,endgid = 4，tileNums = 4 A是一个田字形的4格
  //一个 B 物体 将分成 2 块，firstgid = 5，endgid = 6，tileNums = 2 B是一个日子形的2格
  //一个 C 物体 将分成 1 块，firstgid = 7，endgid = 7，tileNums = 1 C只占一格
  //假设 经过上面矩阵转换之后,显示以下信息
  //[0,0,A,0,0,0]
  //[0,B,0,0,0,0]
  //[0,0,0,0,C,0]
  //经过切割之后,会变成

  //[0,0,1,2,0,0]
  //[0,5,3,4,0,0]
  //[0,6,0,0,7,0]
  const gidData = transformTileToGid(data, tilesets);
  
  //这个数组对 newAnalysisData 数组进行进一步操作
  //首先它 是 Collider 层 或者 Flag 有绿块的层 才会进行标 1 操作
  //要求地图周围一圈自动生成禁行区域,所以遍历到边缘的时候都标记为 1
  //假设 上面的 A 物体 是一个禁行区域，C 物体是一个绿块的碰撞标记
  //[0,0,1,2,0,0]
  //[0,5,3,4,0,0]
  //[0,6,0,0,7,0]
  //那么 经过 以下的操作之后,上面的数组 Collider 会被处理成
  //[ 1,1,1,1,1,1
  //  1,5,1,1,0,1
  //  1,1,1,1,1,1]
  //周围一圈,以及 A物体的 1,2,3,4 和 C 物体的7 全部变成 1
  //newData 是一个 一维数组，因为cocos中 对一维数组更容易读取

  // 如果是 collider 层，将大于 1 的 gid 都设成 1
  let fencedData = gidData;
  if (zIndex === NEW_LAYERS.AVATAR) {
    fencedData = fenceUp(gidData);

    const width = fencedData.length;
    const height = fencedData[0].length;

    for (let left = 0; left < width; left++) {
      for (let top = 0; top < height; top++) {
        if (fencedData[left][top] > 1) {
          fencedData[left][top] = 1;
        }
      }
    }
  }

  if (zIndex === NEW_LAYERS.FLAG_OBJ) {
    const width = fencedData.length;
    const height = fencedData[0].length;

    for (let left = 0; left < width; left++) {
      for (let top = 0; top < height; top++) {
        if (fencedData[left][top] > 1) {
          fencedData[left][top] = 1;
        }
      }
    }
  }

  //解析数组
  //因为cocos最终需要的x,y是坐标系中的x,y,而二维数组中x,y是第x行，第y列
  //数组
  // (0,0) (0,1) (0,2)
  // (1,0) (1,1) (1,2)
  // (2,0) (2,1) (2,2)

  //cocos坐标系 (x轴，y轴) 越往下y越大，越往右x越大
  // (0,0) (1,0) (2,0)
  // (0,1) (1,1) (2,1)
  // (0,2) (1,2) (2,2)

  //因此要进行一个 数组 与 坐标系 的矩阵转换
  //这个二维数组里存放的是Tile的对象
  const rotatedData = rotateMatrix(fencedData);


  // 转成一维数组
  const dataList = rotatedData.flat();

  //导出json之后会发现每一层的数据，如果左上角没有数据
  //就会变成 1
  //以为如果一个层 没有任何物体 全部为 0
  //cocos将不会加载这个层
  //所以一个层没有任何物体的时候,要在 右上角加 1
  //这个 1 是上面 newTileSets 中 写死的一个透明的图块 的 firstgid 
  if(dataList[0] === 0) {
    dataList[0] = 1;//给每一层0的地方添加一个1,以便cocos读取层级
  }

  return dataList;
}

function transformTileToGid(data, tilesets) {
  const gidData = copyMatrix(data);

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    for (let j = 0; j < row.length; j++) {
      const tilemap = row[j];
      if (typeof tilemap !== 'number') {
        const { image, left, top, imagewidth, imageheight, tilewidth, tileheight } = tilemap;
        const tileLeft = left / tilewidth;
        const tileTop = top / tileheight;
        const countX = imagewidth / tilewidth;
        const countY = imageheight / tileheight;

        const tileset = tilesets.find((tileset) => tileset.image === image);
        const { firstgid } = tileset;
        let gid = firstgid;
        // gid 优先在水平方向自增
        for (let top = tileTop; top < tileTop + countY; top++) {
          for (let left = tileLeft; left < tileLeft + countX; left++) {
            gidData[left][top] = gid++;
          }
        }
      }
    }
  }

  return gidData;
}

function fenceUp(data) {
  const fencedData = copyMatrix(data);
  const width = data.length;
  const height = data[0].length;

  [0, width - 1].forEach((left) => {
    for (let top = 0; top < height; top++) {
      fencedData[left][top] = 1;
    }
  });

  [0, height - 1].forEach((top) => {
    for (let left = 0; left < width; left++) {
      fencedData[left][top] = 1;
    }
  });
  
  return fencedData;
}

function getInteractivePos(tilemaps) {
  const interactivePos = []; //存放所有交互物体数组

  tilemaps.forEach((tilemap) => {
    const {
      zIndex,
      left,
      top,
      imageheight,
      imagewidth,
      tileheight,
      tilewidth,
      interactiveType,
      interactiveURL,
      interactiveMsg,
    } = tilemap;

    if (interactiveType === INTERACTIVE_TYPE.DEFAULT) return;

    const tileLeft = left / tilewidth;
    const tileTop = top / tileheight;
    for (let i = tileLeft; i < tileLeft + imagewidth / tilewidth; i++) {
      for (let j = tileTop; j < tileTop + imageheight / tileheight; j++) {
        interactivePos.push({
          isPoint: i === tileLeft && j === tileTop,
          zIndex,
          tileLeft: i,
          tileTop: j,
          // 注；实验发现 cocos 中使用该字段的值来访问可交互文档
          tileID: interactiveType === INTERACTIVE_TYPE.LOCAL_FILE ? interactiveMsg : getUuid(),
          interactiveType,
          interactiveURL,
          interactiveMsg,
        });
      }
    }
  });

  return interactivePos;
}

function getTextPos(texts, mapHeight) {
  return texts.map((text) => convertTextToExportText(text, mapHeight));
}

function getImagePos(images, mapHeight) {
  return images.map((image) => convertImageToExportImage(image, mapHeight));
}

export {
  getEmptyMap,
  updateMap,
};
