var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var ip = '10.6.66.10';
// var ip = 'localhost';
var port = 1337;

app.use(express.static(__dirname + '/public'));
app.use('/dependencies', express.static(__dirname + '/node_modules/'));

/***********************************************************************************/
    
    function hslToRgb(h, s, l){
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

/***********************************************************************************/

    function sendData(data) {
        var buffer = new Buffer(data);
        client.send(buffer, 0, packageData.length, port, ip);
    };
 
/***********************************************************************************/

// Horizontal: 0, 2, 3, 10, 11, 13, 14
// Vertikal: 1, 4, 5, 6, 7, 8, 9, 12

var packageData = new Uint8Array(337);                                                      // Bytearray to hold the data for each strip                         

var waveIndex = 0;
var linearIndex = 0;
var strobeIndex = 0;
var strobeIndex2 = 0;

var oldTimeline = [];

/***********************************************************************************/

var effect1 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    var heightNumber = 0;                                                                   // Int to hold the number of active LEDs
                
    for(i = 1; i < 9; i++) {                                                                // Add bass to the heightNumber
        heightNumber += data[i];
    };
    
    heightNumber = (Math.round((heightNumber / 8) / 2.276)) * 3;                            // Get average of bass, turn from [0, 255] to [0, 112] and  
                                                                                            // multiply by 3 because we have 3 values (R, G, B)
    
    for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);                                               // Get the average of the color, divide by 200

    if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
        colorNumber = 1;
    };

    colorNumber = hslToRgb(colorNumber, 1, 0.5);                                            // Turn into RGB value, returns an array [R, G, B]
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 0 || i == 2 || i == 3 || i == 10 || i == 11 || i == 13 || i == 14) {        // Vertical LED                                             
            for(j = 1; j < heightNumber; j += 3) {
                packageData[j] = 0xff;                                                      // R Value
                packageData[j + 1] = 0xff;                                                  // G Value
                packageData[j + 2] = 0xff;                                                  // B Value
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            for(s = 1; s < 337; s += 3) {
                packageData[s] = colorNumber[0];                                            // R Value
                packageData[s + 1] = colorNumber[1];                                        // G Value
                packageData[s + 2] = colorNumber[2];                                        // B Value
            };
        };
        
       
            
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var effect2 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;
    var heightNumber1 = 0;
    var heightNumber2 = 0;
    var heightNumber3 = 0;
    
    for(i = 0; i < 6; i++) {
        heightNumber1 += data[i];
    };
    
    for(i = 6; i < 11; i++) {
        heightNumber2 += data[i];
    };
    
    for(i = 11; i < 14; i++) {
        heightNumber3 += data[i];
    };
    
    heightNumber1 = (Math.round((heightNumber1 / 6) / 2.276)) * 3;
    heightNumber2 = (Math.round((heightNumber2 / 5) / 2.276)) * 3;
    heightNumber3 = (Math.round((heightNumber3 / 3) / 2.276)) * 3;
    
    
    for(var i = 4; i < 16; i++) {
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);

    if(colorNumber > 1.0) {
        colorNumber = 1;
    };

    colorNumber = hslToRgb(colorNumber, 1, 0.5);
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {
        
        packageData = [];
        
        
        packageData[0] = i;
        
        if(i == 0 || i == 2 || i == 3 || i == 10 || i == 11 || i == 13 || i == 14) {        // Vertical LED                                             
            if(i == 2 || i == 10) {                                                         // Bass
                heightNumber = heightNumber1;
            }
            else if(i == 11 || i == 14) {                                                   // Middle
                heightNumber = heightNumber2;
            }
            else {                                                                          // High
                heightNumber = heightNumber3;
            };
            
            for(j = 1; j < heightNumber; j += 3) {
                packageData[j] = 0xff;
                packageData[j + 1] = 0xff;
                packageData[j + 2] = 0xff;
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0x00;
                packageData[j + 1] = 0x00;
                packageData[j + 2] = 0x00;
            };
        }
        else {                                                                              // Horizontal LED   
            for(s = 1; s < 337; s += 3) {
                packageData[s] = colorNumber[0];
                packageData[s + 1] = colorNumber[1];
                packageData[s + 2] = colorNumber[2];
            };
        };
                    
        sendData(packageData);
    };
};

/***********************************************************************************/

var effect3 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    var heightNumber = 0;                                                                   // Int to hold the number of active LEDs
    
    for(i = 1; i < 9; i++) {                                                                // Add bass to the heightNumber
        heightNumber += data[i];
    };
    
    heightNumber = (Math.round((heightNumber / 8) / 2.276)) * 3;                            // Get average of bass, turn from [0, 255] to [0, 112] and  
                                                                                            // multiply by 3 because we have 3 values (R, G, B)
    
    for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);                                               // Get the average of the color, divide by 200

    if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
        colorNumber = 1;
    };

    colorNumberArray = hslToRgb(colorNumber, 1, 0.5);                                            // Turn into RGB value, returns an array [R, G, B]
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 0 || i == 2 || i == 3 || i == 10 || i == 11 || i == 13 || i == 14) {        // Vertical LED                                             
            for(j = 1; j < heightNumber; j += 3) {
                packageData[j] = colorNumberArray[0];                                       // R Value
                packageData[j + 1] = colorNumberArray[1];                                   // G Value
                packageData[j + 2] = colorNumberArray[2];                                   // B Value
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            for(s = 1; s < 337; s += 3) {
                packageData[s] = colorNumberArray[0];                                            // R Value
                packageData[s + 1] = colorNumberArray[1];                                        // G Value
                packageData[s + 2] = colorNumberArray[2];                                        // B Value
            };
        };
        
       
            
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var effect4 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    var heightNumber = 0;                                                                   // Int to hold the number of active LEDs
    
    for(i = 1; i < 9; i++) {                                                                // Add bass to the heightNumber
        heightNumber += data[i];
    };
    
    heightNumber = (Math.round((heightNumber / 8) / 2.276)) * 3;                            // Get average of bass, turn from [0, 255] to [0, 112] and  
                                                                                            // multiply by 3 because we have 3 values (R, G, B)
    
    for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);                                               // Get the average of the color, divide by 200

    if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
        colorNumber = 1;
    };

    colorNumberArray = hslToRgb(colorNumber, 1, 0.5);                                            // Turn into RGB value, returns an array [R, G, B]
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 0 || i == 2 || i == 3 || i == 10 || i == 11 || i == 13 || i == 14) {        // Vertical LED                                             
            for(j = 1; j < heightNumber; j += 3) {
                
                var light = (1 - (((336 - j) / 336) / 2));
                
                colorNumberArray = hslToRgb(colorNumber, 1, light);  
                
                packageData[j] = colorNumberArray[0];                                       // R Value
                packageData[j + 1] = colorNumberArray[1];                                   // G Value
                packageData[j + 2] = colorNumberArray[2];                                   // B Value
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            
            colorNumberArray = hslToRgb(colorNumber, 1, 0.5);  
            
            for(s = 1; s < 337; s += 3) {    
                packageData[s] = colorNumberArray[0];                                            // R Value
                packageData[s + 1] = colorNumberArray[1];                                        // G Value
                packageData[s + 2] = colorNumberArray[2];                                        // B Value
            };
        };
             
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var effect5 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
                                                               
    var color = 0;                                                                   // Int to hold the number of active LEDs
    
    for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        color += data[i];
    };

    color = ((color / 15) / 255);                                               // Get the average of the color, divide by 200

    if(color > 1.0) {                                                                 // Number too big, make it 1 max.
        color = 1;
    };

    colorNumberArray = hslToRgb(color, 1, 0.5);                                            // Turn into RGB value, returns an array [R, G, B]
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
                
        for(s = 1; s < 337; s += 3) {    
            packageData[s] = colorNumberArray[0];                                            // R Value
            packageData[s + 1] = colorNumberArray[1];                                        // G Value
            packageData[s + 2] = colorNumberArray[2];                                        // B Value
        };
      
             
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var effect6 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    var heightNumber = 0;                                                                   // Int to hold the number of active LEDs
    
    for(i = 1; i < 9; i++) {                                                                // Add bass to the heightNumber
        heightNumber += data[i];
    };
    
    heightNumber = (Math.round((heightNumber / 8) / 2.276)) * 3;                            // Get average of bass, turn from [0, 255] to [0, 112] and  
                                                                                            // multiply by 3 because we have 3 values (R, G, B) 
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 4 || i == 5 || i == 7 || i == 12) {        // Vertical LED                                             
            for(j = 1; j < heightNumber; j += 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0xff;                                                      // R Value
                packageData[j + 1] = 0xff;                                                  // G Value
                packageData[j + 2] = 0xff;                                                  // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            
            var ledHeight = (336 - heightNumber);
            
            for(j = 336; j > ledHeight; j -= 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
            for(j = ledHeight; j > 0; j -= 3) {
                packageData[j] = 0xff;                                                      // R Value
                packageData[j + 1] = 0xff;                                                  // G Value
                packageData[j + 2] = 0xff;                                                  // B Value
            };
        };
            
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var effect7 = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    var heightNumber = 0;                                                                   // Int to hold the number of active LEDs
    
     for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);                                               // Get the average of the color, divide by 200

    if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
        colorNumber = 1;
    };

    colorNumberArray = hslToRgb(colorNumber, 1, 0.5);                                            // Turn into RGB value, returns an array [R, G, B]
    
    
    for(i = 1; i < 9; i++) {                                                                // Add bass to the heightNumber
        heightNumber += data[i];
    };
    
    heightNumber = (Math.round((heightNumber / 8) / 2.276)) * 3;                            // Get average of bass, turn from [0, 255] to [0, 112] and  
                                                                                            // multiply by 3 because we have 3 values (R, G, B) 
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 4 || i == 5 || i == 7 || i == 12) {        // Vertical LED                                             
            for(j = 1; j < heightNumber; j += 3) {
                packageData[j] = colorNumberArray[0];                                                      // R Value
                packageData[j + 1] = colorNumberArray[1];                                                  // G Value
                packageData[j + 2] = colorNumberArray[2];                                                  // B Value
            };
            for(j = heightNumber; j < 337; j += 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j + 1] = 0x00;                                                  // G Value
                packageData[j + 2] = 0x00;                                                  // B Value
            };
        }
        else if(i == 2 || i == 11 || i == 13 || i == 3 || i == 4 || i == 0 || i == 14 || i == 10){                                                                              // Horizontal LED   
            
            var ledHeight = (336 - (336 - heightNumber));
            
            for(j = ledHeight; j > 0; j -= 3) {
                packageData[j] = colorNumberArray[2];                                                      // R Value
                packageData[j - 1] = colorNumberArray[1];                                                  // G Value
                packageData[j - 2] = colorNumberArray[0];                                                  // B Value
            };
            for(j = 336; j > ledHeight; j -= 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j - 1] = 0x00;                                                  // G Value
                packageData[j - 2] = 0x00;                                                  // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            
            var ledHeight = (336 - heightNumber);
            
            for(j = 336; j > ledHeight; j -= 3) {
                packageData[j] = colorNumberArray[2];                                                      // R Value
                packageData[j - 1] = colorNumberArray[1];                                                  // G Value
                packageData[j - 2] = colorNumberArray[0];                                                  // B Value
            };
            for(j = ledHeight; j > 0; j -= 3) {
                packageData[j] = 0x00;                                                      // R Value
                packageData[j - 1] = 0x00;                                                  // G Value
                packageData[j - 2] = 0x00;                                                  // B Value
            };
        };
            
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var rainbow = function() {
    
    var step = ((Math.PI / 2) / 112);
    var color = 0;
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
       // Vertical LED                                             
        for(j = 1; j < 337; j += 3) {
            
            color = (step * (j - 1));
            color = Math.sin(color + waveIndex);
            colorNumber = hslToRgb(color, 1, 0.5);
            
            packageData[j] = colorNumber[0];                                                      // R Value
            packageData[j + 1] = colorNumber[1];                                                  // G Value
            packageData[j + 2] = colorNumber[2];                                                  // B Value
        };
        
        waveIndex += 0.001;
                
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var mlgEffect = function(data) {
    
    // Für vertikale: Höhe des Ausschlages = anzahl aktive (weisse) LEDs
    // Für horizontale: Höhe des Ausschlages = Farbe
    
    var colorNumber = 0;                                                                    // Int to hold the color
    
    for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
        colorNumber += data[i];
    };

    colorNumber = ((colorNumber / 14) / 200);                                               // Get the average of the color, divide by 200

    if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
        colorNumber = 1;
    };
                                         
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
        if(i == 0 || i == 2 || i == 3 || i == 10 || i == 11 || i == 13 || i == 14) {        // Vertical LED                                             
            colorNumberArray = hslToRgb(colorNumber, 1, 0.5);
            for(j = 1; j < 337; j += 3) {
               packageData[j] = colorNumberArray[0];                                             // R Value
                packageData[j + 1] = colorNumberArray[1];                                        // G Value
                packageData[j + 2] = colorNumberArray[2];                                        // B Value
            };
        }
        else {                                                                              // Horizontal LED   
            colorNumber = (1 - colorNumber);
            colorNumberArray = hslToRgb(colorNumber, 1, 0.5);
            for(j = 1; j < 337; j += 3) {
               packageData[j] = colorNumberArray[0];                                             // R Value
                packageData[j + 1] = colorNumberArray[1];                                        // G Value
                packageData[j + 2] = colorNumberArray[2];                                        // B Value
            };
        };
         
        sendData(packageData);                                                              // Send the data
    };
    
};

/***********************************************************************************/

var strobe = function() {
     // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
       // Vertical LED                                             
        for(j = 1; j < 337; j += 3) {
            
            colorNumber = hslToRgb(0, 1, 1);
            
            if((strobeIndex % 2) == 0) {
                packageData[j] = 0xff;                                                      
                packageData[j + 1] = 0xff;                                                 
                packageData[j + 2] = 0xff;    
            }
            else {
                packageData[j] = 0x00;                                                      
                packageData[j + 1] = 0x00;                                                 
                packageData[j + 2] = 0x00; 
            };                                                 
        };
        
        strobeIndex += 1;
        
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var white = function() {
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
       // Vertical LED                                             
        for(j = 1; j < 337; j += 3) {
            
            colorNumber = hslToRgb(0, 1, 1);
            
            packageData[j] = colorNumber[0];                                                      // R Value
            packageData[j + 1] = colorNumber[1];                                                  // G Value
            packageData[j + 2] = colorNumber[2];                                                  // B Value
        };
        
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var strobeColor = function(data) {
     // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        var colorNumber = 0;
        
        packageData[0] = i;
        
        for(var i = 4; i < 16; i++) {                                                           // Add sound to color (without the very deep bass)
            colorNumber += data[i];
        };

        colorNumber = ((colorNumber / 14) / 255);                                               // Get the average of the color, divide by 200

        if(colorNumber > 1.0) {                                                                 // Number too big, make it 1 max.
            colorNumber = 1;
        };

        colorNumber = hslToRgb(colorNumber, 1, 0.5);   
        
       // Vertical LED                                             
        for(j = 1; j < 337; j += 3) {
            
            
            if((strobeIndex2 % 5) == 0) {
                if((strobeIndex2 % 2) == 0) {
                    packageData[j] = colorNumber[0];                                                      
                    packageData[j + 1] = colorNumber[1];                                                 
                    packageData[j + 2] = colorNumber[2];    
                }
                else {
                    packageData[j] = 0x00;                                                      
                    packageData[j + 1] = 0x00;                                                 
                    packageData[j + 2] = 0x00; 
                };     
            };
        };
        
        strobeIndex2 += 1;
        
        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

var rainbowLinear = function(data) {
    
    var step = ((Math.PI / 2) / 112);
    var color = 0;
    
    
    // Outer loop, every LED strip
    for(i = 0; i < 15; i++) {                                               
        
        packageData = [];                                                                   // Empty the array     
        
        
        packageData[0] = i;
        
       // Vertical LED                                             
        for(j = 1; j < 337; j += 3) {
            
            var ledIndex = (j / 336) + linearIndex;
            
            color = (ledIndex + step);
            color = (color % 1);
            colorNumber = hslToRgb(color, 1, 0.5);
            
            packageData[j] = colorNumber[0];                                                      // R Value
            packageData[j + 1] = colorNumber[1];                                                  // G Value
            packageData[j + 2] = colorNumber[2];                                                  // B Value
        };
        

        linearIndex += 0.001;


        sendData(packageData);                                                              // Send the data
    };
};

/***********************************************************************************/

io.on('connection', function(socket) {
    console.log('Client connected');
    
    socket.on('playing', function(data) {
        effect1(data);
    });
    
    socket.on('playing2', function(data) {
        effect2(data);
    });
    
    socket.on('playing3', function(data) {
        effect3(data);
    });
    
    socket.on('playing4', function(data) {
        effect4(data);
    });
    
     socket.on('playing5', function(data) {
        effect5(data);
    });
    
    socket.on('playing6', function(data) {
        effect6(data);
    });
    
    socket.on('playing7', function(data) {
        effect7(data);
    });
    
    socket.on('rainbow', function() {
        rainbow();
    });
    
    socket.on('mlg', function(data) {
        mlgEffect(data);
    });
    
    socket.on('strobe', function() {
        strobe();
    });
    
    socket.on('white', function() {
        white();
    });
    
    socket.on('strobeColor', function(data) {
        strobeColor(data);
    });
    
    socket.on('rainbowLinear', function(data) {
        rainbowLinear(data);
    });
        
});

/***********************************************************************************/

server.listen(420, function() {
    console.log('Server up and running at port 420');
});