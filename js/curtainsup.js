/**
 * TODOs:
 * – Stage pictures
 * – Applause sound?
 */

var basePixelSize = 20;
var columns = 25;
var rows = 20;
var level = 1;
var minimumBlockCount = 3;

var borderSize = basePixelSize * 1.5;
var gameAreaWidth = columns * basePixelSize;
var gameAreaHeight = rows * basePixelSize;
var canvasWidth = 2 * borderSize + gameAreaWidth;
var canvasHeight = 2 * borderSize + gameAreaHeight;
var textSizeSmall = basePixelSize * 0.6;
var textSizeBig = basePixelSize * 0.8;

var colors = [
  '#9C27B0',
  '#4CAF50',
  '#FF9800',
  '#3F51B5',
  '#FF5722',
  '#795548',
  '#F44336',
  '#FFEB3B',
  '#E91E63'//hintcolor
];
var accents = [
  '#4A148C',
  '#1B5E20',
  '#E65100',
  '#1A237E',
  '#BF360C',
  '#3E2723',
  '#B71C1C',
  '#F57F17',
  '#101010'//hintaccent
];

var curtain;

var score;
var scores = [];
var hint;
var hintOriginalColorIndex;
var gameOver = false;
var gameWon = false;

var undoStack = [];

/**
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 *  SETUP RESTART INITIALIZE SETUP RESTART INITIALIZE SETUP RESTART INITIALIZE
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 */

function setup() {
  var canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas');
  resizeLightContainer();
  noLoop();
  restart();
}

function restart() {
  curtain = initializeCurtain(rows, columns, Math.min(level, colors.length - 1));
  score = 0;
  gameOver = false;
  gameWon = false;
  determineGameOver();
  redraw();
}

function initializeCurtain(rowCount, columnCount, colorCount) {
  var curtain = [];
  for (var col = 0; col < columnCount; col++) {
    curtain[col] = [];
    for (var row = 0; row < rowCount; row++) {
      curtain[col][row] = Math.floor(Math.random() * colorCount);
    }
  }
  return curtain;
}

/**
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 *  DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW DRAW
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 */

function draw() {
  clear();
  drawBorders();
  drawCurtain(curtain, colors);
  drawLevel(level);
  drawScore(score);
  drawScores(scores);
  if (gameWon) {
    drawMessage('Congratulations, curtains up!', 'Click to go to act ' + (level + 1) + '.');
  } else if (gameOver) {
    drawMessage('Oh no, curtains stuck!', 'Shuffle, undo or restart to try again.');
  }
}

function drawBorders() {
  fill(color('#9E9E9E'));
  noStroke();
  rect(0, 0, canvasWidth, borderSize);
  rect(0, canvasHeight - borderSize, canvasWidth, borderSize);
  rect(0, borderSize, borderSize, gameAreaHeight);
  rect(canvasWidth - borderSize, borderSize, borderSize, gameAreaHeight);
}

function drawCurtain(curtain, colors) {
  noStroke();
  curtain.forEach(function (column, cIndex) {
    column.forEach(function (row, rIndex) {
      drawBlock(cIndex, rIndex, row)
    }, this);
  }, this);
}

function drawBlock(column, row, colorIndex) {
  fill(colors[colorIndex]);
  rect(borderSize + column * basePixelSize, borderSize + row * basePixelSize, basePixelSize, basePixelSize);
  fill(accents[colorIndex]);
  rect(borderSize + column * basePixelSize + 6, borderSize + row * basePixelSize, basePixelSize - 12, basePixelSize);
}

function drawLevel(level) {
  fill(255);
  textSize(textSizeSmall);
  textAlign(LEFT, CENTER);
  text('Act: ' + level, borderSize, borderSize / 2);
}

function drawScore(score) {
  fill(255);
  textSize(textSizeSmall);
  textAlign(RIGHT, CENTER);
  text('Applause: ' + score.toLocaleString(), canvasWidth - borderSize, borderSize / 2);
}

function drawScores(scores) {
  fill(255);
  textSize(textSizeSmall);
  textAlign(LEFT, CENTER);
  var scoreTexts = [];
  scores.forEach(function (score, level) {
    scoreTexts[level - 1] = score.toLocaleString() + ' (' + level + ')';
  }, this);

  if (scoreTexts.length !== 0) {
    var scoreText = 'Applause (act): ' + scoreTexts.join(' | ');
    text(scoreText, borderSize, canvasHeight - borderSize / 2);
  }
}

function drawMessage(message, hint) {
  textSize(textSizeBig);
  textAlign(CENTER, CENTER);
  var w = Math.max(textWidth(message), textWidth(hint)) + borderSize;

  fill('rgba(100,100,100, 0.8)');
  noStroke();
  rect((canvasWidth - w) / 2, canvasHeight / 2 - 2 * basePixelSize, w, 4 * basePixelSize);

  fill(255);
  text(message, canvasWidth / 2, canvasHeight / 2 - basePixelSize);
  text(hint, canvasWidth / 2, canvasHeight / 2 + basePixelSize);
}

/**
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 *   GAMEPLAY MOUSEEVENTS KEYBOARDEVENTS GAMEPLAY MOUSEEVENTS KEYBOARDEVENTS
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 */

function mouseClicked() {
  if (gameWon) {
    level++;
    restart();
    undoStack = [];
  } else if (!gameOver) {
    var column = Math.floor((mouseX - borderSize) / basePixelSize);
    var row = Math.floor((mouseY - borderSize) / basePixelSize);

    if (row >= 0 && column >= 0 && row < rows && column < columns) {
      handleClick(column, row);
    }
  }
  return false;
}

function keyPressed() {
  if (keyCode === 72) {
    markHint();
  }
  if (keyCode === 82) {
    restart();
  }
  if (keyCode === 83) {
    shuffleCurtain();
  }
  if (keyCode === 85) {
    undo();
  }
}

function handleClick(column, row) {
  resetHint();
  if (curtain[column] !== undefined) {
    var color = curtain[column][row];
    addToUndoStack(curtain, score);
    var count = markAdjacent(column, row, color);
    if (count >= minimumBlockCount) {
      addToScore(count)
      clearMarked();
      determineGameOver();
      redraw();
    } else {
      undoStack.pop();
      resetMarked(color);
    }
  }
}

function markAdjacent(column, row, color) {
  if (color === -1 || color === undefined) {
    return 0;
  }

  curtain[column][row] = -1;
  var count = 1;

  if (column - 1 >= 0 && curtain[column - 1][row] === color) {
    count += markAdjacent(column - 1, row, color);
  }
  if (column + 1 < curtain.length && curtain[column + 1][row] === color) {
    count += markAdjacent(column + 1, row, color);
  }
  if (row - 1 >= 0 && curtain[column][row - 1] === color) {
    count += markAdjacent(column, row - 1, color);
  }
  if (row + 1 < curtain[column].length && curtain[column][row + 1] === color) {
    count += markAdjacent(column, row + 1, color);
  }
  return count;
}

function addToScore(count) {
  score += level * Math.pow(count, 2);
}

function clearMarked() {
  for (var col = curtain.length - 1; col >= 0; col--) {
    var emptyColumn = true;
    for (var row = curtain[col].length - 1; row >= 0; row--) {
      if (curtain[col][row] === -1) {
        curtain[col].splice(row, 1);
      } else {
        emptyColumn = false;
      }
    }
    if (emptyColumn) {
      curtain.splice(col, 1);
    }
  }
}

function resetMarked(color, current = -1) {
  hint = [];
  hintOriginalColorIndex = color;
  var markedBlocksExist = false;
  for (var col = 0; col < curtain.length; col++) {
    for (var row = 0; row < curtain[col].length; row++) {
      if (curtain[col][row] === current) {
        hint.push([col, row]);
        curtain[col][row] = color;
        markedBlocksExist = true;
      }
    }
  }
  return markedBlocksExist;
}

function determineGameOver() {
  if (curtain.length === 0) {
    gameWon = true;
    scores[level] = score;
  }
  for (var col = 0; col < curtain.length; col++) {
    for (var row = 0; row < curtain[col].length; row++) {
      var color = curtain[col][row];
      var count = markAdjacent(col, row, color);
      if (count >= minimumBlockCount) {
        resetMarked(color);
        gameOver = false;
        return;
      }
      resetMarked(color);
    }
  }
  gameOver = true;
}

function markHint() {
  if (hint.length >= minimumBlockCount) {
    noStroke();
    addToUndoStack(curtain, score);
    hint.forEach(function (element) {
      curtain[element[0]][element[1]] = colors.length - 1;
    }, this);
    score = Math.max(score - 10 * level, 0);
    redraw();
  }
}

function resetHint() {
  if(resetMarked(hintOriginalColorIndex, colors.length - 1)){
    undoStack.pop();
  }
}

function shuffleCurtain() {
  resetHint();
  addToUndoStack(curtain, score);
  var count = 0;
  for (var index = 0; index < curtain.length; index++) {
    count += curtain[index].length;
    curtain[index].reverse();
  }
  curtain.reverse();
  score = Math.floor(score * (1 - count / (columns * rows)));
  determineGameOver();
  redraw();
}

function undo() {
  var last = undoStack.pop();
  if (last) {
    curtain = last.curtain;
    score = last.score;
    determineGameOver();
    redraw();
  }
}

function addToUndoStack(curtain, score) {
  var copy = [];
  for (var i = 0; i < curtain.length; i++) {
    copy.push(curtain[i].slice(0));
  }

  var last = {
    curtain: copy,
    score: Math.max(score - 10 * level, 0)
  };

  undoStack.push(last);
}

/**
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 *      BUTTONEVENTS BUTTONEVENTS BUTTONEVENTS BUTTONEVENTS BUTTONEVENTS
 * //\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\
 * \\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//\\//
 */

function hintButtonPressed() {
  markHint();
}

function shuffleButtonPressed() {
  shuffleCurtain();
}

function undoButtonPressed() {
  undo();
}

function restartButtonPressed() {
  restart();
}

document.addEventListener('mousemove', function (e) {
  var light = document.getElementById('light');
  light.style.left = e.pageX - 100 + 'px';
  light.style.top = e.pageY - 100 + 'px';
});

window.addEventListener('resize', resizeLightContainer);

function resizeLightContainer() {
  var container = document.getElementById('lightContainer');
  container.style.height = '0px';
  container.style.height = document.body.scrollHeight + 'px';
}
