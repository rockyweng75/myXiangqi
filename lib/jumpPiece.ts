import MovePoint from './MovePoint'
import IMove from './imove';
import IItem from './iItem';
import Piece from './piece';
export default abstract class JumpPiece extends Piece implements IMove{

    decidePoint(points: MovePoint[], allItems: IItem[]):  MovePoint[] {
        let lo: IItem | undefined = undefined;
        let lot: IItem | undefined = undefined;
        let ro: IItem | undefined = undefined;
        let rot: IItem | undefined = undefined;
        let to: IItem | undefined = undefined;
        let tot: IItem | undefined = undefined;
        let bo: IItem | undefined = undefined;
        let bot: IItem | undefined = undefined;
        let obstacles= allItems.filter(o => points.some(m => m.coordinate.cid === o.coordinate!.cid));
        obstacles.forEach(obstacle =>{
            // 左右
            if(obstacle.coordinate!.cy === this.coordinate.cy){
                let leftRights = obstacles.filter(o => o.coordinate!.cy === this.coordinate.cy);
                // 右
                if(obstacle.coordinate!.cx > this.coordinate.cx){
                    let rights = leftRights.filter(o=> o.coordinate!.cx > this.coordinate.cx).sort(o => o.coordinate!.cx);
                    ro = rights[0];
                    if(rights.length >= 2)
                        rot= rights[1];
                } else {
                    let lefts = leftRights.filter(o=> o.coordinate!.cx < this.coordinate.cx).sort(o => o.coordinate!.cx * -1);
                    lo = lefts[0];
                    if(lefts.length >= 2)
                        lot = lefts[1];
                }
            }
            // 上下
            if(obstacle.coordinate!.cx === this.coordinate.cx){
                let topBottoms = obstacles.filter(o => o.coordinate!.cx === this.coordinate.cx);
                //下
                if(obstacle.coordinate!.cy > this.coordinate.cy){
                    let bottoms = topBottoms.filter(o=> o.coordinate!.cy > this.coordinate.cy).sort(o => o.coordinate!.cy * -1);
                    bo = bottoms[0];
                    if(bottoms.length >= 2)
                        bot = bottoms[1]
                } else {
                    let tops = topBottoms.filter(o=> o.coordinate!.cy < this.coordinate.cy).sort(o => o.coordinate!.cy * -1);
                    to = tops[0];
                    if(tops.length >= 2)
                        tot = tops[1]
                }
            }
        })

        points.forEach(point =>{
            let point1 = point.coordinate;
            // 左右
            if(point1.cy === this.coordinate.cy){
                // 右
                if(point1.cx > this.coordinate.cx){
                    if(ro){
                        if(point1.cx >= ro!.coordinate!.cx){
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }
                    if(rot){
                        if(point.coordinate!.cid === rot?.coordinate!.cid) {
                            point.isTarget = true;
                        }
                    }
                // 左
                } else {
                    if(lo){
                        if(point1.cx <= lo!.coordinate!.cx){
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }

                    if(lot){
                        if(point.coordinate!.cid === lot?.coordinate!.cid) {
                            point.isTarget = true;
                        }
                    }
                }
            }
            // 上下
            if(point1.cx === this.coordinate.cx){
                // 下
                if(point1.cy > this.coordinate.cy){
                    if(bo) {
                        if(point1.cy >= bo!.coordinate!.cy){
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }

                    if(bot){
                        if(point.coordinate!.cid === bot?.coordinate!.cid) {
                            point.isTarget = true;
                        }
                    }
                // 上
                } else {
                    if(to){
                        if(point1.cy <= to!.coordinate!.cy){
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }

                    if(tot){
                        if(point.coordinate!.cid === tot?.coordinate!.cid) {
                            point.isTarget = true;
                        }
                    }
                }
 
            }
        })
        return points;
    }

}