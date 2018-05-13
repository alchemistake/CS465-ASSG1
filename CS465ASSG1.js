/*
Just open the HTML file in browser: Tested on Safari, Chrome, Firefox in macOS.

HTML contains vertex and fragment shaders.
JS contains any other webGL scripts.
HTMLController.js contains options logic.
lib contains the utility script from Angel's example.

I wrote code based on the Angel's examples but almost everything is replaced or changed.
There is a utility function taken from StackOverflow
 */

// WebGL variables
var gl;
var program;
var bgBuffer, bgColorBuffer;
var fgBuffer, fgColorBuffer;

// HTML Element Handles
var ccPicker, bgcPicker, fgcPicker;
var canvas;
var iterationPicker;
var modeBG, modeFG;

// Colors
var fgc, bgc, cc;
var bgColors;
var fgColors;

// Vertices
var bgVertices = [
    vec2(-0.2, -0.2),
    vec2(-0.2, 0.2),
    vec2(0.2, 0.2),
    vec2(0.2, -0.2)
];
var fgVertices = [];
var startPoint;

// WebGL Utility Functions
// Taken from StackOverflow
function hex2rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255.0,
        g: parseInt(result[2], 16) / 255.0,
        b: parseInt(result[3], 16) / 255.0
    } : null;
}

// Set Background Color
function setBgColor() {
    bgc = hex2rgb(bgcPicker.value);
    bgColors = [vec4(bgc.r, bgc.g, bgc.b, 1.),
        vec4(bgc.r, bgc.g, bgc.b, 1.),
        vec4(bgc.r, bgc.g, bgc.b, 1.),
        vec4(bgc.r, bgc.g, bgc.b, 1.)
    ];
}

// Set Foreground Color
function setFgColor() {
    fgc = hex2rgb(fgcPicker.value);
    generateFgColors();
}

// Set Canvas Color
function setCcColor() {
    cc = hex2rgb(ccPicker.value);
    gl.clearColor(cc.r, cc.g, cc.b, 1.0);
}

// Generate a color array for foreground vertices
// Adds foreground color to an array until the length is same as fgVertives
function generateFgColors() {
    var len = fgVertices.length;
    fgColors = [];
    for (var i = 0; i < len; i++) {
        fgColors.push(vec4(fgc.r, fgc.g, fgc.b, 1.))
    }
}

// Mouse Click Parser
function pointOnCanvas(event) {
    var x = event.x;
    var y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    x = -1 + 2 * x / canvas.width;
    y = 1 + -2 * y / canvas.height;
    return vec2(x, y);
}

// Generates rectangle from 2 points
function generateRectangle(startPoint, endPoint) {
    var rectangle = [];
    rectangle.push(startPoint);
    rectangle.push(vec2(endPoint[0], startPoint[1]));
    rectangle.push(endPoint);
    rectangle.push(vec2(startPoint[0], endPoint[1]));
    return rectangle;
}

// Generates rectangle from mouse event
function generateRectangleFromEvent(event) {
    bgVertices = [];
    bgVertices.push(startPoint);

    var endPoint = pointOnCanvas(event);
    bgVertices.push(vec2(endPoint[0], bgVertices[0][1]));
    bgVertices.push(endPoint);
    bgVertices.push(vec2(bgVertices[0][0], endPoint[1]));
}

// Fractal recursive call function
function generateFractal(startPoint, endPoint, remainingIteration) {
    if (remainingIteration <= 0)
        return;

    var topLeftVertex = mix(startPoint, endPoint, 0.3333);
    var bottomRightVertex = mix(startPoint, endPoint, 0.6666);
    var subRectangle = generateRectangle(topLeftVertex, bottomRightVertex);
    subRectangle.forEach(function (vertex) {
        fgVertices.push(vertex)
    });

    remainingIteration -= 1;

    generateFractal(startPoint, topLeftVertex, remainingIteration);
    generateFractal(endPoint, bottomRightVertex, remainingIteration);

    generateFractal(vec2(topLeftVertex[0], startPoint[1]), subRectangle[1], remainingIteration);
    generateFractal(vec2(bottomRightVertex[0], endPoint[1]), subRectangle[3], remainingIteration);

    generateFractal(vec2(startPoint[0], topLeftVertex[1]), vec2(topLeftVertex[0], bottomRightVertex[1]), remainingIteration);
    generateFractal(vec2(endPoint[0], bottomRightVertex[1]), vec2(bottomRightVertex[0], topLeftVertex[1]), remainingIteration);

    generateFractal(vec2(bottomRightVertex[0], startPoint[1]), vec2(endPoint[0], topLeftVertex[1]), remainingIteration);
    generateFractal(vec2(topLeftVertex[0], endPoint[1]), vec2(startPoint[0], bottomRightVertex[1]), remainingIteration);
}

// WebGL Functions
window.onload = function init() {
    ccPicker = document.getElementById("cc");
    bgcPicker = document.getElementById("bgc");
    fgcPicker = document.getElementById("fgc");
    canvas = document.getElementById("gl-canvas");
    iterationPicker = document.getElementById("iterationSlider");

    // Area selection Preview
    var preview = function (event) {
        generateRectangleFromEvent(event);
        requestAnimFrame(renderBG);
    };

    // Area selected logic
    var finish = function (event) {
        if (startPoint) {
            canvas.removeEventListener("mousemove", preview);
            generateRectangleFromEvent(event);

            startPoint = null;
            requestAnimFrame(render);
        }
    };

    // Area selection start event
    canvas.addEventListener("mousedown", function (event) {
        bgVertices = [];
        startPoint = pointOnCanvas(event);
        bgVertices.push(startPoint);
        canvas.addEventListener("mousemove", preview)
    });

    // Area selection ended event
    canvas.addEventListener("mouseup", finish);
    canvas.addEventListener("mouseleave", finish);

    // GL Setup
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    // Canvas Color Picker Logic
    ccPicker.addEventListener("change", function () {
        setCcColor();
        requestAnimFrame(render);
    });

    // BG Color Picker Logic
    bgcPicker.addEventListener("change", function () {
        setBgColor();
        gl.bindBuffer(gl.ARRAY_BUFFER, bgColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(bgColors), gl.STATIC_DRAW);
        requestAnimFrame(render);
    });

    // FG Color Picker Logic
    fgcPicker.addEventListener("change", function () {
        setFgColor();
        gl.bindBuffer(gl.ARRAY_BUFFER, fgColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(fgColors), gl.STATIC_DRAW);
        requestAnimFrame(render);
    });

    // Initial settings
    setCcColor();
    setBgColor();
    setFgColor();
    gl.viewport(0, 0, canvas.width, canvas.height);

    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffers
    bgBuffer = gl.createBuffer();
    bgColorBuffer = gl.createBuffer();

    fgBuffer = gl.createBuffer();
    fgColorBuffer = gl.createBuffer();

    requestAnimFrame(render);
};

function render() {
    // Wire-frame vs Solid
    modeBG = document.getElementsByName('modeBG')[0].checked;
    modeFG = document.getElementsByName('modeFG')[0].checked;

    renderBG();
    renderFG();
}

function renderBG() {
    // Bind Background Vertex Buffer and pass the rectangle to it
    gl.bindBuffer(gl.ARRAY_BUFFER, bgBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bgVertices), gl.STATIC_DRAW);


    // Set vPosition for BG
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Bind Background Color Buffer and pass the rectangle to it
    gl.bindBuffer(gl.ARRAY_BUFFER, bgColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(bgColors), gl.STATIC_DRAW);

    // Set color for BG
    var color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

    // Clearing the canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw based on mode
    if (modeBG)
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    else
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

function renderFG() {
    // Clear fgVertices
    fgVertices = [];

    // Fill the foreground vertices and colors
    generateFractal(bgVertices[0], bgVertices[2], parseInt(iterationPicker.value));
    generateFgColors();

    // Bind Foreground Vertex Buffer and pass the vertices to it
    gl.bindBuffer(gl.ARRAY_BUFFER, fgBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fgVertices), gl.STATIC_DRAW);

    // Set vPosition for FG
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Bind Foreground Collor Buffer and pass the vertices to it
    gl.bindBuffer(gl.ARRAY_BUFFER, fgColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(fgColors), gl.STATIC_DRAW);

    // Set color for FG
    var color = gl.getAttribLocation(program, "color");
    gl.vertexAttribPointer(color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

    // Draw based on mode
    for (var i = 0; i < fgVertices.length; i += 4)
        if (modeFG)
            gl.drawArrays(gl.LINE_LOOP, i, 4);
        else
            gl.drawArrays(gl.TRIANGLE_FAN, i, 4);
}
