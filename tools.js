
tools = {};
var pointerSize = 2;


function getPointerSize() {
    return pointerSize;
}

/*
 * Buttons
 */

class ToolControl { 
    constructor (cx) { 
    var select = elt("select");
    for (var toolname in tools)
        select.appendChild (elt ("option", null, toolname));

    cx.canvas.addEventListener ("mousedown", function(event) { 
        if (event.which == 1) { 
        tools[select.value].down (event, cx); 
        event.preventDefault(); 
        }
    });

        this.elt = elt ("span", null, "Tool: ", select); 
    }
}

function generateColor(cx) {
    if(emote == "anger") {
        cx.fillStyle = "Red";
        cx.strokeStyle = "Red";
        //return "Red"
    }

    else if(emote == "contempt") {
        cx.fillStyle = "Purple";
        cx.strokeStyle = "Purple";
        //return "Purple"       
    }

    else if(emote == "disgust") {
        cx.fillStyle = "Green";
        cx.strokeStyle = "Green";        
        //return "Green"
    }

    else if(emote == "fear") {
        cx.fillStyle = "Black";
        cx.strokeStyle = "Black";        
        //return "Black"
    }

    else if(emote == "joy") {
        cx.fillStyle = "Yellow";
        cx.strokeStyle = "Yellow";    
        //return "Yellow"    
    }

    else if(emote == "sadness") {
        cx.fillStyle = "Blue";
        cx.strokeStyle = "Blue";       
        //return "Blue"
    }

    else if(emote == "surprise") {
        cx.fillStyle = "Orange";
        cx.strokeStyle = "Orange";   
        //return "Orange"    
    }
}

class BrushControl {
    constructor (cx) {

        var select = elt("select");
        var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
        sizes.forEach (function(size) {
            select.appendChild (elt("option", {value: size},
                               size + " pixels"));
        });

        select.addEventListener("change", function() {
            cx.lineWidth = select.value;
            pointerSize = select.value;
        });

        this.elt = elt("span", null, "Brush size: ", select); 
    }
}

class EraseButton {
    constructor (cx) {
        var erase = elt("button", {id: "clearButton"});
        erase.addEventListener("click", function() {
            cx.clearRect(0, 0, canvas.width, canvas.height);
        });

        this.elt = elt("span", null, "  ", erase);
    }

}

/* Pointer tools */

class Tool {
    trackDrag(onMove, onEnd) { 
    addEventListener("mousemove", onMove); 
    addEventListener("mouseup", end); 

    function end(event) { 
        removeEventListener("mousemove", onMove); 
        removeEventListener("mouseup", end); 
        if (onEnd) onEnd(event); 
    }
    }

    static relativePos(event, element) {
    var rect = element.getBoundingClientRect();
    return {x: Math.floor(getX()),
        y: Math.floor(getY())};
    }
}

class LineTool extends Tool { 
        down (event, cx, onEnd) {    
        cx.lineCap = "round";

        var pos = Tool.relativePos (event, cx.canvas);
        this.trackDrag(function(event) { 
            generateColor(cx);
            //cx.fillStyle = generateColor(cx);
            //cx.strokeStyle = generateColor(cx);
            cx.beginPath(); 
            cx.moveTo(pos.x, pos.y); 
            pos = Tool.relativePos(event, cx.canvas); 
            cx.lineTo(pos.x, pos.y); 
            cx.stroke(); 
        }, onEnd); 
    }
}

class EraseTool extends Tool {
    down (event, cx) { 
        cx.globalCompositeOperation = "destination-out"; 
        tools.Line.down (event, cx, function() { 
            cx.globalCompositeOperation = "source-over"; 
        });
    }
}


class SprayTool extends Tool {
    down (event, cx) {
        var radius = cx.lineWidth / 2;
        var area = radius * radius * Math.PI;
        var dotsPerTick = Math.ceil(area / 30);

        var currentPos = Tool.relativePos(event, cx.canvas);
        var spray = setInterval(function() {
            for (var i = 0; i < dotsPerTick; i++) {
            var offset = SprayTool.randomPointInRadius(radius);
            generateColor(cx);
            cx.fillRect(currentPos.x + offset.x,
                    currentPos.y + offset.y, 1, 1);
            }
        }, 25);

        this.trackDrag (function(event) {
            generateColor(cx);
            currentPos = Tool.relativePos(event, cx.canvas);
        }, function() {
            clearInterval(spray);
        });
    }

    static randomPointInRadius (radius) {
        while (true) { 
            var x = Math.random() * 2 - 1; 
            var y = Math.random() * 2 - 1; 
            if (x * x + y * y <= 1) 
                return {x: x * radius, y: y * radius}; 
        }
    }
}

function elt(name, attributes) { 
  var node = document.createElement(name); 
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node; 
}
