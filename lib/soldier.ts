import StraightPiece from './straightPiece'
import MovePoint from './movepoint';
import Coordinate from './coordinate'
export default class Soldier extends StraightPiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = this.faction === "black" ? '卒': '兵';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []
        if(this.faction === "black")
        {
            if(this.coordinate.cy >= 5){
                // 左移
                let left = this.coordinate.clone(-1, 0);
                if(left !== null){
                    movePoints.push(new MovePoint(this.ctx, left, this.width, this.height));
                }

                if(this.coordinate.cy -1 > 5){
                    let top = this.coordinate.clone(0, -1);
                    if(top !== null){
                        movePoints.push(new MovePoint(this.ctx, top, this.width, this.height));
                    }
                }

                let rigth = this.coordinate.clone(1, 0);
                if(rigth !== null){
                    movePoints.push(new MovePoint(this.ctx, rigth, this.width, this.height));
                }
            }

            let bottom = this.coordinate.clone(0, 1);
            if(bottom !== null){
                movePoints.push(new MovePoint(this.ctx, bottom, this.width, this.height));
            }
        } else {
            if(this.coordinate.cy <= 4){
                // 左移
                let left = this.coordinate.clone(-1, 0);
                if(left !== null){
                    movePoints.push(new MovePoint(this.ctx, left, this.width, this.height));
                }

                if(this.coordinate.cy +1 < 4){
                    let bottom = this.coordinate.clone(0, 1);
                    if(bottom !== null){
                        movePoints.push(new MovePoint(this.ctx, bottom, this.width, this.height));
                    }
                }
        
                let rigth = this.coordinate.clone(1, 0);
                if(rigth !== null){
                    movePoints.push(new MovePoint(this.ctx, rigth, this.width, this.height));
                }
            }

            let top = this.coordinate.clone(0, -1);
            if(top !== null){
                movePoints.push(new MovePoint(this.ctx, top, this.width, this.height));
            }
        }
   
        return movePoints;
    }
}