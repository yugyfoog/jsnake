// flow of control
//
//  before game:
//
//     html load:
//         play_game() -- initialize game and set key press callback to start_game()
//             init_array()
//                 set_point()
//                 reset_point()
//             fetch_high_scores()
//                 display_high_scores()
//
//     key event:
//         start_game() -- starts game. Set key press callback to game_key(), timer callback to on_clock()
//             init_array()
//                 set_point()
//                 reset_point()
//             display_score()
//             set_snake_head()
//                 set_point()
//
//  in game:
//
//     key event:
//         game_key() -- set snake_direction to key pressed
//
//     timer event:
//         on_clock() -- main game logic. calls end_game() when game over.
//             end_game() -- set timer callback to flash_screen()
//             update_score()
//                 display_score()
//             set_egg()
//                 point_set()
//                 set_point()
//             clear_egg()
//                 reset_point()
//             set_snake_head()
//                 set_point()
//             clear_snake_tail()
//                 reset_point()
//             point_set()
//             display_score()
//             draw_array()
//                 point_set()
//                 draw_square()
//
//
//  game over:
//
//     timer event:
//         flash_screen() -- inverts screen color. calls check_score() after 12 times. (6 inversion cycles)
//             draw_array()
//                 point_set()
//                 draw_square()
//             draw_array_inverse()
//                 point_set()
//                 draw_square()
//             check_score() -- check to see if we need to input name, if so set callback to update_high_scores
//                 fetch_high_scores()
//                     display_high_scores()
//                 between_games()
//
//
//     input change event:
//         update_high_scores() -- change score list, call between_games()
//             fetch_high_scores();
//                 display_high_scores()
//             between_games()
//


let black = "black";
let amber = "#f80";

let score = 0;

let flash_count = 13;

let field = Array(42*42); // array of bool

let high_scores;

let canvas = document.querySelector("#square");
let context = canvas.getContext("2d");

const direction = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

let snake_direction = direction.DOWN;

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  near(p) {
    return (this.x-p.x)*(this.x-p.x) + (this.y-p.y)*(this.y-p.y) < 3;
  }

  indx() {
    return 42*this.x + this.y;
  }
}

let snake = Array(1600); // array of Point
let snake_head = 0;
let snake_tail = 0;
let snake_grow = 0;

let egg_on = false;
let egg_timer = 0;
let egg_position = new Point(0,0);
let score_timer = 10;

let timer = {};

function draw_square(x, y, color) {
  context.fillStyle = color;
  context.fillRect(10*x, 10*y, 10, 10);
}

function init_array() {
  // left and right border
  for (let i = 0; i < 42; i++) {
    set_point(new Point(0, i));
    set_point(new Point(41, i));
  }
  // top and bottom
  for (let i = 1; i < 41; i++) {
    set_point(new Point(i, 0));
    set_point(new Point(i, 41));
  }
  // fill in middle
  for (let i = 1; i < 41; i++) {
    for (let j = 1; j < 41; j++) {
      reset_point(new Point(i, j));
    }
  }
}

function set_point(p) {
  field[p.indx()] = true;
}

function reset_point(p) {
  field[p.indx()] = false;
}

function point_set(p) {
  if (p.x < 0 || p.y < 0 || p.x >= 42 || p.y >= 42)
    return true;
  return field[p.indx()];
}

function display_score() {
  let score_text = document.getElementById("score");
  score_text.textContent = `Score: ${score}`;
}

function draw_array() {
  for (let i = 0; i < 42; i++) {
    for (let j = 0; j < 42; j++) {
      if (point_set(new Point(i, j))) {
        draw_square(i, j, amber);
      }
      else {
        draw_square(i, j, black);
      }
    }
  }
}

function draw_array_inverse() {
  for (let i = 0; i < 42; i++) {
    for (let j = 0; j < 42; j++) {
      if (point_set(new Point(i, j))) {
        draw_square(i, j, black);
      }
      else {
        draw_square(i, j, amber);
      }
    }
  }
}

function flash_screen() {
  flash_count -= 1;
  if (flash_count <= 0) {
    clearInterval(timer);
    check_score();
  }
  else {
    if (flash_count%2 == 0) {
      draw_array_inverse()
    }
    else {
      draw_array();
    }
  }
}

function end_game() {
    clearInterval(timer);
    document.removeEventListener("keydown", game_key);
    flash_count = 13;
    timer = setInterval(flash_screen, 100);
}

function update_score() {
  let score_delta = snake_head - snake_tail;
  if (score_delta < 0)
    score_delta += 1600;
  score += 10*score_delta;
  display_score();
}

function set_egg() {
  let x = Math.floor(38*Math.random()) + 2;
  let y = Math.floor(38*Math.random()) + 2;
  if (point_set(new Point(x-1, y-1))
      || point_set(new Point(x-1, y))
      || point_set(new Point(x-1, y+1))
      || point_set(new Point(x, y+1))
      || point_set(new Point(x+1, y+1))
      || point_set(new Point(x+1, y))
      || point_set(new Point(x+1, y-1))
      || point_set(new Point(x, y-1)))
    egg_timer = 1;
  else {
    set_point(new Point(x-1, y-1));
    set_point(new Point(x-1, y));
    set_point(new Point(x-1, y+1));
    set_point(new Point(x, y+1));
    set_point(new Point(x+1, y+1));
    set_point(new Point(x+1, y));
    set_point(new Point(x+1, y-1));
    set_point(new Point(x, y-1));
    egg_on = true;
    egg_timer = 20;
    egg_position = new Point(x, y);
  }
}

function clear_egg() {
  let x = egg_position.x;
  let y = egg_position.y;
  reset_point(new Point(x-1, y-1));
  reset_point(new Point(x-1, y));
  reset_point(new Point(x-1, y+1));
  reset_point(new Point(x, y+1));
  reset_point(new Point(x+1, y+1));
  reset_point(new Point(x+1, y));
  reset_point(new Point(x+1, y-1));
  reset_point(new Point(x, y-1));
  egg_on = false;
  egg_timer = 20;
}

function on_clock() {
  let x = snake[snake_head].x;
  let y = snake[snake_head].y;
  switch (snake_direction) {
  case direction.UP:
    y -= 1;
    break;
  case direction.DOWN:
    y += 1;
    break;
  case direction.LEFT:
    x -= 1;
    break;
  case direction.RIGHT:
    x += 1;
    break;
  }
  if (point_set(new Point(x, y))) {
    if (egg_on && egg_position.near(new Point(x, y))) {
      update_score();
      clear_egg();
      snake_grow += 5
    }
    else {
      end_game();
      return;
    }
  }
  score_timer -= 1;
  if (score_timer <= 0) {
    score -= 10;
    if (score < 0) {
      score = 0;
    }
    score_timer = 10;
    display_score();
  }
  snake_head = (snake_head+1)%1600;
  set_snake_head(new Point(x, y));
    if (snake_grow <= 0) {
    let x = snake[snake_tail].x;
    let y = snake[snake_tail].y;
    clear_snake_tail();
    snake_tail = (snake_tail+1)%1600;
  }
  else {
    snake_grow -= 1;
  }
  egg_timer -= 1;
  if (egg_timer <= 0) {
    if (egg_on) {
      clear_egg();
    }
    else {
      set_egg();
    }
  }
  draw_array();
}

function set_snake_head(p) {
  snake[snake_head] = p;
  set_point(p);
}

function clear_snake_tail() {
  reset_point(snake[snake_tail]);
}

function game_key(event) {
  switch (event.code) {
  case "ArrowDown":
  case "KeyS":
    snake_direction = direction.DOWN;
    break;
  case "ArrowUp":
  case "KeyW":
    snake_direction = direction.UP;
    break;
  case "ArrowLeft":
  case "KeyA":
    snake_direction = direction.LEFT;
    break;
  case "ArrowRight":
  case "KeyD":
    snake_direction = direction.RIGHT;
    break;
  }
}

function start_game(e) {
    document.removeEventListener("keydown", start_game);
    document.addEventListener("keydown", game_key);
    let message = document.getElementById("message");
    message.textContent = "";
    init_array();
    score = 0;
    display_score();
    snake_head = 0;
    snake_tail = 0;
    snake_direction = direction.DOWN;
    snake_grow = 5;
    egg_on = false;
    egg_timer = 20;
    let p = new Point(20, 20);
    set_snake_head(p);
    timer = setInterval(on_clock, 100);
}

function update_high_scores(e) {
    let name = e.target.value;

    if (name.search(/^[ 0-9A-Za-z]{1,17}$/) === -1)
	return;
    let input = document.getElementById("input");
    while (input.firstChild)
	input.removeChild(input.firstChild);
    fetch_high_scores(name, score);
    between_games();
}

function check_score() {
    if (score > high_scores[high_scores.length-1].score) {
	let message = document.getElementById("message");
	message.textContent = "Enter your name";
	let input = document.getElementById("input");
	let name = document.createElement("input");
	name.addEventListener("change", update_high_scores);
	input.appendChild(name);
	name.focus();
    }
    else {
	fetch_high_scores("", 0);
	between_games();
    }
}

function between_games() {
    let message = document.getElementById("message");
    message.textContent = "Press a key to play again";
    document.addEventListener("keydown", start_game);
}

function display_high_scores() {
    let element = document.getElementById("highscores");

    // remove old high scores

    while (element.firstChild)
	element.removeChild(element.firstChild);

    // write new high scores
    
    for (let i = 0; i < high_scores.length; i++) {
	let div = document.createElement('div');
	div.textContent = `${i+1} ${high_scores[i].name} ${high_scores[i].score}`;
	element.appendChild(div);
    }
}

function hash(name, score) {
    let h = 0;
    for (let i = 0; i < name.length; i++)
	h = ((h<<4)^(h>>4)^name[i].value) % 32771;
    return h^score;
}

function fetch_high_scores(name, score) {
    let h = hash(name, score);
    fetch(`scores.json?name=${name}&score=${score}&hash=${h}`)
	.then(response => response.json())
	.then(data => {
	    high_scores = data;
	    display_high_scores();});
}

function play_game() {
    init_array();
    draw_array();

    fetch_high_scores("", 0);

    let message = document.getElementById("message");
    message.textContent = "Press a key to play Snake!"
    document.addEventListener("keydown", start_game);
}

play_game();
