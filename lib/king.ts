import StraightPiece from './straightPiece'
import Coordinate from './coordinate'
import MovePoint from './movepoint';
import IItem from './iItem';
export default class King extends StraightPiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = this.faction === "black" ? '將': '帥';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []
        // 左移
        let left = this.coordinate.clone(-1, 0);
        if(left !== null && left.cx >= 3 && left.cx <= 5 ){
            movePoints.push(new MovePoint(this.ctx, left, this.width, this.height));
        }

        let top = this.coordinate.clone(0, -1);
        if(top !== null 
            && ((this.faction === "black" && top.cy >= 0 && top.cy <= 2)
            || (this.faction !== "black" && top.cy >= 7 && top.cy <= 9))){
            
            movePoints.push(new MovePoint(this.ctx, top, this.width, this.height));
        }

        let bottom = this.coordinate.clone(0, 1);

        if(bottom !== null
            && ((this.faction === "black" && bottom.cy >= 0 && bottom.cy <= 2)
            || (this.faction !== "black" && bottom.cy >= 7 && bottom.cy <= 9))){
            movePoints.push(new MovePoint(this.ctx, bottom, this.width, this.height));
        }

        let rigth = this.coordinate.clone(1, 0);
        if(rigth !== null
            && rigth.cx >= 3 && rigth.cx <= 5 ){
            movePoints.push(new MovePoint(this.ctx, rigth, this.width, this.height));
        }

        return movePoints;
    }

    decidePoint(points: MovePoint[], allItems: IItem[]): MovePoint[]{
        super.decidePoint(points, allItems);

        let items = allItems.filter(o => o.coordinate!.cx === this.coordinate.cx);
        if(items.length == 2 && items.every(o => King.prototype.isPrototypeOf(o))){
            let target = items.find(o => o.coordinate!.cid !== this.coordinate.cid);
            let targetCid = target?.coordinate?.clone(0, 0);
            let targetPoint = new MovePoint(this.ctx, targetCid!, target!.width, target!.height);
            targetPoint.isBlock = true;
            targetPoint.isTarget = true;
            points.push(targetPoint)
        }

        return points
    }
}