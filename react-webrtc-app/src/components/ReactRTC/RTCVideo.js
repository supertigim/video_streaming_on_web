import React, { PureComponent } from 'react';

class RTCVideo extends PureComponent {
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
      <div>
        <video 
          className="rtc__video" 
          style={{width: '480px', backgroundColor: 'black'}} 
          playsInline 
          autoPlay 
          muted={this.state.isVideoMuted} 
          ref={mediaStream? this.addMediaStream:null} 
        />
      </div>
    );
  }
  
  /*
  render_try() {
    const { mediaStream } = this.props;
    console.log('mediaStream: ', mediaStream);

    return (
      <div dangerouslySetInnerHTML={{ __html: `
      <video
        className="rtc__video"
        style={{width: '480px', backgroundColor: 'black'}}
        muted
        playsInline = "true"
        autoPlay = "true"
      >
        <track default kind="captions" />
      </video>
      ` }}
      ref={ref => {
        if(ref && mediaStream) {
          console.log(ref.children[0]); 
          ref.children[0].srcObject=mediaStream;
        }
      }}
      /> 
    );
  }

  render_try() {
    const { mediaStream } = this.props;
    console.log('mediaStream: ', mediaStream);

    return (
      <div>
        <video playsInline autoPlay muted={this.state.isVideoMuted} src="https://www.radiantmediaplayer.com/media/bbb-360p.mp4" />
        <video className="rtc__video" style={{width: '480px', backgroundColor: 'black'}} playsInline autoPlay muted={this.state.isVideoMuted} ref={mediaStream? this.addMediaStream:null} />
        <button onClick={this.handleMuteState}>{this.state.isVideoMuted ? 'Unmute' : 'Mute'}</button >
      </div>
    );
  }
  */
};

export default RTCVideo;
