import StraightPiece from './straightPiece'
import MovePoint from './movepoint';
import Coordinate from './coordinate'
export default class Chariot extends StraightPiece {
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string 
    ){
        super(ctx, id, coordinate, width, height, faction)
        this.text = '車';
    }

    initMovePoint() : MovePoint[]{
        let movePoints = []
        for(let i = 1; i <= 8; i++){
            let left = this.coordinate.clone(-i, 0);
            if(left !== null){
                movePoints.push(new MovePoint(this.ctx, left, this.width, this.height));
            }

            let rigth = this.coordinate.clone(i, 0);
            if(rigth !== null){
                movePoints.push(new MovePoint(this.ctx, rigth, this.width, this.height));
            }
        }

        for(let i = 1; i <= 9; i++){
            let top = this.coordinate.clone(0, -i);
            if(top !== null){
                movePoints.push(new MovePoint(this.ctx, top, this.width, this.height));
            }
    
            let bottom = this.coordinate.clone(0, i);
            if(bottom !== null){
                movePoints.push(new MovePoint(this.ctx, bottom, this.width, this.height));
            }
        }
 
        return movePoints;
    }
}