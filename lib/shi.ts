import DiagonallyPiece from './diagonallyPiece'
import MovePoint from './movepoint';
import Coordinate from './coordinate'
export default class Shi extends DiagonallyPiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = this.faction === "black" ? '士': '仕';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []

        if(this.coordinate.cx -1 >= 3){
            // 左移
            let leftBottom = this.coordinate.clone(-1, -1);
            if(leftBottom !== null){
                movePoints.push(new MovePoint(this.ctx, leftBottom, this.width, this.height));
            }

            let leftTop = this.coordinate.clone(-1, 1);
            if(leftTop !== null){
                movePoints.push(new MovePoint(this.ctx, leftTop, this.width, this.height));
            }
        } 

        if(this.coordinate.cx + 1 <= 5){
            let rigthBottom = this.coordinate.clone(1, -1);
            if(rigthBottom !== null){
                movePoints.push(new MovePoint(this.ctx, rigthBottom, this.width, this.height));
            }

            let rigthTop = this.coordinate.clone(1, 1);
            if(rigthTop !== null){
                movePoints.push(new MovePoint(this.ctx, rigthTop, this.width, this.height));
            }
        }

        return movePoints
    }
}