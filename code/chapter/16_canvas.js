var results = [
  {name: "Satisfied", count: 1043, color: "lightblue"},
  {name: "Neutral", count: 563, color: "lightgreen"},
  {name: "Unsatisfied", count: 510, color: "pink"},
  {name: "No comment", count: 175, color: "silver"}
];

function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

function CanvasDisplay(parent, level) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = Math.min(600, level.width * scale);
  this.canvas.height = Math.min(450, level.height * scale);
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");

  this.level = level;
  this.animationTime = 0;
  this.flipPlayer = false;

  this.viewport = {
    left: 0,
    top: 0,
    width: this.canvas.width / scale,
    height: this.canvas.height / scale
  };

  this.drawFrame(0);
}

CanvasDisplay.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
};

CanvasDisplay.prototype.drawFrame = function(step) {
  this.animationTime += step;

  this.updateViewport();
  this.clearDisplay();
  this.drawBackground();
  this.drawActors();
  this.drawLifeandScore();
  this.drawTime();
  this.drawLife();
};

CanvasDisplay.prototype.updateViewport = function() {
  var view = this.viewport, margin = view.width / 3;
  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5));

  if (center.x < view.left + margin)
    view.left = Math.max(center.x - margin, 0);
  else if (center.x > view.left + view.width - margin)
    view.left = Math.min(center.x + margin - view.width,
                         this.level.width - view.width);
  if (center.y < view.top + margin)
    view.top = Math.max(center.y - margin, 0);
  else if (center.y > view.top + view.height - margin)
    view.top = Math.min(center.y + margin - view.height,
                        this.level.height - view.height);
};

CanvasDisplay.prototype.clearDisplay = function() {
  if (this.level.status == "won")
    this.cx.fillStyle = "rgb(68, 191, 255)";
  else if (this.level.status == "lost")
    this.cx.fillStyle = "rgb(44, 136, 214)";
  else
    this.cx.fillStyle = "rgb(52, 166, 251)";
  this.cx.fillRect(0, 0,
                   this.canvas.width, this.canvas.height);
};

var otherSprites = document.createElement("img");
otherSprites.src = "img/6.png";

CanvasDisplay.prototype.drawBackground = function() {
  var view = this.viewport;
  var xStart = Math.floor(view.left);
  var xEnd = Math.ceil(view.left + view.width);
  var yStart = Math.floor(view.top);
  var yEnd = Math.ceil(view.top + view.height);

  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var tile = this.level.grid[y][x];
      if (tile == null) continue;
      var screenX = (x - view.left) * scale;
      var screenY = (y - view.top) * scale;
      var tileX = 0;
      var tileY = 0;
      var timesX=timesY=1;
      if(tile=="banli") {tileX = scale ; }
      else if(tile=="pipe") {tileX = scale * 5;timesX=timesY=2;}
      else if(tile=="zhuan") {tileX = scale * 4;}
      else if(tile=="blockcoin") {tileX = scale * 2;}
      else if(tile=="pipe2"){tileX = 0;tileY = scale;timesX=2;}
      else if(tile=="block2") {tileX = scale * 3;}
      else if(tile=="flag"){tileX=scale*7;timesX=2;timesY=11;}
      else if(tile=="none"||tile=="flag2"){tileX = scale * 12;}
      else {tileX = 0;timesX=1;timesY=1;}
      this.cx.drawImage(otherSprites,
                        tileX  ,   tileY, scale*timesX, scale*timesY,
                        screenX, screenY, scale*timesX, scale*timesY);
    }
  }
};

var playerSprites = document.createElement("img");
playerSprites.src = "img/player.png";
var playerXOverlap = 4;

CanvasDisplay.prototype.drawPlayer = function(x, y, width,
                                              height) {
  var sprite = 8, player = this.level.player;
  width += playerXOverlap * 2;
  x -= playerXOverlap;
  if (player.speed.x != 0)
    this.flipPlayer = player.speed.x < 0;

  if (player.speed.y != 0)
    sprite = 9;
  else if (player.speed.x != 0)
    sprite = Math.floor(this.animationTime * 12) % 8;

  this.cx.save();
  if (this.flipPlayer)
    flipHorizontally(this.cx, x + width / 2);

  this.cx.drawImage(playerSprites,
                    sprite * width, 0, width, height,
                    x,              y, width, height);

  this.cx.restore();
};

CanvasDisplay.prototype.drawLava = function(x, y, width,
                                              height,scale){
  var sprite = 0;
  sprite = Math.floor(this.animationTime * 5) % 2;

  this.cx.save();

  this.cx.drawImage(otherSprites,
                    sprite * scale+scale*3, scale, width, height,
                    x,              y, width, height);

  this.cx.restore();
}

CanvasDisplay.prototype.drawActors = function() {
  this.level.actors.forEach(function(actor) {
    var width = actor.size.x * scale;
    var height = actor.size.y * scale;
    var x = (actor.pos.x - this.viewport.left) * scale;
    var y = (actor.pos.y - this.viewport.top) * scale;
    if (actor.type == "player") {
      this.drawPlayer(x, y, width, height);
    } else if(actor.type == "banli"){
      this.drawLava(x,y,width,height,scale);
    }else{
      var tileX;
      if(actor.type == "coin"){
        tileX = 2*scale;tileY = scale;
      }else{
        tileX = 1*scale;
      }
      this.cx.drawImage(otherSprites,
                        tileX, tileY, width, height,
                        x,     y, width, height);
    }
  }, this);
};

var scoreSprites = document.createElement("img");
scoreSprites.src = "img/number.png";

CanvasDisplay.prototype.drawLifeandScore = function(){
  var sprite = 0;
  sprite = Math.floor(this.animationTime * 5) % 2;
  this.cx.save();
  this.level.coincount %= 100;
  let x = this.level.coincount;
  //this.cx.drawImage(otherSprites,20, 10, 20, 20,20,20, 120, 120);
  this.cx.drawImage(scoreSprites,(x-x%10)/10* 20,0,20,20,20,20,20,20);
  this.cx.drawImage(scoreSprites,x%10*20,0,20,20,30,20,20,20);
  this.cx.restore();
  
}

CanvasDisplay.prototype.drawTime = function(){
  var sprite = 0;
  sprite = Math.floor(this.animationTime * 5) % 2;
  this.cx.save();
  this.level.nowtime;
  let x = this.level.nowtime;
  //this.cx.drawImage(otherSprites,20, 10, 20, 20,20,20, 120, 120);
  this.cx.drawImage(scoreSprites,(x-x%10)/10*20,0,20,20,550,20,20,20);
  this.cx.drawImage(scoreSprites,x%10*20,0,20,20,560,20,20,20);
  this.cx.restore();
  
}

CanvasDisplay.prototype.drawLife = function(){
  this.cx.save();
  //this.cx.drawImage(otherSprites,20, 10, 20, 20,20,20, 120, 120);
  this.cx.drawImage(scoreSprites,lives*20,0,20,20,350,20,20,20);
  this.cx.restore();
  
}