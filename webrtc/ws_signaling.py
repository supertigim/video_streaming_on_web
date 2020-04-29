# -*- coding:utf-8 -*-
import json
import uuid
import logging

from collections import defaultdict
from aiohttp import web, WSMsgType
from aiortc import RTCPeerConnection, RTCSessionDescription, RTCIceCandidate
from aiortc.sdp import candidate_from_sdp

from config import Config as cfg

class WSSignaling:
    def __init__(self, webrtc):
        self.users = 0
        self.channels = defaultdict(dict)
        self.webrtc = webrtc
        self.logger = logging.getLogger("pc-ws")
        self.pcs = dict()

    async def handle_connection(self, ws):
        initialMessage = { "type": cfg.TYPE_NEW_USER, "id": self.users }
        self.users += 1
        await ws.send_str(json.dumps(initialMessage))
        print('Websocket connection ready')

    async def handle_room(self, payload, ws):
        roomKey = payload["roomKey"]
        print("New client has joined room ", roomKey)

        if len(self.channels[roomKey]) >= 2: # because 1 on 1 video chat
            print("Room is full!!!! Disconnect!!!")
            await ws.close()
            return
        
        self.channels[roomKey][payload["socketID"]] = ws

        if len(self.channels[roomKey]) == 2: # Full Room 
            print("Sharing starts")
            full_room_ready_message = { "type": "CONNECTION", "startConnection": True }
            for client, c_ws in self.channels[roomKey].items():
                if ws is c_ws: continue
                await c_ws.send_str(json.dumps(full_room_ready_message))

    async def handle_offer_for_webcam(self, request, ws):
        offer = RTCSessionDescription(sdp=request["sdp"], type=request["type"])

        pc = RTCPeerConnection()
        pc_id = "PeerConnection(%s)" % uuid.uuid4()
        self.webrtc.pcs.add(pc)
        self.pcs[ws] = pc

        def log_info(msg, *args):
            self.logger.info(pc_id + " " + msg, *args)
        #log_info("Receiving for %s", request.remote)

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            log_info("ICE connection state is %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                self.webrtc.pcs.discard(pc)

        # handle offer
        await pc.setRemoteDescription(offer)

        for t in pc.getTransceivers():
            # if t.kind == "audio" and player.audio:
            #     pc.addTrack(player.audio)
            if t.kind == "video":
                print(self.webrtc.local_video)
                pc.addTrack(self.webrtc.local_video)

        # send answer
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        answer = {"sdp": pc.localDescription.sdp, "type": pc.localDescription.type}
        answer_message = { "type": "ANSWER", "payload": {"message":answer} }
        log_info("Negotiation Answer- %s", answer_message)
        await ws.send_str(json.dumps(answer_message))

    async def handle_add_candidate_for_webcam(self, msg, ws):
        pc = self.pcs[ws]
        msg = json.loads(msg)
        print("add_candidate: ", msg["candidate"])
        candidate = candidate_from_sdp(msg["candidate"].split(":", 1)[1])
        candidate.sdpMid = msg["sdpMid"]
        candidate.sdpMLineIndex = msg["sdpMLineIndex"]
        pc.addIceCandidate(candidate)

    async def websocket_handler(self, request):
        print('Websocket connection starting')
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        await self.handle_connection(ws)

        async for msg in ws:
            print(msg)
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                print(data)
                if data["type"] == cfg.TYPE_WEBCAM_OFFER_:
                    await self.handle_offer_for_webcam(data["payload"]["message"], ws)

                elif data["type"] == cfg.TYPE_WEBCAM_CANDIDATE:
                    await self.handle_add_candidate_for_webcam(data["payload"]["message"], ws)

                elif data["type"] == cfg.TYPE_ROOM:
                    await self.handle_room(data["payload"], ws)
                else:
                    # by-pass message | Broadcast except myself
                    for client, c_ws in self.channels[data["payload"]["roomKey"]].items():
                        if ws is c_ws: continue
                        await c_ws.send_str(msg.data)
            else:
                await ws.close()
                break
        print('Websocket connection closed')
        return ws