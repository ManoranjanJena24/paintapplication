const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth - 60;
canvas.height = 400;

let context = canvas.getContext("2d");

let start_background_color = "white";
context.fillStyle = start_background_color;
context.fillRect(0, 0, canvas.width, canvas.height);

let draw_color = "black";
let draw_width = "2";
let is_drawing = false;
let is_eraser = false;

let restore_array = [];
let index = -1;

let undoStack = JSON.parse(localStorage.getItem('undoStack')) || [];
let redoStack = JSON.parse(localStorage.getItem('redoStack')) || [];

function updateLocalStorage() {
    localStorage.setItem('undoStack', JSON.stringify(undoStack));
    localStorage.setItem('redoStack', JSON.stringify(redoStack));
}

function change_color(element) {
    draw_color = element.style.background;
}

canvas.addEventListener("touchstart", start, false);
canvas.addEventListener("touchmove", draw, false);
canvas.addEventListener("mousedown", start, false);
canvas.addEventListener("mousemove", draw, false);

canvas.addEventListener("mouseup", stop, false);

// document.getElementById('redo').addEventListener('click', redo);

function start(event) {
    is_drawing = true;
    context.beginPath();
    
    const rect = canvas.getBoundingClientRect(); // Get canvas position relative to the viewport
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.moveTo(x, y);
    event.preventDefault();
}

function toggleErase() {
    is_eraser = !is_eraser;
    if (is_eraser) {
        draw_color = start_background_color;
        document.getElementById('eraseButton').textContent = 'Draw';
    } else {
        draw_color = "black";
        document.getElementById('eraseButton').textContent = 'Erase';
    }
}

function draw(event) {
    if (is_drawing) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        context.lineTo(x, y);
        context.strokeStyle = draw_color;
        context.lineWidth = draw_width;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
    }
    event.preventDefault();
}

function stop(event) {
    if (is_drawing) {
        context.stroke();
        context.closePath();
        is_drawing = false;
    }
    event.preventDefault();

    if (event.type != 'mouseout') {
        console.log("hiii");
        restore_array.push(context.getImageData(0, 0, canvas.width, canvas.height));
        index += 1;
    }

    undoStack.push(canvas.toDataURL());
    // updateLocalStorage();
}

function clear_canvas() {
    context.fillStyle = start_background_color;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillRect(0, 0, canvas.width, canvas.height);
    restore_array = [];
    index = -1;
}

function downloadCanvas() {
    let downloadLink = document.createElement('a');
    downloadLink.download = 'canvas_image.png';
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.click();
}

function saveToLocalStorage() {
    // let canvasData = canvas.toDataURL('image/png');
    // undoStack.push(canvasData);
    updateLocalStorage();
    alert("Canvas saved to localStorage.");
}



function undo() {
    if (undoStack.length > 0) {
        const lastState = undoStack.pop();
        redoStack.push(lastState);
        const img = new Image();
        img.src = undoStack[undoStack.length - 1];
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height); // Scale to canvas size
            // updateLocalStorage();
        };

       
    }
}


// function undo() {
//     if (undoStack.length > 0) {
//         const lastState = undoStack.pop();
//         redoStack.push(canvas.toDataURL());
//         const img = new Image();
//         img.src = lastState;
//         img.onload = () => {
//             context.clearRect(0, 0, canvas.width, canvas.height);
//             context.drawImage(img, 0, 0, canvas.width, canvas.height); // Scale to canvas size
//             updateLocalStorage();
//         };

       
//     }
// }


function redo() {
    // e.preventDefault()
    if (redoStack.length > 0) {
        const nextState = redoStack.pop();
     
        // undoStack.push(canvas.toDataURL());
        undoStack.push(nextState);
        const img = new Image();
        // img.src = nextState;
        img.src = nextState;
        // img.src = undoStack[undoStack.length-1];
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width, canvas.height); // Scale to canvas size
            // updateLocalStorage();
        };
    }
}

// Load canvas state from localStorage
function loadFromLocalStorage() {
    let savedData = JSON.parse(localStorage.getItem('undoStack'));
    if (savedData && savedData.length > 0) {
        const img = new Image();
        img.src = savedData[savedData.length - 1];  // Load the last saved state
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas before drawing
            context.drawImage(img, 0, 0, canvas.width, canvas.height);  // Scale to canvas size
            alert("Canvas loaded from localStorage.");
        };
    } else {
        alert("No saved data found in localStorage.");
    }
}
