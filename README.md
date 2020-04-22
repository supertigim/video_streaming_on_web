Introduction  
============  

This project shows how to do video streaming on web epecially using WebRTC with ReactJS.  

**Note**: Only run and tested on Ubuntu 18.04. 


Browser Test    
===============  

**[Supported]**
- Chrome on Ubuntu 18.04, MacOS, and Windows
- Firefox on Ubuntu 18.04
- Safari on MacOS, iOS (iPhone 6.0)

**[Not supported]**
- Microsoft Edge
- Internet Explorer


Environment  
===========  
  
For python 3, 
```  
    # for aiortc 
    $ apt install libavdevice-dev libavfilter-dev libopus-dev libvpx-dev pkg-config
    $
    # Aussme that anaconda or miniconda is already installed
    $ conda create -n vs python=3.7
    $ conda activate vs
    (vs)$ pip install aiohttp aiortc opencv-python 
```  
  
For node.js,  
```		
    $ sudo apt-get install curl  
    $ curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -  
    $ sudo apt-get install nodejs
```  


STUN server  
=========== 

Bascially, you can use any of public STUN servers on the internet like **stun.l.google.com:19302** or you don't need it in this project. However, you might consider running your own STUN in case like you test it on **a Firefox browser without internet**. Here's how to run your own STUN server.  
  
```  
    $ sudo apt-get install coturn  
    $ sudo /etc/turnserver.conf /etc/turnserver.conf.old  
    $ sudo copy ./data/turnserver.conf /etc/turnserver.conf   
    $ sudo turnserver  

    # Put your own stun server IP address in ./webrtc/index.js and ./webrtc/view.js
```  

If you want to set SSL, then...

```  
    $ sudo mkdir /var/local/cert  
    $ sudo copy ./cert/stun-* /var/local/cert  

    # Uncomment line 14, 15 in turnserver.conf  
```  


How to Run  
==========  

For aiohttp/aiortc server, 
```
    $ conda activate vs 
    (vs) $ cd webrtc  
    (vs) webrtc$ python server.py --cert-file ../cert/common.crt --key-file ../cert/public.key
```

For react app, 
```  
    # Modify wss://IP-address:4000/ws with your server IP
    $
    $ cd react-webrtc-app
    react-webrtc-app$ npm install
    react-webrtc-app$ npm start 
```  

How to use  
===========   

- Navigate to `https://localhost:4000/`

    - Check the below options

      - Use datachannel
      - Use video
      - Use audio (if required)

  - Click `Start` to start process.

  - Once the video is successfully getting processed, proceed to view

  - On another system(or browser) navigate to https://[ip address]:4000/view

  - Click on start button

- Navigate to `https://localhost:3000/`

    - TBD


Trouble Shooting  
================  

If you encounter a problem when you install aiortc on Ubuntu 18.04,

```  
    conda install av -c conda-forge  
```  


Reference  
=========  
- [ReactRTC](https://github.com/oslabs-beta/ReactRTC)   
- [ReactRTC example and easy explanation about WebRTC](https://medium.com/@dianewudw/build-your-own-video-chat-app-with-react-and-webrtc-bd4dd0c5c0ea)  
- [React + WebRTC SPA](https://github.com/dondido/webrtc-video-room)  
- [aiortc](https://github.com/aiortc/aiortc)  
- [WebSocket, Aiohttp, Django](https://steelkiwi.com/blog/websocket-server-on-aiohttp-in-django-project/)  
- [Simple Chat written in aiohttp using WebSocket](https://steelkiwi.com/blog/an-example-of-a-simple-chat-written-in-aiohttp/#WebSocket)  
- [WebSocket Test with curl](https://gist.github.com/htp/fbce19069187ec1cc486b594104f01d0)  
- [Inconsitent behaviour from getUserMedia (Answer) https](https://stackoverflow.com/questions/60949169/inconsistent-behavior-from-getusermedia-in-insecure-context)    
- [How to use jsmgp.js](https://github.com/tahaipek/Nodcam/blob/master/public/jsmpg.js)  
- [How to use jsmpeg player in React](https://github.com/cycjimmy/jsmpeg-player/issues/17)  
- [Video Streaming using OpenCV](https://www.pyimagesearch.com/2019/09/02/opencv-stream-video-to-web-browser-html-page/)   
- [WebRCT 101](https://codelabs.developers.google.com/codelabs/webrtc-web/)  
- [Open source stun server](https://github.com/jselbie/stunserver)  
- [7 ways to stream RTSP on the page](https://flashphoner.com/7-ways-to-stream-rtsp-on-the-page/)  
- [Installation issues on Ubuntu 18.4](https://github.com/aiortc/aiortc/issues/326)
- [Test SSL Key for https](https://github.com/omarabid59/YOLO_Google-Cloud/tree/master/webserver
)   
- [new video tag policy for iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/)  
- [coturn configuration in Ubuntu 18.04](https://ourcodeworld.com/articles/read/1175/how-to-create-and-configure-your-own-stun-turn-server-with-coturn-in-ubuntu-18-04)  
- [video autoplay fix on iPhone](https://forums.developer.apple.com/thread/79501)  
- [Setting up Coturn with SSL](https://meetrix.io/blog/webrtc/coturn/installation.html)  
- [How to fix the ICE candidate problem on iOS](https://stackoverflow.com/questions/51925319/cannot-get-local-candidate-for-webrtc-in-ios-safari)  
- [create-react-app error fix](https://github.com/facebook/create-react-app/issues/7612)  
