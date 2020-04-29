
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import * as serviceWorker from './serviceWorker';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

import RTCMesh from './components/ReactRTC/RTCMesh.js';
import RTCMain from './components/RTCMain.js';

import {WEBSOCKET_URL} from './components/const.js';

ReactDOM.render(
    <BrowserRouter>
        <main>
            <Switch>
                <Route exact path="/" render={(props)=> <RTCMain URL={WEBSOCKET_URL} />} />
                <Route exact path="/one_on_one" render={(props)=> <RTCMesh URL={WEBSOCKET_URL} />} />
                <Route component={Error} /> 
            </Switch>
        </main>
    </BrowserRouter>, 
    document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
