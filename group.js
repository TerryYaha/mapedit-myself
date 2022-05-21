import _ from 'underscore';
import { Group, Rect } from './model';
import { getUuid } from './util';

/**
 * 对物件列表进行分组
 * @param {Array.<Tilemap>} tilemaps 一层内从低到高排序的物件列表
 * @returns {Array.<Group>} 分组的列表
 */
function groupTilemaps(tilemaps, allTilemaps) {
  const tilemapsToGroup = tilemaps.map((tilemap) => ({
    ...tilemap,
    rect: Rect.fromLTWH(tilemap.left, tilemap.top, tilemap.width, tilemap.height),
  }));
  const groups = [];

  while (tilemapsToGroup.length > 0) {
    const tilemap = tilemapsToGroup.shift();
    const overlappedGroups = groups.filter((group) => group.getRect().overlaps(tilemap.rect));
    // 如果物件与分组重叠，则从该物件和重叠的分组中的物件创建一个新分组，移除重叠的旧分组
    if (overlappedGroups.length > 0) {
      const newGroup = new Group(getUuid());
      newGroup.objects.push(tilemap);
      overlappedGroups.forEach((group) => {
        group.objects.forEach((obj) => {
          newGroup.objects.push(obj);
        });
        const index = groups.findIndex(({ id }) => id === group.id);
        groups.splice(index, 1);
      });
      groups.push(newGroup);
      // 检查新分组是否与其他分组重叠
      const groupRect = newGroup.getRect();
      const overlappedGroups2 = groups.filter((group) => group.getRect().overlaps(groupRect));
      if (overlappedGroups2.length > 0) {
        const newGroup2 = new Group(getUuid());
        overlappedGroups2.forEach((group) => {
          group.objects.forEach((obj) => {
            newGroup2.objects.push(obj);
          });
          const index = groups.findIndex(({ id }) => id === group.id);
          groups.splice(index, 1);
        });
        groups.push(newGroup2);
      } else {
        groups.push(newGroup);
      }
    // 否则，创建一个新的分组
    } else {
      const newGroup = new Group(getUuid());
      newGroup.objects.push(tilemap);
      groups.push(newGroup);
    }
  }

  // 剔除只有一个物件的分组
  const effectiveGroups = groups.filter((group) => group.objects.length > 1);

  // 分组内部的物件按在地图大图层中的上下顺序排序
  effectiveGroups.forEach((group) => {
    group.objects.forEach((obj) => {
      obj.groupId = group.id;
    });
    group.objects.sort((a, b) => {
      const aIndex = allTilemaps.findIndex(({ id }) => id === a.id);
      const bIndex = allTilemaps.findIndex(({ id }) => id === b.id);
      return aIndex - bIndex;
    });
  });
  return effectiveGroups;
}

const min = Math.min;
const max = Math.max;

function compositeIamges(groups){
  const lists = [];
  const groupIds = {};
  //获取整个大图的起始点和宽高
  groups.forEach(g => {
      let startX = Infinity;
      let startY = Infinity;
      let w = 0;
      let h = 0;
      let res = {};

      const { objects } = g;
      objects.forEach(o => {
        const {left, top, width, height} = o;
        startX = min(startX, left);
        startY = min(startY, top);

        w = max(left + width, w);
        h = max(top + height, h);
      })

      res.width = w - startX;
      res.high = h - startY;
      res.left = startX;
      res.top = startY;

       //处理成合成图片的数据结构
      res.subgraph = objects.map(o => {
        const {left, top, width, height, imageURL, id} = o;
        const l = left - startX;
        const t = top - startY;
        const w = width;
        const h = height;
        const url = imageURL;
        groupIds[id] = true;
        return { xOffset: l, yOffset: t, w, h, url, id }
      })
      lists.push({...res});
  });

  
  return {lists, groupIds};
}

function formatCompositLists(lists) {
  return lists.map(({ width, high, subgraph }) => {
    return {
      width,
      high,
      subgraph: subgraph.map(({ xOffset, yOffset, url }) => ({ xOffset, yOffset, url })),
    };
  });
}

function updateCompositeIamgeToLayers(o){
  
}

export {
  compositeIamges,
  groupTilemaps,
  formatCompositLists,
};
