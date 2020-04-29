Introduction  
============  

This project shows how to do video streaming on web epecially using WebRTC with ReactJS.  

**Note**: Only run and tested on Ubuntu 18.04. 

![](/data/video_streaming_system_architecture.png)  


Browser Test    
===============  

**[Supported]**
- Chrome on Ubuntu(Linux), macOS, and Windows
- Firefox on Ubuntu(Linux)
- Safari on macOS and iOS (iPhone, iPad, etc)

**[Not supported]**
- Microsoft Edge
- Internet Explorer
- Chrome on iOS (iPhone, iPad , etc)


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

For **SSL on iOS**, please read [this site](https://github.com/mattdesl/budo/blob/dcbc05866f583e172d6b46c898048436ab84ddae/docs/command-line-usage.md#ssl-on-ios) first and make sure that **Websocket** on iOS really depends on SSL. 

```
    # assume that your IP is 192.168.1.50
    $ cd cert
    cert$ openssl genrsa -out server.key 2048
    cert$ openssl req -new -x509 -sha256 -key server.key -out server.crt -days 365 -subj /CN=192.168.1.50
    # if you see the error about .rnd, go to trouble shooting section 
    cert$
    cert$ sudo npm install budo
    cert$ budo --ssl --cert=./server.crt --key=./server.key
```
- Visit https://192.168.1.50:9966/
- View and export the certificate as **server.key** <== the same name above
- Update ./cert/server.pem with ./cert/server.key and ./cert/server.crt

```  
    cert$ copy server.key server.share.pem 
```  
- Email server.share.pem as an attachment to yourself 
- Open the mail on iPhone and click the certificate to download
- Go to Settings -> Download Profile --> Install and verify it 
- Go to Settings -> General -> About -> Certificate Trust Settings --> Turn it On


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

Do **NOT** forget to update the followin files
- line 19 in ./webrtc/index.js
- line 19 in ./webrtc/view.js
- line 2 in ./react-webrct-app/src/components/ReactRTC/functions/constants.js


How to Run  
==========  

For aiohttp/aiortc server, 
```
    $ conda activate vs 
    (vs) $ cd webrtc  
    (vs) webrtc$ python server.py --cert-file ../cert/server.crt --key-file ../cert/server.key
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
  
You need to put an exact IP address on a browswer because **localhost** or **127.0.0.1** don't work with the certificate which is created by the IP address of your machine.   

- Navigate to `https://your_IP_address:4000/`

    - Check the below options

      - Use datachannel
      - Use video
      - Use audio (if required)

  - Click `Start` to start process.

  - Once the video is successfully getting processed, proceed to view

  - On another system(or browser) navigate to https://[your_IP_address]:4000/view

  - Click on start button

- Navigate to `https://your_IP_address:3000/`

    - Click the button to connect to the cam 


[Reference - One on One Test using ReactRTC Module]

- Open a new browser and navigate to 'https://your_IP_address:3000/one_on_one'
    - Click the green button next to 'Share Screen'
    - Enter a room key in the text box and click 'submit' 

- Open another new browser and navigate to 'https://your_IP_address:3000/one_on_one'
    - Click the green button next to 'Share Screen'
    - Enter the same room key in the text box and click 'submit' 


Trouble Shooting  
================  

(1) If you encounter a problem when you install aiortc on Ubuntu 18.04,

```  
    conda install av -c conda-forge  
```  

(2) It seems like Safari is the only browser that doesn't accept a self-signed untrusted certificate for secure WebSockets.

- Make sure you're using SHA256 generating the self-signed key
- Make sure your CommonName is set to the same host (i.e. IP) you are running — you can use the command -subj /CN=192.168.1.54
- You need to send the .cer file to your phone and manually Install/Trust it (which adds it to General > Profiles)
- You can find the details in [here](https://github.com/mattdesl/budo/blob/dcbc05866f583e172d6b46c898048436ab84ddae/docs/command-line-usage.md#ssl-on-ios)

(3) can not find ~/your_home/.rnd 

```  
    openssl rand -out /home/your_home/.rnd -hex 256
```  

(4) How to test websocket  

```
    curl https://127.0.0.1:4000/ws -v -H "Connection: Upgrade" -H "Upgrade: WebSocket"
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
- [How to use dangerouslySetInnerHTML](https://github.com/facebook/react/issues/6544)  
- [Test streaming url](https://www.radiantmediaplayer.com/test-your-streaming-url.html)  
- [video autoplay is not working in Safari](https://stackoverflow.com/questions/52399034/video-autoplay-is-not-working-chrome-and-safari)  
- [Websocket problem regarding SSL on iOS](https://github.com/mattdesl/budo/blob/dcbc05866f583e172d6b46c898048436ab84ddae/docs/command-line-usage.md#ssl-on-ios)
- [EasyRTC + React](https://github.com/Techistan/Video-Conferencing-With-EasyRTC)  
- [IP Camera + OpenCV + Python 3](https://cybercitycircuits.com/python-3-and-opencv-with-an-ip-camera/)  
- [ReactJS Joystick Feature](https://loopmode.github.io/react-nipple/)  