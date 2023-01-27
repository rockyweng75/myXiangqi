import Coordinate from "./coordinate"
export default class Button {
    ctx : CanvasRenderingContext2D | null;
    x: number;
    y: number;
    coordinate: Coordinate | undefined;
    width : number;
    height : number;
    text: string;
    id: string | number;
    strokeStyle: string = "";
    isFocus: boolean = false;
    color: string;
    click: Function;
    faction: string = "";

    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        x: number,
        y: number,
        width: number, 
        height: number,
        text: string,
        color: string,
        click: Function
    ){
        this.ctx = ctx;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.click = click;
    }
    

    isInside (mouseX: number, mouseY: number) : boolean{
        if( this.x <= mouseX && mouseX <= (this.x + this.width) 
            && this.y <= mouseY && mouseY <= (this.y + this.height)
        ) {
            return true;
        }
        else return false;
    }

    move(coordinate: Coordinate): void {
        this.x = coordinate.x;
        this.y = coordinate.y;
        this.coordinate = coordinate;
    }

    resize (newWidth: number, newHeight: number) : void{
        this.width = newWidth;
        this.height = newHeight;
    }

    print() : void{
        this.ctx!.save();
        this.ctx!.translate(this.x, this.y);
        this.ctx!.beginPath();
        this.ctx!.strokeStyle = "black"
        this.ctx!.fillStyle = this.color;
        this.ctx!.rect(0, 0, this.width, this.height);
        this.ctx!.fill();
        this.ctx!.stroke();
        this.ctx!.fillStyle = "white";
        this.ctx!.font = "normal normal 900 16px sans-serif"
        this.ctx!.textBaseline = "middle"
        this.ctx!.fillText(this.text, this.width/ 3 - 2, this.height/ 2,);
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

}