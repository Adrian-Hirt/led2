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


    function renderFrame() {
            analyser.getByteFrequencyData(frequencyData);
            requestAnimationFrame(renderFrame);
            console.log(frequencyData);
    };

renderFrame();