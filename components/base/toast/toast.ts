import { createVNode, render } from 'vue'
import toastTemplate from './toast.vue'
export interface IProps {
    message?: string;
    duration?: number;
    background?: string;
    color?: string;
    type?: string;
    showClose?: boolean;
}
const defaultOpt = { // 创建默认参数
    duration: 3000,
    showClose: true
}

export interface ResultParams {
    destory?: () => void;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const Toast = (options: IProps):ResultParams => {
    const container = document.createElement('div')
    const opt = {...defaultOpt,...options}
    const vm = createVNode(toastTemplate, opt) // 创建vNode
    render(vm, container)
    document.body.appendChild(container)       // 添加到body上
    const destory =  ()=> {
        render(null, container)
        document.body.removeChild(container)
    }
    // 如果传入的值为0可以持续保留在页面，需要手动销毁
        const timer = setTimeout(()=> {
            destory()
            clearTimeout(timer)
        }, opt.duration)
    // 给最后一个元素绑定destory事件
        if(opt.showClose) {
            const closeLis = document.getElementsByClassName('toast-close')
            closeLis[closeLis.length - 1]?.addEventListener('click', function () {
                clearTimeout(timer)
                destory()
            }) 
        }
    
    return {
        destory
    }
}
export default Toast
