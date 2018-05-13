/*
Just open the HTML file in browser: Tested on Safari, Chrome, Firefox in macOS.

HTML contains vertex and fragment shaders.
JS contains any other webGL scripts.
HTMLController.js contains options logic.
lib contains the utility script from Angel's example.

I wrote code based on the Angel's examples but almost everything is replaced or changed.
There is a utility function taken from StackOverflow
 */

// Canvas Resize to Whole Page
var c = document.getElementById("gl-canvas");
c.width = document.documentElement.clientWidth;
c.height = document.documentElement.clientHeight;

// Iteration Slider
var iterationSlider = document.getElementById("iterationSlider");
var currentIterationIndicator = document.getElementById("currentIterationIndicator");
currentIterationIndicator.innerHTML = iterationSlider.value;
iterationSlider.addEventListener("change", function () {
    currentIterationIndicator.innerHTML = iterationSlider.value;
    requestAnimFrame(render);
});

// Background Wire-frame vs Solid
var modeBG = document.getElementsByName('modeBG');
modeBG[0].addEventListener("change", function () {
    requestAnimFrame(render);
});
modeBG[1].addEventListener("change", function () {
    requestAnimFrame(render);
});

// Foreground Wire-frame vs Solid
var modeFG = document.getElementsByName('modeFG');
modeFG[0].addEventListener("change", function () {
    requestAnimFrame(render);
});
modeFG[1].addEventListener("change", function () {
    requestAnimFrame(render);
});

// Save as JSON Download
function save() {
    var data = {};

    data["cc"] = document.getElementById("cc").value;
    data["bgc"] = document.getElementById("bgc").value;
    data["fgc"] = document.getElementById("fgc").value;
    data["iterationSlider"] = document.getElementById("iterationSlider").value;
    data["modeBG"] = document.getElementsByName('modeBG')[0].checked;
    data["modeFG"] = document.getElementsByName('modeFG')[0].checked;
    data["bgVertices"] = bgVertices;

    window.open('data:application/octet-stream,' + encodeURIComponent(JSON.stringify(data)), 'SAVE')
}

// Load as local file read
function load(evt) {
    var file = evt.target.files[0];
    var fr = new FileReader();

    fr.onload = function (e) {
        var data = JSON.parse(e.target.result);
        console.log(data);
        bgVertices = data["bgVertices"];

        document.getElementById("cc").value = data["cc"];
        document.getElementById("bgc").value = data["bgc"];
        document.getElementById("fgc").value = data["fgc"];
        document.getElementById("iterationSlider").value = data["iterationSlider"];
        document.getElementsByName('modeBG')[0].checked = data["modeBG"];
        document.getElementsByName('modeBG')[1].checked = !data["modeBG"];
        document.getElementsByName('modeFG')[0].checked = data["modeFG"];
        document.getElementsByName('modeFG')[1].checked = !data["modeFG"];

        setBgColor();
        setFgColor();
        setCcColor();
        currentIterationIndicator.innerHTML = iterationSlider.value;

        requestAnimationFrame(render)
    };

    fr.readAsText(file);
}

document.getElementById('file').addEventListener('change', load, false);

// Option Toggle
function showOptions(button) {
    if (button.innerText === "Options") {
        button.innerText = "Done";
        document.getElementById("options").style.display = "inline";
    } else {
        button.innerText = "Options";
        document.getElementById("options").style.display = "none";
    }
}