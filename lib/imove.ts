import Coordinate from "./coordinate";
import MovePoint from "./movepoint";
import IItem from "./iItem";
export default interface IMove {

    faction: string | undefined;
    coordinate: Coordinate | undefined;

    decidePoint(points: MovePoint[], allItems: IItem[]): MovePoint[];
}
