// get DOM elements
var dataChannelLog = document.getElementById('data-channel'),
    iceConnectionLog = document.getElementById('ice-connection-state'),
    iceGatheringLog = document.getElementById('ice-gathering-state'),
    signalingLog = document.getElementById('signaling-state');

//navigator.mediaDevices.getUserMedia({audio: true})

// peer connection
var pc = null;

// data channel
var dc = null, dcInterval = null;

function createPeerConnection() {
    var config = {
        sdpSemantics: 'unified-plan',
        //iceServers: [],
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
        //iceServers: [{urls: 'stun:your_own_stun_server:3478'},],
        //iceServers: [{urls: 'stun:your_own_stun_server:3478', credential: 'test', username: 'test'}],
        //iceCandidatePoolSize: 2
    };
    
    var pc = null;// new RTCPeerConnection(config);

    if (typeof(RTCPeerConnection) === 'function') {
        pc = new RTCPeerConnection(config);
    } else if (typeof(webkitRTCPeerConnection) === 'function') {
        pc = new webkitRTCPeerConnection(config);
    } else if (typeof(mozRTCPeerConnection) === 'function') {
        pc = new mozRTCPeerConnection(config);
    }

    // register some listeners to help debugging
    pc.addEventListener('icegatheringstatechange', function() {
        iceGatheringLog.textContent += ' -> ' + pc.iceGatheringState;
    }, false);
    iceGatheringLog.textContent = pc.iceGatheringState;

    pc.addEventListener('iceconnectionstatechange', function() {
        iceConnectionLog.textContent += ' -> ' + pc.iceConnectionState;

        // Create offer again and send it to remote peer with new candidates
        if(pc.iceConnectionState == "checking") {
            console.log("It is checking right now");
        }
    }, false);
    iceConnectionLog.textContent = pc.iceConnectionState;

    pc.addEventListener('signalingstatechange', function() {
        signalingLog.textContent += ' -> ' + pc.signalingState;
    }, false);
    signalingLog.textContent = pc.signalingState;

    pc.onicecandidate = function(event) {
      if (event.candidate) {
        // Send the candidate to the remote peer
        iceConnectionLog.textContent += ' -> ' + event.candidate;
      } else {
        // All ICE candidates have been sent
      }
    }

    pc.addTransceiver('video', {direction: 'recvonly'});
    pc.addTransceiver('audio', {direction: 'recvonly'});
    
    // connect audio / video
    pc.addEventListener('track', function(evt) {
        if (evt.track.kind == 'video')
            document.getElementById('video').srcObject = evt.streams[0];
        else
            document.getElementById('audio').srcObject = evt.streams[0];
    });

    return pc;
}

function negotiate() {

    return pc.createOffer().then(function(offer) {
        return pc.setLocalDescription(offer);
    }).then(function() {
        // wait for ICE gathering to complete
        return new Promise(function(resolve) {
            if (pc.iceGatheringState === 'complete') {
                resolve();
            } else {
                function checkState() {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState);
                        resolve();
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState);
            }
        });
    }).then(function() {
        var offer = pc.localDescription;

        document.getElementById('offer-sdp').textContent = offer.sdp;
        return fetch('/offer_view', {
            body: JSON.stringify({
                sdp: offer.sdp,
                type: offer.type,
            }),
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });
    }).then(function(response) {
        return response.json();
    }).then(function(answer) {
        document.getElementById('answer-sdp').textContent = answer.sdp;
        return pc.setRemoteDescription(answer);
    }).catch(function(e) {
        alert(e);
    });
}

function start() {
    document.getElementById('start').style.display = 'none';

    pc = createPeerConnection();

    var time_start = null;

    function current_stamp() {
        if (time_start === null) {
            time_start = new Date().getTime();
            return 0;
        } else {
            return new Date().getTime() - time_start;
        }
    }

    if (document.getElementById('use-datachannel').checked) {

        dc = pc.createDataChannel('chat');
        dc.onclose = function() {
            clearInterval(dcInterval);
            dataChannelLog.textContent += '- close\n';
        };
        dc.onopen = function() {
            dataChannelLog.textContent += '- open\n';
            dcInterval = setInterval(function() {
                var message = 'ping ' + current_stamp();
                dataChannelLog.textContent += '> ' + message + '\n';
                dc.send(message);
            }, 1000);
        };
        dc.onmessage = function(evt) {
            dataChannelLog.textContent += '< ' + evt.data + '\n';

            if (evt.data.substring(0, 4) === 'pong') {
                var elapsed_ms = current_stamp() - parseInt(evt.data.substring(5), 10);
                dataChannelLog.textContent += ' RTT ' + elapsed_ms + ' ms\n';
            }
        };
    }

    // Calling getUserMedia leads to success in ICE negotiation on WebRTC communication 
    navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
        negotiate();
        stream.getTracks().forEach(function(track) {    
            track.stop();   // don't use it at all
        });
    }, function(err) {
        alert('Could not acquire media: ' + err);
    });
    
    document.getElementById('stop').style.display = 'inline-block';
}

function stop() {
    document.getElementById('stop').style.display = 'none';

    // close data channel
    if (dc) {
        dc.close();
    }

    // close transceivers
    if (pc.getTransceivers) {
        pc.getTransceivers().forEach(function(transceiver) {
            if (transceiver.stop) {
                transceiver.stop();
            }
        });
    }

    // close local audio / video
    //pc.getSenders().forEach(function(sender) {
    //    sender.track.stop();
    //});

    // close peer connection
    setTimeout(function() {
        pc.close();
    }, 500);
}
