# -*- coding:utf-8 -*-  
import argparse
import asyncio
import json
import logging
import os
import ssl
import uuid

from aiohttp import web, WSMsgType
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaBlackhole, MediaPlayer, MediaRecorder

from video_utils import VideoTransformTrack
from ws_signaling import WSSignaling

ROOT = os.path.dirname(__file__)

class WebRTCApp:

    def __init__(self):
        self.logger = logging.getLogger("pc")
        self.pcs = set()
        self.local_video = None

    async def index(self, request):
        content = open(os.path.join(ROOT, "index.html"), "r").read()
        return web.Response(content_type="text/html", text=content)

    async def javascript_index(self, request):
        content = open(os.path.join(ROOT, "index.js"), "r").read()
        return web.Response(content_type="application/javascript", text=content)

    async def view(self, request):
        content = open(os.path.join(ROOT, "view.html"), "r").read()
        return web.Response(content_type="text/html", text=content)

    async def javascript_view(self, request):
        content = open(os.path.join(ROOT, "view.js"), "r").read()
        return web.Response(content_type="application/javascript", text=content)

    async def offer_view(self, request):
        params = await request.json()
        offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

        pc = RTCPeerConnection()
        pc_id = "PeerConnection(%s)" % uuid.uuid4()
        self.pcs.add(pc)

        def log_info(msg, *args):
            self.logger.info(pc_id + " " + msg, *args)

        log_info("Receiving for %s", request.remote)

        @pc.on("datachannel")
        def on_datachannel(channel):
            @channel.on("message")
            def on_message(message):
                if isinstance(message, str) and message.startswith("ping"):
                    channel.send("pong" + message[4:])

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            log_info("ICE connection state is %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                pcs.discard(pc)

        # handle offer
        await pc.setRemoteDescription(offer)
        #await recorder.start()

        for t in pc.getTransceivers():
            # if t.kind == "audio" and player.audio:
            #     pc.addTrack(player.audio)
            if t.kind == "video":
                print(self.local_video)
                pc.addTrack(self.local_video)

        # send answer
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return web.Response(
            content_type="application/json",
            text=json.dumps(
                {
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type
                }
            ),
        )

    async def offer(self, request):
        params = await request.json()
        offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])

        pc = RTCPeerConnection()
        pc_id = "PeerConnection(%s)" % uuid.uuid4()
        self.pcs.add(pc)

        def log_info(msg, *args):
            self.logger.info(pc_id + " " + msg, *args)

        log_info("Created for %s", request.remote)

        # prepare local media
        player = MediaPlayer(os.path.join(ROOT, "../data/demo-instruct.wav"))
        if args.write_audio:
            recorder = MediaRecorder(args.write_audio)
        else:
            recorder = MediaBlackhole()

        @pc.on("datachannel")
        def on_datachannel(channel):
            @channel.on("message")
            def on_message(message):
                if isinstance(message, str) and message.startswith("ping"):
                    channel.send("pong" + message[4:])

        @pc.on("iceconnectionstatechange")
        async def on_iceconnectionstatechange():
            log_info("ICE connection state is %s", pc.iceConnectionState)
            if pc.iceConnectionState == "failed":
                await pc.close()
                self.pcs.discard(pc)

        @pc.on("track")
        def on_track(track):
            log_info("Track %s received", track.kind)

            if track.kind == "audio":
                pc.addTrack(player.audio)
                recorder.addTrack(track)
            elif track.kind == "video":
                print(self.local_video)
                print("done")
                self.local_video = VideoTransformTrack(
                    track, transform=params["video_transform"]
                )
                pc.addTrack(self.local_video)

            @track.on("ended")
            async def on_ended():
                log_info("Track %s ended", track.kind)
                await recorder.stop()

        # handle offer
        await pc.setRemoteDescription(offer)
        await recorder.start()

        # send answer
        answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        return web.Response(
            content_type="application/json",
            text=json.dumps(
                {
                "sdp": pc.localDescription.sdp,
                "type": pc.localDescription.type
                }
            ),
        )

    async def on_shutdown(self, app):
        # close peer connections
        coros = [pc.close() for pc in self.pcs]
        await asyncio.gather(*coros)
        self.pcs.clear()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="WebRTC sever"
    )
    parser.add_argument("--cert-file", help="SSL certificate file (for HTTPS)")
    parser.add_argument("--key-file", help="SSL key file (for HTTPS)")
    parser.add_argument(
        "--port", type=int, default=4000, help="Port for HTTP server (default: 4000)"
    )
    parser.add_argument("--verbose", "-v", action="count")
    parser.add_argument("--write-audio", help="Write received audio to a file")
    args = parser.parse_args()

    if args.verbose:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    if args.cert_file:
        ssl_context = ssl.SSLContext()
        ssl_context.load_cert_chain(args.cert_file, args.key_file)
    else:
        ssl_context = None

    webrtc = WebRTCApp()

    app = web.Application()
    app.on_shutdown.append(webrtc.on_shutdown)

    app.router.add_get("/", webrtc.index)
    app.router.add_get("/index.js", webrtc.javascript_index)
    app.router.add_post("/offer", webrtc.offer)
    
    app.router.add_get("/view", webrtc.view)
    app.router.add_get("/view.js", webrtc.javascript_view)
    app.router.add_post("/offer_view", webrtc.offer_view)

    app.add_routes([web.get('/ws', WSSignaling(webrtc).websocket_handler)])

    web.run_app(app, access_log=None, port=args.port, ssl_context=ssl_context) #host='127.0.0.1',

# end of file