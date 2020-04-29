import React, { Component } from 'react';
import ReactNipple from 'react-nipple';
import Websocket from './ReactRTC/Websocket.js';
import { DEFAULT_ICE_SERVERS} from './ReactRTC/functions/constants';
import { buildServers } from './ReactRTC/functions/utils';
import 'core-js/stable';
import 'regenerator-runtime'

import BackgroundVideo from './BackgroundVideo.js';
import PeerConnection from './WebCamPeerConnection.js';
import {DEFAULT_CONSTRAINTS, ROOM_KEY_FOR_WEBCAM} from './const.js';

import classes from './RTCMain.module.css';

class RTCMain extends Component {
  constructor(props) {
    super(props);
    const {mediaConstraints, iceServers} = props;
    // build iceServers config for RTCPeerConnection
    const iceServerURLs = buildServers(iceServers);
    this.state = {
      iceServers: iceServerURLs || DEFAULT_ICE_SERVERS,
      mediaConstraints: mediaConstraints || DEFAULT_CONSTRAINTS,
      remoteMediaStream: null,
      localMediaStream: null,
      roomKey: ROOM_KEY_FOR_WEBCAM,
      socketID: null,
      connectionStarted: false,
    };
    this.socket = new WebSocket(this.props.URL);
    this.rtcPeerConnection = new RTCPeerConnection({ sdpSemantics: 'unified-plan', iceServers: this.state.iceServers });
  }

  handleOffer = async (data) => {
    console.log("handleOffer: this function should not be invoked");
  }

  handleIceCandidate = async (data) => {
    console.log("handleIceCandidate: this function should not be invoked");
  }

  handleConnectionReady = (message) => {
    console.log("handleConnectionReady: this function should not be invoked");
  }

  handleSocketConnection = (socketID) => {
    this.setState({ socketID });
  }

  handleAnswer = async (data) => {
    const { localMediaStream } = this.state;
    const { payload } = data;
    await this.rtcPeerConnection.setRemoteDescription(payload.message);
    if (localMediaStream){
      localMediaStream.getTracks().forEach( (track) => {
        track.stop();
        })
      this.setState({ localMediaStream: null});
    }
  }

  addRemoteStream = (remoteMediaStream) => {
    this.setState({ remoteMediaStream });
  }

  handleButtonClick = async (event) => {
    const { mediaConstraints } = this.state;
    console.log("Button Clicked", mediaConstraints);
    let mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    this.setState({ localMediaStream: mediaStream, connectionStarted: true });
  }

  render() {
    const { 
      localMediaStream,
      remoteMediaStream,
      roomKey,
      socketID,
      iceServers,
      connectionStarted,
    } = this.state;
    const sendMessage = this.socket.send.bind(this.socket);

    return (
      <> 
        <Websocket 
          socket={this.socket}
          setSendMethod={this.setSendMethod}
          handleSocketConnection={this.handleSocketConnection}
          handleConnectionReady={this.handleConnectionReady}
          handleOffer={this.handleOffer}
          handleAnswer={this.handleAnswer}
          handleIceCandidate={this.handleIceCandidate}
        />
        <PeerConnection
          rtcPeerConnection={this.rtcPeerConnection}
          iceServers={iceServers}
          localMediaStream={localMediaStream}
          addRemoteStream={this.addRemoteStream}
          startConnection={connectionStarted}
          sendMessage={sendMessage}
          roomInfo={{ socketID, roomKey }}
        />
        <div className={classes.Container}>
          <BackgroundVideo mediaStream={remoteMediaStream} />

          <div className={classes.Content}>
              <div className={classes.SubContent} >
                  <h1>Tigim Insight</h1>
                  <p>Mobile Robot Joystick</p>
                  <button type="button" className="btn btn-outline-dark" onClick={this.handleButtonClick} >Connect the Cam</button>
                  <ReactNipple
                    // supports all nipplejs options
                    // see https://github.com/yoannmoinet/nipplejs#options
                    options={{ mode: 'static', position: { top: '50%', left: '20%' } }}
                    // any unknown props will be passed to the container element, e.g. 'title', 'style' etc
                    
                    // all events supported by nipplejs are available as callbacks
                    // see https://github.com/yoannmoinet/nipplejs#start
                    onMove={(evt, data) => console.log(evt, data)}
                />        
              </div>
            </div>
          </div>
        </>
    );
  }
}

export default RTCMain;
