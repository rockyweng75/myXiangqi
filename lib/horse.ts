import HorsePiece from './horsePiece'
import MovePoint from './movepoint';
import Coordinate from './coordinate'
export default class Horse extends HorsePiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = this.faction === "black" ? '馬': '傌';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []
        // 左移
        let leftTop = this.coordinate.clone(-2, -1);
        if(leftTop !== null){
            movePoints.push(new MovePoint(this.ctx, leftTop, this.width, this.height));
        }

        let leftTop2 = this.coordinate.clone(-1, -2);
        if(leftTop2 !== null){
            movePoints.push(new MovePoint(this.ctx, leftTop2, this.width, this.height));
        }

        let leftBottom = this.coordinate.clone(-2, 1);
        if(leftBottom !== null){
            movePoints.push(new MovePoint(this.ctx, leftBottom, this.width, this.height));
        }

        let leftBottom2 = this.coordinate.clone(-1, 2);
        if(leftBottom2 !== null){
            movePoints.push(new MovePoint(this.ctx, leftBottom2, this.width, this.height));
        }

        let rigthTop = this.coordinate.clone(2, -1);
        if(rigthTop !== null){
            movePoints.push(new MovePoint(this.ctx, rigthTop, this.width, this.height));
        }

        let rigthTop2 = this.coordinate.clone(1, -2);
        if(rigthTop2 !== null){
            movePoints.push(new MovePoint(this.ctx, rigthTop2, this.width, this.height));
        }

        let rigthBottom = this.coordinate.clone(2, 1);
        if(rigthBottom !== null){
            movePoints.push(new MovePoint(this.ctx, rigthBottom, this.width, this.height));
        }

        let rigthBottom2 = this.coordinate.clone(1, 2);
        if(rigthBottom2 !== null){
            movePoints.push(new MovePoint(this.ctx, rigthBottom2, this.width, this.height));
        }

        return movePoints
    }
   
}