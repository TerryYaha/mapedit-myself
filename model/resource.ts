export interface IResource {
  id: string,
  url:string,
  name?: string,
  size?: string,
  type?: number,
  typeChild?: number | null,
}
export interface IUpload {  
  resourceId:string,
  url:string,
}
export class Resource {  
  id!: string
  url!:string
  name?: string
  size?: string
  type?: number
  typeChild?: number | null
  constructor(list:IResource){
    this.id = list.id
    this.url = list.url
    this.name = list.name
    this.size = list.size
    this.type = list.type
    this.typeChild = list.typeChild
  }
}
export default Resource;

