# -*- coding:utf-8 -*-
import json

from collections import defaultdict
from aiohttp import web, WSMsgType

class WSSignaling:
    def __init__(self):
        self.users = 0
        self.channels = defaultdict(dict)

    async def websocket_handler(self, request):
        print('Websocket connection starting')
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        initialMessage = { "type": "NEW USER", "id": self.users }
        self.users += 1
        await ws.send_str(json.dumps(initialMessage))
        print('Websocket connection ready')

        async for msg in ws:
            print(msg)
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                print(data)
                if data["type"] == "ROOM":
                    roomKey = data["payload"]["roomKey"]
                    print("New client has joined room ", roomKey);

                    if len(self.channels[roomKey]) >= 2: # because 1 on 1 video chat
                        print("Room is full!!!! Disconnect!!!")
                        await ws.close()
                        break
                    
                    self.channels[roomKey][data["payload"]["socketID"]] = ws

                    if len(self.channels[roomKey]) == 2: # Full Room 
                        print("Sharing starts")
                        ready = { "type": "CONNECTION", "startConnection": True };
                        for client, c_ws in self.channels[roomKey].items():
                            if ws is c_ws: continue
                            await c_ws.send_str(json.dumps(ready))
                else:
                    # Broadcast except myself
                    for client, c_ws in self.channels[roomKey].items():
                        if ws is c_ws: continue
                        await c_ws.send_str(msg.data)

            #else:
            #    await ws.close()
            #    break

        print('Websocket connection closed')
        return ws