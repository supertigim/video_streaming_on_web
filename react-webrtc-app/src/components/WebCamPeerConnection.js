import React, { Component } from 'react';
import { createMessage, createPayload } from './ReactRTC/functions/utils';
import { TYPE_WEBCAM_CANDIDATE, TYPE_WEBCAM_OFFER_ } from './const'; 

class WebCamPeerConnection extends Component {
  constructor(props) {
    super(props)
  }

  addTransceiver = async () => {
    const { rtcPeerConnection } = this.props;
    rtcPeerConnection.addTransceiver('video', {direction: 'recvonly'});
    rtcPeerConnection.addTransceiver('audio', {direction: 'recvonly'});   
  }

  handleOnNegotiationNeeded = async (negotiationNeededEvent) => {
    const { sendMessage, roomInfo, rtcPeerConnection } = this.props;
    try {
      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, rtcPeerConnection.localDescription);
      const offerMessage = createMessage(TYPE_WEBCAM_OFFER_, payload);
      sendMessage(JSON.stringify(offerMessage));
    } catch(error) {
      console.error('WebCamPeerConnection::handleNegotiationNeeded Error: ', error)
    }
  }

  handleOnIceEvent = (rtcPeerConnectionIceEvent) => {
    if (rtcPeerConnectionIceEvent.candidate) {
      const { sendMessage, roomInfo } = this.props;
      const { candidate } = rtcPeerConnectionIceEvent;
      const payload = createPayload(roomInfo.roomKey, roomInfo.socketID, JSON.stringify(candidate));
      const iceCandidateMessage = createMessage(TYPE_WEBCAM_CANDIDATE, payload);
      sendMessage(JSON.stringify(iceCandidateMessage));
    }
  }

  handleOnTrack = (trackEvent) => {
    console.log("WebCamPeerConnection::handleOnTrack");
    const remoteMediaStream = new MediaStream([ trackEvent.track ]);
    this.props.addRemoteStream(remoteMediaStream);
  }

  componentDidMount() {
    const { rtcPeerConnection } = this.props;
    rtcPeerConnection.onnegotiationneeded = this.handleOnNegotiationNeeded;
    rtcPeerConnection.onicecandidate = this.handleOnIceEvent;
    rtcPeerConnection.ontrack = this.handleOnTrack;
  }

  componentDidUpdate(prevProps) {
    if (this.props.startConnection !== prevProps.startConnection) {
      this.addTransceiver();
    }
  }

  render() {
    return(
      <>
      </>
    );
  }
}

export default WebCamPeerConnection;
