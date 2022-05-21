<template>
    <el-scrollbar>
        <div class="MaterialList">
            <MaterialEmpty v-if="isEmpty" />
            <TileEffect
                v-for="tileEffect in tileEffects"
                :key="tileEffect.id"
                :tileEffect="tileEffect"
                :disabled="(tileEffect.name === TileEffectType.Spawn && !birthPointEnabled)
                || (tileEffect.name === TileEffectType.TransferDoor && transferPointEnabled)"
                :checked="tileEffect.id === tileEffectMaterialId"
                :onClick="handleClick"
            />
        </div>
    </el-scrollbar>
</template>

<script>
import { getSysMaterial } from '../../../../api/api';
import { TileEffectType } from '../../const';
import { getUuid } from '../../util';
import MaterialEmpty from './components/MaterialEmpty.vue';
import TileEffect from './components/TileEffect.vue';

export default {
    components: {
        MaterialEmpty,
        TileEffect,
    },
    props: {
        item: {
            type: Object,
        },
        selectedTileEffectMaterial:{
            type: Object
        },
        setTileEffectMaterial:{
            type: Function
        },
        birthPointEnabled: {
            type: Boolean,
        },
        transferPointEnabled:{
            type:Boolean,
        }
    },
    data() {
        return {
            TileEffectType,
            list: [],
        }
    },
    computed: {
        tileEffectMaterialId() {
            return this.selectedTileEffectMaterial?.id;
        },
        tileEffects() {
            const effects = this.list.map((effect) => {
                let describe;
                let tip;
                if (effect.name === TileEffectType.Spawn) {
                    describe = '人物在这里出现';
                    tip = '出生点只能创建一个哦～';
                } else if (effect.name === TileEffectType.Impassable) {
                    describe = '人物不能通过';
                    tip = '禁行区域不能与其他地块效果重叠';
                }
                return {
                    ...effect,
                    describe,
                    tip,
                };
            });
            return [TileEffectType.Spawn, TileEffectType.Impassable , TileEffectType.TransferDoor]
                .map((name) => effects.find((effect) => effect.name === name))
                .filter((effect) => !!effect);
        },
        isEmpty() {
            return this.tileEffects.length === 0;
        },
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        handleClick(tilemap) {
            if (tilemap.name === TileEffectType.Spawn) {
                if (this.birthPointEnabled) {
                    this.setTileEffectMaterial(tilemap);
                }
            }else if(tilemap.name === TileEffectType.TransferDoor){
                if (!this.transferPointEnabled){
                    this.setTileEffectMaterial(tilemap);
                }
            }
             else {
                this.setTileEffectMaterial(tilemap);
            }
        },
        fetchData() {
            const params = {
                pageNum: 1,
                pageSize: 100,
                navigationIds: [this.item.id],
            };
            getSysMaterial(params)
            .then((res) => {
                if (res.data.code === 200) {
                    const newList = res.data.data.list.map((item) => ({ ...item, id: item.code }));
                    this.list = this.list.concat(newList);
                } else {
                    // TODO:
                }
            })
            .catch(() => {
                // TODO:
            });
        },
    },
}

</script>

<style lang="scss" scoped>
.MaterialList {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 16px;
    overflow: auto;
}
</style>
