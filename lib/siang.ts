import DiagonallyPiece from './diagonallyPiece'
import MovePoint from './movepoint';
import Coordinate from './coordinate'
export default class Siang extends DiagonallyPiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = this.faction === "black" ? '象': '相';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []
        // 左移
        let leftTop = this.coordinate.clone(-2, -2);
        if(leftTop !== null){
            movePoints.push(new MovePoint(this.ctx, leftTop, this.width, this.height));
        }

        let leftBottom = this.coordinate.clone(-2, 2);
        if(leftBottom !== null){
            movePoints.push(new MovePoint(this.ctx, leftBottom, this.width, this.height));
        }

        let rigthTop = this.coordinate.clone(2, -2);
        if(rigthTop !== null){
            movePoints.push(new MovePoint(this.ctx, rigthTop, this.width, this.height));
        }

        let rigthBottom = this.coordinate.clone(2, 2);
        if(rigthBottom !== null){
            movePoints.push(new MovePoint(this.ctx, rigthBottom, this.width, this.height));
        }
        return movePoints;
    }

    block(point1: Coordinate, obstacles: Coordinate[]): boolean {
        let result = false;
        obstacles.forEach(obstacle => {
            // 垂直
            if(this.coordinate.cx === obstacle.cx && this.coordinate.cx === point1.cx){
                //往下
                if(this.coordinate.cy > obstacle.cy){
                    if(point1.cy <= obstacle.cy){
                        result = true;
                        return;
                    }
                } else {
                    if(point1.cy >= obstacle.cy){
                        result = true;
                        return;
                    }
                }
            } else if(this.coordinate.cy === obstacle.cy && this.coordinate.cy === point1.cy) {
                //左
                if(this.coordinate.cx > obstacle.cx){
                    if(point1.cx <= obstacle.cx){
                        result = true;
                        return;
                    }
                } else {
                    if(point1.cx >= obstacle.cx){
                        result = true;
                        return;

                    }
                }
            }
        })

        return result;
    }

}