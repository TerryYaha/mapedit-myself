import { CELL_WIDTH, CELL_HEIGHT, TileEffectType } from '../const';
import { getZIndex } from '../util';
import TileInfo from './tileInfo';

class TileCategory {
  constructor({
    code,
    describe,
    h,
    id,
    layer,
    name,
    node,
    obstacle,
    shelter,
    spin,
    url,
    w,
  }) {
    this.code = code;
    this.describe = describe;
    this.h = h;
    this.id = id;
    this.layer = layer;
    this.name = name;
    this.node = node;
    this.obstacle = obstacle;
    this.shelter = shelter;
    this.spin = spin;
    this.url = url;
    this.w = w;
  }

  toTileInfo() {
    return new TileInfo({
      tileID: this.id,
      tileNums: (this.w / CELL_WIDTH) * (this.h / CELL_HEIGHT),
      imageURL: this.url,
      zIndex: getZIndex(this.layer, this.shelter),
      // 移除image字段
      // image,
      left: null,
      top: null,
      width: this.w,
      height: this.h,
      imageheight: this.h,
      imagewidth: this.w,
      name: this.name,
      node: this.node,
      tileheight: CELL_WIDTH,
      tilewidth: CELL_HEIGHT,
      tileLeft: null,
      tileTop: null,
      userLayer: this.layer,
      isCollider: this.obstacle,
      spin: this.spin,
      //是否遮住人
      isMaskPlayer: this.shelter,
      interactiveType: 0, //交互类型
      interactiveURL: '', //交互URL
      interactiveMsg: null, //交互信息
      isbirth: this.name === TileEffectType.Spawn, //是否是出身点
      isPrivateSpace: false, //是否是私密空间
      isPortal:this.name === TileEffectType.TransferDoor, // 是否是传送地块
      describe: this.describe,
    });
  }
}

export default TileCategory;
