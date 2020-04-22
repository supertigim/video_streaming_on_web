import React from 'react';
import './App.css';
import RTCMesh from './components/ReactRTC/RTCMesh.js';

function App() {
  return (
    <RTCMesh URL="wss://192.168.0.17:4000/ws" />
  );
}

export default App;
