import type WebSocket from 'ws';
import { Assets, CurrentRoom } from 'lib/types/sonar-types';

interface State {
  ws: Maybe<WebSocket>;
  wsStatus: number;

  initialRoomId?: number;
  userId: number;
  
  moveId: number;

  room?: CurrentRoom;

  friends: Set<number>;
  friendRequests: Set<number>;
  rooms: Set<number>;

  cache: {
    assets: Assets;
    users: Map<number, any>;
    rooms: Map<number, any>;
  };
}

let globalState = {
  ws: null,
  wsStatus: 0,

  friends: new Set(),
  friendRequests: new Set(),
  rooms: new Set(),

  cache: {
    assets: {},
    users: new Map(),
    rooms: new Map(),
  },
} as State;

let getState = () => globalState as Readonly<State>;

let updateState = (callback: (state: State) => void) => {
  callback(globalState);
  return globalState as Readonly<State>;
};

export {
  getState,
  updateState,
};
