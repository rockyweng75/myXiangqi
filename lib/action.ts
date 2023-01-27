import IItem from "./iItem";
import King from "./king";
import Shi from "./shi";
import Siang from "./siang";
import Horse from "./horse";
import Chariot from './chariot'
import Artillery from './artillery'
import Soldier from './soldier'
import Coordinate from "./coordinate";
import Confirm from "./confirm";
import MovePoint from "./movepoint";
import ActionResult from "./actionResult";

const Xids: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
export default class Action {
    canvas : HTMLCanvasElement;
    ctx : CanvasRenderingContext2D | null = null;
    width : number;
    height : number;
    static itemWidth : number = 30;
    static itemHeight: number = 30;
    static originX : number = 20
    static originY : number = 20;
    startX : number = 0;
    startY : number = 0;
    offsetX : number = 0;
    offsetY : number = 0;
    scrollX: number = 0;
    scrollY: number = 0;
    columnX: number = 8;
    columnY: number = 9;
    columnWidth: number = 0;
    columnHeight: number = 0;
    currnetFaction: string = "black";
    isDown = false;
    isDrop = false;
    isMove = false;
    isOver = false;
    items : IItem[] = [];
    selectedItem: IItem | null = null;
    movePoints: MovePoint[] = [];
    $confirm: Confirm | null = null;
    static Xids: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
    oncommit: Function | undefined;
    removeItem : IItem | undefined = undefined;
    
    constructor(canvas : HTMLCanvasElement){
        this.width = canvas.width - Action.originX * 2;
        this.height = canvas.height - Action.originY * 2;
        this.canvas = canvas;
        this.columnWidth = Math.floor(this.width / 8);
        this.columnHeight = Math.floor(this.height / 9);

        if (this.canvas.getContext) {
            this.ctx = this.canvas.getContext('2d');
            this.offsetX = this.canvas.offsetLeft;
            this.offsetY = this.canvas.offsetTop;
            this.scrollX = window.scrollX;
            this.scrollY = window.scrollY;

            this.canvas.onresize = e => this.handleResize(e);
            this.canvas.onscroll = e => this.handleResize(e);
            this.canvas.onmousedown = async e => await this.handleMouseDown(e);
            this.canvas.onmousemove = async e => await this.handleMouseMove(e);
            this.canvas.onmouseup = e => this.handleMouseUp(e);
            this.canvas.onmouseout = e => this.handleMouseOut(e);
        } else {
            alert('error')
        }
    }

    handleResize(e: Event){
        e.preventDefault();
        e.stopPropagation();
        this.offsetX = this.canvas.offsetLeft;
        this.offsetY = this.canvas.offsetTop;
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
    }

    handleScroll(e: Event){
        e.preventDefault();
        e.stopPropagation();
        this.scrollX = window.scrollX;
        this.scrollY = window.scrollY;
    }

    async handleMouseDown(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if(this.isOver) return;

        this.startX = e.clientX - this.offsetX + this.scrollX;
        this.startY = e.clientY - this.offsetY + this.scrollY;

        let isReload = false || this.selectedItem != null;

        if(this.$confirm){
            isReload = this.$confirm.onclick(this.startX, this.startY)
        } else {
            // this.isMove = false;

            this.items.forEach(item =>{
                if(item.isInside(this.startX, this.startY) && item.faction === this.currnetFaction){
                    if(this.selectedItem !== null && this.selectedItem!.id === item.id){
                        this.movePoints = item.focus(false);
                        this.selectedItem = null;
                    } else {
                        this.movePoints = item.focus(true);
                        // let obstacles= this.items.filter(o => this.movePoints.some(m => m.coordinate.cid === o.coordinate!.cid));
                        this.movePoints = item.decidePoint(this.movePoints, this.items);
                        this.selectedItem = item;
                    }
                    isReload = true;
                } else {
                    item.focus(false);
                }
            });

            if(this.movePoints)
                this.movePoints.forEach(item =>{
                    if(item.isInside(this.startX, this.startY)){
                        this.isMove = true;
                        let newCid = item.coordinate.clone(0, 0)!;
                        this.movePoints = []
                        this.movePoints.push(new MovePoint(
                            this.ctx!,
                            this.selectedItem!.coordinate!,
                            this.selectedItem!.width,
                            this.selectedItem!.height)
                        )
                        if(item.isTarget){
                            for(let i = 0; i < this.items.length; i++){
                                if(this.items[i].coordinate?.cid === item.cid){
                                    this.removeItem = this.items.splice(i, 1)[0];
                                }
                            }                        
                        }   
                        this.selectedItem!.move(newCid);

                        let id = Date.now().toFixed();
                        this.$confirm = new Confirm(this.ctx!, id, this.width/3, this.height/2, 200, 60, 
                            this.commit(), 
                            this.rollback());
                    } 
                })

            
            if(this.isMove){

            } else {
                if(this.items.filter(o => o.isFocus).length == 0) {
                    this.selectedItem = null;
                    this.movePoints = [];
                }
            }

        }

        this.isDown = true;

        if(isReload){
            await this.clear();
            await this.print();       
        }   
    }
    
    handleMouseUp(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag
        this.isDown = false;
    }
    
    handleMouseOut(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
    
        // the drag is over, clear the dragging flag
        this.isDown = false;
    }
    
    async handleMouseMove (e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        // // if we're not dragging, just return
        // if (!this.isDown) {
        //     return;
        // }
    
        // get the current mouse position
        // let mouseX = e.clientX - this.offsetX + this.scrollX;
        // let mouseY = e.clientY - this.offsetY + this.scrollY;
        // let isReload = false 
        // if(this.items){
        //     this.items.forEach(async (item) =>{
        //         // 拖曳
        //         if( this.isDown && this.isDrop ){
        //             isReload = true;
        //         } else if(this.isDown && item.isInside(this.startX, this.startY)){
        //             this.selectedItem = item 
        //             this.isDrop = true;
        //         } else {
        //             this.isDrop = false;
        //         }              
        //     })
        // }

        // if(isReload){
        //     if(!this.isOverSide(mouseX, mouseY, this.selectedItem!.width, this.selectedItem!.height))
        //     {
        //         this.selectedItem!.dropMove(mouseX, mouseY);
        //         await this.clear();
        //         await this.print();       
        //     }
        // }
    }

    printBorder(){

        this.ctx!.save();
        this.ctx!.translate(Action.originX, Action.originY);
        this.ctx!.beginPath();
        for(let i = 0; i <= 8; i ++)
        {
            this.ctx!.moveTo(i * this.columnWidth, 0);
            this.ctx!.lineTo(i * this.columnWidth, this.columnHeight * 9);
            this.ctx!.fillText(Xids[i], i * this.columnWidth, -5)

        }
        for(let y = 0; y <= 9; y ++)
        {
            this.ctx!.moveTo(0, (y * this.columnHeight));
            this.ctx!.lineTo(this.columnWidth * 8, (y * this.columnHeight));
            this.ctx!.fillText(y.toString(), -10, (y * this.columnHeight))
        }

        this.ctx!.moveTo(3 * this.columnWidth, 0);
        this.ctx!.lineTo(5 * this.columnWidth, (2 * this.columnHeight));
        this.ctx!.moveTo(5 * this.columnWidth, 0);
        this.ctx!.lineTo(3 * this.columnWidth, (2 * this.columnHeight));

        this.ctx!.moveTo(3 * this.columnWidth, (7 * this.columnHeight));
        this.ctx!.lineTo(5 * this.columnWidth, (9 * this.columnHeight));
        this.ctx!.moveTo(5 * this.columnWidth, (7 * this.columnHeight));
        this.ctx!.lineTo(3 * this.columnWidth, (9 * this.columnHeight));

        this.ctx!.strokeStyle = "#99999"
        this.ctx!.stroke();
        this.ctx!.clearRect(
                1,  
                (4 * this.columnHeight) + 1 , 
                this.columnWidth * 8 - 2, 
                this.columnHeight - 2);
        this.ctx!.restore();
        this.ctx!.save();
        this.ctx!.font = "normal normal 900 30px sans-serif"
        this.ctx!.textBaseline = "middle"
        this.ctx!.translate(this.columnWidth * 2 + this.columnWidth /2, (4 * this.columnHeight) + Action.originY + this.columnHeight/2)      
        this.ctx!.fillText("楚河", 0, 0)
        this.ctx!.restore();

        this.ctx!.save();
        this.ctx!.font = "normal normal 900 30px sans-serif"
        this.ctx!.textBaseline = "middle"
        this.ctx!.translate(this.columnWidth * 6 + this.columnWidth /2, (4 * this.columnHeight) + Action.originY + this.columnHeight/2)      
        this.ctx!.rotate(180 * Math.PI/180)
        this.ctx!.fillText("漢界",0, 0)
        this.ctx!.restore();

    }

    print() : Promise<void> {
        return new Promise<void>((resolve)=>{

            this.printBorder()

            if(this.items) 
                this.items
                    .forEach(item=> {
                        // this.ctx!.strokeStyle = item.strokeStyle;
                        item.print()
                    });

            if(this.movePoints) {
                this.movePoints.forEach(item=> {
                    if(!item.isBlock){
                        item.print();
                    } else if(item.isTarget){
                        item.isTarget = true;
                        item.print2();
                    }
                })
            }

            if(this.isMove && this.$confirm){
                this.$confirm!.print();
            }

            resolve();
        });
    }


    clear() : Promise<void>{
        return new Promise<void>((resolve)=>{
            this.ctx!.clearRect(0, 0, this.canvas.width, this.canvas.height);
            resolve();
        });
    }

    isOverSide(mouseX: number, mouseY: number, objWidth: number, objHeight: number): boolean{
        if(mouseX < 0 || mouseY < 0){
            return true;
        } else if(mouseX + objWidth > this.width){
            return true;
        }
        else if(mouseY + objHeight > this.height){
            return true;
        } else {
            return false;
        }
    }

    init(): Promise<void>{
        return new Promise((resolve)=>{

            this.items = [];
            this.isOver = false;
            let width = Action.itemWidth;
            let height = Action.itemHeight;

            let factions = ['black', 'red'];
            factions.forEach(faction =>{
                let yid = '0';
                let id = Date.now().toFixed();
                if(faction !== 'black'){
                    yid = '9';
                }

                this.items.push(
                    new King(this.ctx!, 
                    id, 
                    new Coordinate('E' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Shi(this.ctx!, 
                    id, 
                    new Coordinate('D' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Shi(this.ctx!, 
                    id, 
                    new Coordinate('F' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Siang(this.ctx!, 
                    id, 
                    new Coordinate('G' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Siang(this.ctx!, 
                    id, 
                    new Coordinate('C' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Horse(this.ctx!, 
                    id, 
                    new Coordinate('B' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Horse(this.ctx!, 
                    id, 
                    new Coordinate('H' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Chariot(this.ctx!, 
                    id, 
                    new Coordinate('A' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Chariot(this.ctx!, 
                    id, 
                    new Coordinate('I' + yid, this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )
                
                this.items.push(
                    new Artillery(this.ctx!, 
                    id, 
                    new Coordinate('B' + (faction == 'black'? '2' : '7'), this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                this.items.push(
                    new Artillery(this.ctx!, 
                    id, 
                    new Coordinate('H' + (faction == 'black'? '2' : '7'), this.columnWidth, this.columnHeight), 
                    width, 
                    height, 
                    faction)
                )

                for(let i = 0; i < 10; i = i + 2)
                {
                    this.items.push(
                        new Soldier(this.ctx!, 
                        id, 
                        new Coordinate(Xids[i] + (faction == 'black'? '3' : '6'), this.columnWidth, this.columnHeight), 
                        width, 
                        height, 
                        faction)
                    )
                }
            })

            resolve();
        })
    }

    commit(): Function{
        return () =>{
            let oldCid = this.movePoints[0].cid;
            let newCid = this.selectedItem?.coordinate?.cid;
            this.movePoints = this.selectedItem!.focus(false);
            this.$confirm = null;
            this.isMove = false;
            this.isDown = false;
            this.currnetFaction = this.currnetFaction === "black" ? "red" : "black";

            if(this.oncommit){
                if(this.removeItem){
                    if(King.prototype.isPrototypeOf(this.removeItem!)){
                        this.isOver = true;
                        this.oncommit(new ActionResult(
                            this.selectedItem!.id, 
                            newCid!, 
                            oldCid!,
                            this.removeItem.constructor.name,
                            `${this.removeItem.faction === 'black' ? 'red' : 'black' }方是贏家`));
                    } else {
                        this.oncommit(new ActionResult(
                            this.selectedItem!.id, 
                            newCid!, 
                            oldCid!,
                            this.removeItem.constructor.name,
                            `${this.removeItem.text}被吃掉了`
                        ));
                    }
                } else{
                    this.oncommit(new ActionResult(
                        this.selectedItem!.id,
                        newCid!, 
                        oldCid!,
                        undefined,
                        undefined));
                }
            }

            this.removeItem = undefined;

        }
    }

    rollback(): Function{
        return ()=>{
            this.selectedItem!.move(this.movePoints[0].coordinate);
            this.movePoints = this.selectedItem!.focus(true);
            this.$confirm = null;
            this.isMove = false;
            if(this.removeItem){
                this.items.push(this.removeItem!);
                this.removeItem = undefined;
            }

        }

    }
} 



