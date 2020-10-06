let canvas = document.querySelector("#square");
let context = canvas.getContext("2d");
let amber = "#f80";
let black = "black";

function draw_square(x, y, color, context) {
  context.fillStyle = color;
  context.fillRect(10*x, 10*y, 10, 10);
}

let field = new Array(42*42);

function init_array(f) {
  // top and bottom border
  for (i = 0; i < 42; i++) {
    set_point(f, i, 0);
    set_point(f, i, 41);
  }
  // left and right border
  for (i = 1; i < 41; i++) {
    set_point(f, 0, i);
    set_point(f, 41, i);
  }
  // fill in middle
  for (i = 1; i < 41; i++) {
    for (j = 1; j < 41; j++) {
      reset_point(f, i, j);
    }
  }
}

function set_point(f, x, y) {
  f[42*x + y] = true;
}

function reset_point(f, x, y) {
  f[42*x + y] = false;
}

function point_set(f, x, y) {
  return f[42*x + y];
}

function draw_array(f, context) {
  for (i = 0; i < 42; i++) {
    for (j = 0; j < 42; j++) {
      if (point_set(f, i, j)) {
        draw_square(i, j, amber, context);
      }
      else {
        draw_square(i, j, black, context);
      }
    }
  }
}

init_array(field);

draw_array(field, context);

//context.fillStyle = "black";
//context.fillRect(0, 0, 335, 335);
//context.fillStyle = "#f80";
//context.fillRect(10,10,20,20);

//draw_square(20, 20, context);
