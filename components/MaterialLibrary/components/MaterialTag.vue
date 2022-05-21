<template>
    <div class="MaterialTag">
        <div class="MaterialTag-list" v-for="(item, index) in computedItems" :key="index">
            <MaterialTagItem
                :item="item"
                :index="index"
                :onTagIndexChange="onTagIndexChange"
            />
        </div>
    </div>
</template>

<script>
// TODO: 改造成受控组件
import MaterialTagItem from "./MaterialTagItem.vue"

export default{
    components:{
        MaterialTagItem
    },
    props: {
        item: {
            type: Object,
        },
        onTagsChange: {
            type: Function,
        },
    },
    data() {
        return {
            tagIndexMap: {},
            tagName:[],
        };
    },
    computed: {
        computedItems() {
            if (this.item == null || this.item.children.length === []) return [];
            
            if (this.item.children[0].children.length > 0) {
                return this.item.children;
            } else {
                return [
                    {
                        id: null,
                        name: '分类方式',
                        children: this.item.children,
                    },
                ];
            }
        },
    },
    mounted() {
        this.initTagIndexMap();
    },
    methods: {
        initTagIndexMap() {
            this.computedItems.forEach((item, index) => {
                this.tagIndexMap[index] = -1;
            });
        },
        onTagIndexChange(index, tagIndex) {
            this.tagIndexMap[index] = tagIndex;
            const tags = [];
            // TODO: 重构整个标签选择，现在非常乱
            const andTags = [];
            for (let i in this.tagIndexMap) {
                const tagIndex = this.tagIndexMap[i];
                if (tagIndex > -1) {
                    const item = this.computedItems[i].children[tagIndex]; //素材tag
                    if (item.id != null && !tags.includes(item.id)) {
                        tags.push(item.id);
                        andTags.push(item.id);
                    }
                } else {
                    const itemType = this.computedItems[i]; //素材分类方式tag,场景，功能
                    if (itemType.id !== null && !tags.includes(itemType.id)) {
                        tags.push(itemType.id);
                    }
                }
            }
            if (tags.length === 0) {
                const itemMold = this.item//素材大类，例物件、地板、贴纸等taglist
                tags.push(itemMold.id);
            }
            // 标签（导航）之间的关系，是 and 还是 or
            const condition = andTags.length >= 2 ? 'and' : 'or';
            this.onTagsChange(tags, condition);
        },
    },
}
</script>

<style lang="scss" scoped>
.MaterialTag {
    width: 100%;
    .MaterialTag-list{
        margin-top: 16px;
        position: relative;
        align-items: center;
    }
}
</style>
