<template>
    <div class="MaterialSearch">
        <IconFont type="icon-search" class="search-icon" />
        <input
            class="search-input"
            :placeholder="'在 '+materialSearchType+' 下搜索'"
            v-model="keyword"
            @keyup.enter="onEnter"
        />
        <IconFont
            v-show="keyword.length>0 || isShowClear"
            type="icon-delete3"
            class="delete-icon"
            @click="clearKeyWord()"
        />
    </div>
</template>

<script>
import IconFont from "../../iconFont";

export default {
    components: {
        IconFont,
    },
    props:{
        onSearch: {
            type: Function,
        },
        materialSearchType:{
            type:String,
            default:'“此内容”'
        },
        onClear: {
            type: Function,
        },
    },
    data(){
        return {
            keyword: '',
            isShowClear:false
        }
    },
    methods: {
        onEnter() {
            if(!this.keyword){
                this.onSearch(this.keyword,this.isShowClear)
                this.onClear();
                this.isShowClear = false  
            }else{
                this.isShowClear = true;
                this.onSearch(this.keyword);

            }
        },
        clearKeyWord(){
            this.keyword = '';
            this.onEnter() 
            this.onClear();
            this.isShowClear = false           
        }
    },
}
</script>

<style scoped>
.MaterialSearch {
    margin-top: 16px;
    width: 100%;
    height: 40px;
    border-radius: 5px 5px 5px 5px;
    border: 1px solid #E0E0E0;
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    align-items: center;
}
.MaterialSearch:hover{
    outline: 2px solid #8F7EF4;
}
.MaterialSearch .search-icon {
    font-size: 24px;
    color: #282C4A;
}
.MaterialSearch .search-input {
    margin-left: 8px;
    height: 20px;
    width: 160px;
    font-size: 12px;
    font-weight: 400;
}
.search-input::-webkit-input-placeholder {
/* WebKit browsers */
    color: #E0E0E0;
}
.search-input:-moz-placeholder {
 /* Mozilla Firefox 4 to 18 */
    color: #E0E0E0;
}
.search-input::-moz-placeholder {
 /* Mozilla Firefox 19+ */
    color: #E0E0E0;
 }
.search-input::-ms-input-placeholder {
 /* Internet Explorer 10+ */
    color: #E0E0E0;
}
.delete-icon{
    cursor: pointer;
    font-size: 24px;
    color: #282C4A;
}
</style>