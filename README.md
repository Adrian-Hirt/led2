# Because the LEDs aren't installed anymore, development is paused at the moment!

# Bastli LED Contest entry, Team Obamaqualizer

This is an application for the Bastli LED Contest, using Angular.js, Node.js and Socket.io. It features a webinterface with which you can control the LEDs
in the Aufenthaltsraum and it features a sound visualizer (with a web-based mp3 player) as well as various different effects.
___
### Installation

Make sure you have node.js and npm installed by running
```sh
node --version && npm --version
```
which should print out two numbers similar to
```sh
v5.5.0
3.3.12
```

If you don't have these installed, please refer to [the npm installation guide](https://docs.npmjs.com/getting-started/what-is-npm) to install node.js and npm.

Download the project and move in the directory. Run

```sh
npm install
```
to install the dependencies and then run the server as follows:
```sh
node app.js
```
which should print
```sh
Server up and running at port 420
```

Open your browser and navigate to localhost:420, which should give you the page and the cmd window should display
```sh
Client connected
```

Connect to the **BASTLI-Event** WiFi in the Aufenthaltsraum, and start a song you'd like to hear. The default LED style will start, and you can click on any style below the music library to instantly change the style of the visualisation. 
