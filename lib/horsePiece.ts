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

        let left = allItems.find(o => o.coordinate?.cx == this.coordinate.cx - 1);
        let rigth = allItems.find(o => o.coordinate?.cx == this.coordinate.cx + 1);
        let top = allItems.find(o => o.coordinate?.cy == this.coordinate.cy - 1);
        let bottom = allItems.find(o => o.coordinate?.cy == this.coordinate.cy + 1);

        if(left){
            let leftpoints = points.filter(o =>
                 o.coordinate.cx < this.coordinate.cx
                && ( o.coordinate.cy == this.coordinate.cy + 1 
                    || o.coordinate.cy == this.coordinate.cy - 1));
            if(leftpoints)
                leftpoints.forEach(o => o.isBlock = true)
        }

        if(rigth){
            let rigthpoints = points.filter(o => 
                o.coordinate.cx > this.coordinate.cx
                && (o.coordinate.cy == this.coordinate.cy + 1 
                    || o.coordinate.cy == this.coordinate.cy - 1));

            if(rigthpoints)
                rigthpoints.forEach(o => o.isBlock = true)
        }

        if(top){
            let toppoints = points.filter(o => 
                o.coordinate.cy < this.coordinate.cy
                && (o.coordinate.cx == this.coordinate.cx + 1 
                    || o.coordinate.cx == this.coordinate.cx - 1));
            if(toppoints)
                toppoints.forEach(o => o.isBlock = true)
        }

        if(bottom){
            let bottompoints = points.filter(o => 
                o.coordinate.cy > this.coordinate.cy
                && (o.coordinate.cx == this.coordinate.cx + 1 
                    || o.coordinate.cx == this.coordinate.cx - 1));

            if(bottompoints)
                bottompoints.forEach(o => o.isBlock = true)
        }


        return points;
    }

}