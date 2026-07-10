export default class ActionResult {
    id: string;
    newCid: string;
    oldCid: string;
    removeItem: string | undefined;
    message: string | undefined;
    isCheck: boolean;
    isCheckmate: boolean;

    constructor(
        id: string,
        newCid: string,
        oldCid: string,
        removeItem: string | undefined,
        message: string | undefined,
        isCheck: boolean = false,
        isCheckmate: boolean = false,
    ){
        this.id = id;
        this.newCid = newCid;
        this.oldCid = oldCid;
        this.removeItem = removeItem;
        this.message = message;
        this.isCheck = isCheck;
        this.isCheckmate = isCheckmate;
    }
}
