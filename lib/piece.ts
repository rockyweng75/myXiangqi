import IItem from './iItem'
import Coordinate from './coordinate'
import MovePoint from './movepoint'
import IMove from './imove'
export default abstract class Piece implements IItem, IMove {
    triangleAngle : number = 5;
    triangleWidth : number = 0;
    ctx: CanvasRenderingContext2D;
    id: number | string;
    coordinate: Coordinate;
    x: number;
    y: number; 
    width: number; 
    height: number;
    text: string = '';
    strokeStyle: string = "#000000";
    backgroundColor = "#ffffff"
    faction: string = "black";
    isFocus: boolean = false;

    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        coordinate: Coordinate,
        width: number, 
        height: number,
        faction: string
    ){
        this.ctx = ctx;
        this.id = id;
        this.coordinate = coordinate;
        this.x = coordinate.x;
        this.y = coordinate.y;
        this.width = width;
        this.height = height;
        let r = this.height / Math.sin(this.triangleAngle);
        this.triangleWidth = r * Math.cos(this.triangleAngle) * -1;
        this.faction = faction;
    }


    isInside (mouseX: number, mouseY: number) : boolean {
        
        let h = this.x;
        let k = this.y;

        let r = this.width / 2;
        if(
            Math.pow(mouseX, 2) + Math.pow(mouseY, 2) - (2 * h * mouseX) - (2 * k * mouseY) + Math.pow(h, 2) + Math.pow(k, 2) - Math.pow(r, 2) <= 0
            && Math.pow(-2 * h, 2) + Math.pow( -2 * k, 2) - 4 * ( Math.pow(h, 2) + Math.pow(k, 2) - Math.pow(r, 2)) > 0
        ){
            return true;
        }
        return false
    }

    move(coordinate: Coordinate): void {
        this.x = coordinate.x;
        this.y = coordinate.y;
        this.coordinate = coordinate;
    }

    resize (newWidth: number, newHeight: number) : void {
        this.width = newWidth;
        this.height = newHeight;
    }

    print() : void{
        this.ctx.save();
        this.ctx.translate(this.x, this.y)
        this.ctx!.beginPath();
        this.ctx!.arc(0, 0, this.width /2, 0, 2 * Math.PI);
        this.ctx!.lineWidth = 5

        if(this.isFocus){
            this.ctx!.strokeStyle = "dodgerblue";
        } else {
            this.ctx!.strokeStyle = "black";
        }
        this.ctx?.stroke();

        this.ctx!.fillStyle = this.backgroundColor;

        this.ctx!.fill();
        if(this.text){
            this.ctx!.font = "normal normal 900 16px sans-serif"
            this.ctx!.textAlign = "center";
            this.ctx!.textBaseline = "middle"
            if(this.faction === 'black'){
                this.ctx!.fillStyle = "#000000"
            } else {
                this.ctx!.fillStyle = "red"
            }
            this.ctx!.fillText(this.text, 0, 2)
        }
        this.ctx!.restore();

    }

    isOverlapping(x: number, y: number, width: number, height: number) : boolean{
        if( this.x <= x 
            && x <= (this.x + this.width) 
            && this.y <= y 
            && y <= (this.y + this.height)
            && this.x <= x + width
            && x + width <= (this.x + this.width) 
            && this.y <= y + height
            && y + height <= (this.y + this.height) 
                ) {
            return true;
        }
        return false;
    }

    focus(bool: boolean): MovePoint[] {
        this.isFocus = bool;
        if(bool){
            return this.initMovePoint();
        } else {
            return []
        }
    }

    abstract initMovePoint() : MovePoint[]

    abstract decidePoint(points: MovePoint[], allItems: IItem[]): MovePoint[];

}