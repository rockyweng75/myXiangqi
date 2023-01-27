import Button from "./button"
export default class confirm {
    ctx : CanvasRenderingContext2D | null;
    x: number;
    y: number;
    width : number;
    height : number;
    id: string | number;
    strokeStyle: string = "black";
    isFocus: boolean = false;
    click: Function | undefined;
    buttons: Button[] = [];
    constructor(
        ctx: CanvasRenderingContext2D, 
        id: number | string, 
        x: number,
        y: number,
        width: number, 
        height: number,
        commit: Function,
        rollback: Function
    ){
        this.ctx = ctx;
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.buttons = [
            new Button(this.ctx, 
                this.id + 's',
                this.x + 10, 
                this.y + 10,
                80,
                40,
                "確定",
                "dodgerblue",
                commit
            ),
            new Button(this.ctx, 
                this.id + 'e',
                this.x + this.width - 90 , 
                this.y + 10,
                80,
                40,
                "取消",
                "red",
                rollback
            )
        ]
    }
    
    print() : void{
        this.ctx!.save();
        this.ctx!.translate(this.x, this.y);
        this.ctx!.beginPath();
        this.ctx!.fillStyle = "white";
        this.ctx!.rect(0, 0, this.width, this.height);
        this.ctx!.fill();
        this.ctx!.restore();

        this.buttons.forEach(item=> item.print())
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

    onclick(mouseX: number, mouseY: number) : boolean {
        let result = false;
        this.buttons.forEach(item=>{
            if(item.isInside(mouseX, mouseY)){
                item.click();
                result = true;
            }
        })
        return result;
    }
}