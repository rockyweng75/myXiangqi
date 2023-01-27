import MovePoint from './movepoint'
import IMove from './imove';
import IItem from './iItem';
import Piece from './piece';
export default abstract class StraightPiece extends Piece implements IMove{

    decidePoint(points: MovePoint[], allItems: IItem[]):  MovePoint[] {
        let lo: IItem | undefined = undefined;
        let ro: IItem | undefined = undefined;
        let to: IItem | undefined = undefined;
        let bo: IItem | undefined = undefined;
        let obstacles= allItems.filter(o => points.some(m => m.coordinate.cid === o.coordinate!.cid));
        obstacles.forEach(obstacle =>{
            // 左右
            if(obstacle.coordinate!.cy === this.coordinate.cy){
                let leftRights = obstacles.filter(o => o.coordinate!.cy === this.coordinate.cy);
                // 右
                if(obstacle.coordinate!.cx > this.coordinate.cx){
                    let rights = leftRights.filter(o=> o.coordinate!.cx > this.coordinate.cx).sort(o => o.coordinate!.cx);
                    ro = rights.sort(this.orderCxAsc)[0];
                } else {
                    let lefts = leftRights.filter(o=> o.coordinate!.cx < this.coordinate.cx).sort(o => o.coordinate!.cx * -1);
                    lo = lefts.sort(this.orderCxDesc)[0];
                }
            }
            // 上下
            if(obstacle.coordinate!.cx === this.coordinate.cx){
                let topBottoms = obstacles.filter(o => o.coordinate!.cx === this.coordinate.cx);
                //下
                if(obstacle.coordinate!.cy > this.coordinate.cy){
                    let bottoms = topBottoms.filter(o=> o.coordinate!.cy > this.coordinate.cy).sort(o => o.coordinate!.cy * -1);
                    bo = bottoms.sort(this.orderCyAsc)[0];
                } else {
                    let tops = topBottoms.filter(o=> o.coordinate!.cy < this.coordinate.cy).sort(o => o.coordinate!.cy * -1);
                    to = tops.sort(this.orderCyDesc)[0];
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
                        if(point1.cx > ro!.coordinate!.cx){
                            point.isBlock = true;
                        } else if(point1.cx === ro!.coordinate!.cx){
                            if(this.faction !== ro.faction){
                                point.isTarget = true;
                            }                        
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }
                // 左
                } else {
                    if(lo){
                        if(point1.cx < lo!.coordinate!.cx){
                            point.isBlock = true;
                        } else if(point1.cx === lo!.coordinate!.cx){
                            if(this.faction !== lo.faction){
                                point.isTarget = true;
                            }
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }
                }
            }
            // 上下
            if(point1.cx === this.coordinate.cx){
                // 下
                if(point1.cy > this.coordinate.cy){
                    if(bo) {
                        if(point1.cy > bo!.coordinate!.cy){
                            point.isBlock = true;
                        } else if(point1.cy === bo!.coordinate!.cy){
                            if(this.faction !== bo.faction){
                                point.isTarget = true;
                            }
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }
                // 上
                } else {
                    if(to){
                        if(point1.cy < to!.coordinate!.cy){
                            point.isBlock = true;
                        } else if(point1.cy === to!.coordinate!.cy){
                            if(this.faction !== to.faction){
                                point.isTarget = true;
                            }                        
                            point.isBlock = true;
                        } else {
                            point.isBlock = false;
                        }
                    }
                }
 
            }
        })
        return points;
    }

}