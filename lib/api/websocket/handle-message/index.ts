import { getState, updateState } from 'lib/state';
import { NoUserIdError } from 'lib/errors';
import { events } from 'lib/api';

enum ReceivedMessageType {
  SpaceJoined = 'space_joined',
  SpaceChanged = 'space_changed',
  AudioChannelSubscriptionsUpdated = 'audio_channel_subscriptions_updated',
  DisplayToast = 'display_toast',
  GameObjects = 'game_objects',
  EntitiesChanged = 'entities_changed',
  EntitiesDespawned = 'entities_despawned',
  EntitiesSpawned = 'entities_spawned',
  DroppablesLifted = 'droppables_lifted',
  DroppablesDropped = 'droppables_dropped',
  DroppablesPlaced = 'droppables_placed',
  BroadcastSpeaking = 'broadcast_speaking',
  Horn = 'horn',
}

export type ReceivedMessage =
| { type: ReceivedMessageType.SpaceJoined, data: SpaceJoinedData }
| { type: ReceivedMessageType.SpaceChanged, data: any }
| { type: ReceivedMessageType.DisplayToast, data: DisplayToastData }
| { type: ReceivedMessageType.BroadcastSpeaking, data: BroadcastSpeakingData }
| { type: ReceivedMessageType.EntitiesChanged, data: UserChangedData }
| { type: ReceivedMessageType.EntitiesChanged, data: ObjectChangedData }

function handleMessage(msg: ReceivedMessage): any {
  switch (msg.type) {
    case ReceivedMessageType.DisplayToast: {
      if (msg.data.message.includes('booped you')) return handleBoop(msg.data);
      return;
    }

    case ReceivedMessageType.SpaceJoined: return handleJoinRoom(msg.data);

    case ReceivedMessageType.EntitiesChanged: {
      let dot = msg.data.users?.[0];
      let object = msg.data.objects?.[0];
      if (dot) { /* handleDotChange */ }
      if (object) { console.log(JSON.stringify(object)); /* handleObjectChange */ }
      return;
    }
  };
}

let handleBoop = ({ senderRoomId: roomId, highlightedText }: DisplayToastData) => {
  if (!roomId)
    return;

  let [username, roomName] = highlightedText;

  username = username?.replace('@', '') ?? null;

  events.emit('boop', {
    roomId,
    username,
    roomName,
  });
};


let handleJoinRoom = (data: SpaceJoinedData) => {
  let user = data.gameData.users.find(u => u.id === getState().userId) ?? NoUserIdError();
  let x = user.position!.x;
  let y = user.position!.y;
  let moveId = user.moveId;
  let roomId = data.room.id;

  let entities = data.gameData.objects;

  updateState(state => state.currentRoom = {
    id: data.room.id,
    data: data.room,
    entities,
    x,
    y,
  });

  updateState(state => state.moveId = moveId);
  updateState(state => state.roomId = roomId);
  
  let { objects, users } = data.gameData;

  events.emit('join_room', {
    id: roomId,
    users,
    objects,
  });
};

export { handleMessage };