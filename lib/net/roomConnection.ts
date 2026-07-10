import Peer, { DataConnection } from 'peerjs';
import { Faction } from '../../engine';
import { NetMessage } from './protocol';

const ROOM_PREFIX = 'myxiangqi-';

export type ConnectionState = 'connecting' | 'open' | 'closed' | 'error';

/** Thin wrapper around a PeerJS room: host creates it (and plays red), a
 * second browser joins it by room code (and plays black). Signaling goes
 * through PeerJS's public cloud broker; game moves flow peer-to-peer after
 * that over the DataConnection. */
export default class RoomConnection {
  peer: Peer;
  connection: DataConnection | null = null;
  localFaction: Faction;
  roomCode: string;
  onMessage: ((message: NetMessage) => void) | null = null;
  onStateChange: ((state: ConnectionState) => void) | null = null;

  private constructor(peer: Peer, localFaction: Faction, roomCode: string) {
    this.peer = peer;
    this.localFaction = localFaction;
    this.roomCode = roomCode;
  }

  static host(roomCode: string): Promise<RoomConnection> {
    return new Promise((resolve, reject) => {
      const peer = new Peer(ROOM_PREFIX + roomCode);
      const room = new RoomConnection(peer, 'red', roomCode);

      peer.on('open', () => {
        peer.on('connection', (conn) => {
          room.attach(conn);
          resolve(room);
        });
      });
      peer.on('error', (err) => {
        room.onStateChange?.('error');
        reject(err);
      });
    });
  }

  static join(roomCode: string): Promise<RoomConnection> {
    return new Promise((resolve, reject) => {
      const peer = new Peer();
      const room = new RoomConnection(peer, 'black', roomCode);

      peer.on('open', () => {
        const conn = peer.connect(ROOM_PREFIX + roomCode);
        conn.on('open', () => {
          room.attach(conn);
          resolve(room);
        });
        conn.on('error', (err) => reject(err));
      });
      peer.on('error', (err) => {
        room.onStateChange?.('error');
        reject(err);
      });
    });
  }

  private attach(conn: DataConnection): void {
    this.connection = conn;
    conn.on('data', (data) => this.onMessage?.(data as NetMessage));
    conn.on('close', () => this.onStateChange?.('closed'));
    conn.on('error', () => this.onStateChange?.('error'));
    this.onStateChange?.('open');
    this.send({ type: 'hello', faction: this.localFaction });
  }

  send(message: NetMessage): void {
    this.connection?.send(message);
  }

  /** Attempts to re-establish the DataConnection to the same room, reusing
   * this browser's existing Peer id. */
  reconnect(): void {
    if (this.localFaction === 'red') return; // host just waits for a new inbound connection
    const conn = this.peer.connect(ROOM_PREFIX + this.roomCode);
    conn.on('open', () => this.attach(conn));
  }

  dispose(): void {
    this.connection?.close();
    this.peer.destroy();
  }
}
