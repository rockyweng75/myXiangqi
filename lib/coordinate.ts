import Action from "./action";

export default class Coordinate {

    columnWidth: number;
    columnHeight: number;
    x: number;
    y: number;
    cid: string;
    cx: number;
    cy: number;

    constructor(cid: string, columnWidth: number, columnHeight: number){
        this.cid = cid;
        this.columnWidth = columnWidth;
        this.columnHeight = columnHeight;
        this.cx = this.getCX(this.cid);
        this.cy = this.getCY(this.cid);
        this.x = this.getX(this.cid)
        this.y = this.getY(this.cid)
    }

    getCX(cid: string): number{
        let index = Action.Xids.indexOf(cid.substring(0, 1));
        if(index < 0){
            throw 'id is error';
        } else {
            return index;
        }
    }

    getCY(cid: string): number{
        let index = parseInt(cid.substring(1, 2));
        if(Number.isNaN(index)){
            throw 'id is error';
        } else {
            return index ;
        }
    }

    getX(cid: string): number{
        return this.columnWidth * this.getCX(cid) + Action.originX;
    }

    getY(cid: string): number{
        return this.columnHeight * this.getCY(cid) + Action.originY;
    }

    moveX(unit: number): void{
        if(this.cx + unit >= 0 && this.cx + unit <= 8){
            this.cx = this.cx + unit;
            this.cid = Action.Xids[this.cx] + this.cy;
            this.x = this.getX(this.cid);
        }
    }

    moveY(unit: number): void{
        if(this.cy + unit >= 0 && this.cy + unit <= 9){
            this.cy = this.cy + unit;
            this.cid = Action.Xids[this.cx] + this.cy;
            this.y = this.getY(this.cid);
        }
    }

    clone(xunit: number, yunit: number) : Coordinate | null{
        if(this.cx + xunit >= 0 && this.cx + xunit <= 8
            && this.cy + yunit >= 0 && this.cy + yunit <= 9){

            let result = new Coordinate(this.cid, this.columnWidth, this.columnHeight);
            result.moveX(xunit);
            result.moveY(yunit);
            return result;
        } else {
            return null;
        }
    }

}