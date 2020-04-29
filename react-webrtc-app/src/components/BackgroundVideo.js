import React, { PureComponent } from 'react';

import classes from './RTCMain.module.css';

class BackgroundVideo extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isVideoMuted: true
    };
  }

  handleMuteState = () => {
    this.setState(prevState => ({
      isVideoMuted: !prevState.isVideoMuted
    }));
  }

  addMediaStream = (video) => {
    const { mediaStream } = this.props;
    // Prevents throwing error upon a setState change when mediaStream is null
    // upon initial render
    if (mediaStream) video.srcObject = mediaStream;
  }

  render() {
    const { mediaStream } = this.props;
    console.log('mediaStream: ', mediaStream);

    return (
        <video 
          className={classes.Video} 
          playsInline 
          autoPlay 
          muted={this.state.isVideoMuted} 
          ref={mediaStream? this.addMediaStream:null} 
        />
    );
  }
};

export default BackgroundVideo;
