import { Faction, Move, SerializedState } from '../../engine';

export interface HelloMessage {
  type: 'hello';
  faction: Faction;
}

export interface MoveMessage {
  type: 'move';
  move: Move;
}

export interface ResyncRequestMessage {
  type: 'resync-request';
}

export interface ResyncStateMessage {
  type: 'resync-state';
  state: SerializedState;
}

export interface ResignMessage {
  type: 'resign';
}

export type NetMessage = HelloMessage | MoveMessage | ResyncRequestMessage | ResyncStateMessage | ResignMessage;
