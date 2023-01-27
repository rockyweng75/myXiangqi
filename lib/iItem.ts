import MovePoint from "./movepoint";
import Coordinate from "./coordinate"
import IMove from "./imove"

export default interface IItem extends IMove {
    ctx : CanvasRenderingContext2D | null;
    x: number;
    y: number;
    coordinate: Coordinate | undefined;
    width : number;
    height : number;
    text: string;
    id: string | number;
    strokeStyle: string;
    isFocus: boolean;
    faction: string;

    isInside (mouseX: number, mouseY: number) : boolean

    move (coordinate: Coordinate) : void

    resize (newWidth: number, newHeight: number) : void

    print() : void

    isOverlapping(x: number, y: number, width: number, height: number) : boolean

    focus(bool: boolean): MovePoint [] 

}