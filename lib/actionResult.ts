export default class ActionResult{
    id: number | string;
    newCid: string;
    oldCid: string;
    removeItem: string | undefined;
    message: string | undefined;

    constructor(    
        id: number | string,
        newCid: string,
        oldCid: string,
        removeItem: string | undefined,
        message: string | undefined,
    ){
        this.id = id;
        this.newCid = newCid;
        this.oldCid = oldCid;
        this.removeItem = removeItem;
        this.message = message;
    }
}