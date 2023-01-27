import IMove from './imove';
import IItem from './iItem';
import Piece from './piece';
import MovePoint from './movepoint';
export default abstract class HorsePiece extends Piece implements IMove{

    decidePoint(points: MovePoint[], allItems: IItem[]):  MovePoint[] {

        let obstacles= allItems.filter(o => points.some(m => m.coordinate.cid === o.coordinate!.cid));

        obstacles.forEach(obstacle =>{
            let point = points.find(o => o.cid === obstacle.coordinate?.cid);
            if(point){
                if(obstacle.faction !== this.faction){
                    point.isTarget = true;
                }
                point.isBlock = true;
            }
  
        })
        return points;
    }

}