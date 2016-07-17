var app = angular.module('sampleApp', ['ngRoute', 'ngAnimate', 'ngResource']);

app.factory('socket', ['$rootScope', function($rootScope) {
    var socket = io.connect();

    return {
        on: function(eventName, callback){
            socket.on(eventName, callback);
        },
        emit: function(eventName, data) {
            socket.emit(eventName, data);
        }
    };
}]);

app.factory('styles', function ($resource) {
    return $resource('http://localhost:420/data/styles.json');
});

app.controller('IndexController', function($scope, socket, styles) {   
    
    var styleArray = [];
    
    styles.query(function(data) {
        styleArray = data;
        $scope.aboutStyle = styleArray[0];
    });
    
    var normalBg = document.getElementById('background');                                   // the normal bg video
    var mlgBg = document.getElementById('background2');                                     // the mlg bg video
    
    mlgBg.style.display = 'none';                                                           // hide the mlg bg video
    
    /******************************************************************************/
    
    function hslToRgb(h, s, l){                                                             // Function to transform the HSL value to a RGB value
        var r, g, b;

        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    };
    
    /******************************************************************************/

    
    window.AudioContext = window.AudioContext ||
                      window.webkitAudioContext;

    var ctx = new AudioContext();

    var errorCallback = function() {
        alert('Error');
    };

    navigator.getUserMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);

    var analyser = ctx.createAnalyser();
    var analyserSize = 32;

    navigator.getUserMedia({audio: true}, function(stream) {
        microphone = ctx.createMediaStreamSource(stream);
        microphone.connect(analyser);
    }, errorCallback);
    
    analyser.fftSize = analyserSize;    
    var frequencyData = new Uint8Array(analyser.frequencyBinCount);

    var style = 'one';
    
    var body = document.getElementsByTagName("body")[0];    
    
    $scope.changeStyle = function(selectedStyle) {
        style = selectedStyle;
        switch(style) {
                case 'one':
                    $scope.aboutStyle = styleArray[0];
                    break;
                case 'two':
                    $scope.aboutStyle = styleArray[1];
                    break;
                case 'three':
                    $scope.aboutStyle = styleArray[2];
                    break;
                case 'four':
                    $scope.aboutStyle = styleArray[3];
                    break;
                case 'five':
                    $scope.aboutStyle = styleArray[4];
                    break;
                case 'six':
                    $scope.aboutStyle = styleArray[5];
                    break;
                case 'seven':
                    $scope.aboutStyle = styleArray[6];
                    break;
                case 'mlg':
                   $scope.aboutStyle = styleArray[7];
                    break;
                case 'rainbow':
                    $scope.aboutStyle = styleArray[8];
                    break;
                case 'rainbowLinear':
                    $scope.aboutStyle = styleArray[9];
                    break;
                case 'white':
                    $scope.aboutStyle = styleArray[10];
                    break;
                case 'strobe':
                    $scope.aboutStyle = styleArray[11];
                    break;
                case 'strobeColor':
                    $scope.aboutStyle = styleArray[12];
                    break;
                default:
                    $scope.aboutStyle = styleArray[0];
            }
    };
    
         
   function renderFrame() {
            analyser.getByteFrequencyData(frequencyData);
            requestAnimationFrame(renderFrame);
             console.log(frequencyData);
            
            switch(style) {
                case 'one':
                    socket.emit('playing', frequencyData);
                    break;
                case 'two':
                    socket.emit('playing2', frequencyData);
                    break;
                case 'three':
                    socket.emit('playing3', frequencyData);
                    break;
                case 'four':
                    socket.emit('playing4', frequencyData);
                    break;
                case 'five':
                    socket.emit('playing5', frequencyData);
                    break;
                case 'six':
                    socket.emit('playing6', frequencyData);
                    break;
                case 'seven':
                    socket.emit('playing7', frequencyData);
                    break;
                case 'mlg':
                    socket.emit('mlg', frequencyData);
                    mlgBg.style.display = 'inline';
                    normalBg.style.display = 'none';
                    mlgBg.play();
                    normalBg.pause();
                    break;
                case 'rainbow':
                    socket.emit('rainbow', frequencyData);
                    break;
                case 'strobe':
                    socket.emit('strobe', frequencyData);
                    break;
                case 'strobeColor':
                    socket.emit('strobeColor', frequencyData);
                    break;
                case 'rainbowLinear':
                    socket.emit('rainbowLinear', frequencyData);
                    break;
                case 'white':
                    socket.emit('white', frequencyData);
                    break;
                case 'timeline':
                default:
                    socket.emit('one', frequencyData);
            };   
            
            if(style !== 'mlg') {
                mlgBg.style.display = 'none';
                normalBg.style.display = 'inline';
                mlgBg.pause();
                normalBg.play();
            };

    };
    
    renderFrame();
 
});   