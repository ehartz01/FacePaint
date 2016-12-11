
/*
 * Global list of tools, indexed by (user-visible) tool name
 */
tools = {};

/*
 * Individual controls/widgets
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

class ColorControl {
    constructor (cx) {
    // Some browsers will provide a color picker, others default to text field
    var input = elt("input", {type: "color"});

    input.addEventListener("change", function() {
        cx.fillStyle = input.value;
        cx.strokeStyle = input.value;
    });

    this.elt = elt ("span", null, "Color: ", input); 
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
        });

        this.elt = elt("span", null, "Brush size: ", select); 
    }
}

class EraseButton {
    constructor (cx) {
        var erase = elt("button");

        erase.addEventListener("click", function() {
            console.log("wew");
            cx.clearRect(0, 0, canvas.width, canvas.height);
        });

        this.elt = elt("span", null, "Clear", erase);
    }

}

/*
 * Drawing modes (tools)
 */

/* Base class contains common routines, used by several subclasses */
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

    /*
     * Utility function: Convert from window-relative to element-relative position
     * event.clientX and element.getBoundingClientRect() are both relative to top-left of screen
     */
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
        cx.beginPath(); 
        cx.moveTo(pos.x, pos.y); 
        pos = Tool.relativePos(event, cx.canvas); 
        cx.lineTo(pos.x, pos.y); 
        cx.stroke(); 
    }, onEnd); 
   /* cx.lineCap = "round";
    var pos = Tool.relativePos(event, cx.canvas);
    this.trackDrag(function(event) {
        cx.beginPath();
        cx.arc(faceX, faceY, 1, 0, 2*Math.PI);
        cx.fillStyle = 'black';
        cx.fill();
        cx.closePath();
    });*/
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

class TextTool extends Tool {
    down (event, cx) {
        var text = prompt("Text:", "");
        if (text) {
            var pos = Tool.relativePos(event, cx.canvas);
            cx.font = Math.max(7, cx.lineWidth) + "px sans-serif";
            cx.fillText(text, pos.x, pos.y);
        }
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
        cx.fillRect(currentPos.x + offset.x,
                currentPos.y + offset.y, 1, 1);
        }
    }, 25);

    this.trackDrag (function(event) {
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


/*
 * Utility function: creates a new DOM element with specified name and
 * attributes and appends all further arguments it gets as child nodes,
 * automatically converting strings to text nodes.
 */
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
