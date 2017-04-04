
var canvasElement = document.getElementById('canvas');
var canvas = canvasElement.getContext('2d');

var fieldWidth = 920;
var fieldHeight = 640;
var cellSize = 40;
var currentLevel;

var playerShots = [];

var FPS = 30;
setInterval(function() {
	update();
	draw();
},1000/FPS);

var myTankImg = new Image();
myTankImg.addEventListener("load", function() {},false);
myTankImg.src = 'demosmall.png';

var brickImg = new Image();
brickImg.addEventListener("load", function() {},false);
brickImg.src = 'brick.jpg';

var enemyImg = new Image();
enemyImg.addEventListener("load", function() {},false);
enemyImg.src = 'enemy1.png';

var myTank = {
	color: "#00A",
	x: 320,
	y: 600,
	width: cellSize,
	height: cellSize,
	direction: 'up',
	speed: 4,
	step: 0,
	shootDelay: 15,
	shootTimer: 0,
	draw: function() {

		canvas.save();
		//canvas.globalCompositeOperation='destination-over';
		
		canvas.translate(this.x + this.width/2, this.y + this.height/2);
		if(this.direction == 'left'){
			canvas.rotate(Math.PI/2);
		}
		if(this.direction == 'right'){
			canvas.rotate(-Math.PI/2);
		}
		if(this.direction == 'up'){
			canvas.rotate(Math.PI);
		}
		if(this.direction == 'down'){
			canvas.rotate(Math.PI*2);
		}			
		canvas.translate(-this.x - this.width/2, -this.y - this.height/2);
		canvas.drawImage(myTankImg, this.x, this.y);
		canvas.restore();

	}
}


function update() {
	
	controls();
	
	changeLevel();
	
	moveRules(myTank);
	
	if (keydown.space && myTank.shootTimer <= 0) {
    	myTank.shoot();
    	myTank.shootTimer = myTank.shootDelay;
	} else {
		myTank.shootTimer -= 1;
	}
	
	playerShots.forEach(function(bullet) {
		bullet.update();
	});
	
	breakWall(currentLevel, playerShots);
	
	playerShots = playerShots.filter(function(shot) {
		return shot.active;
	});

}


function draw() {
	canvas.clearRect(0, 0, fieldWidth, fieldHeight);
	
	createLevel(currentLevel);
	
	myTank.draw();	
	
	playerShots.forEach(function(bullet) {
		bullet.draw();
	});
	

}

function randomInt(minRandom,maxRandom) {
	return Math.floor(Math.random()* (maxRandom - minRandom + 1)) + minRandom;
}

function controls() {

	if(myTank.step <= 0 && myTank.x%(cellSize/2)==0 && myTank.y%(cellSize/2)==0){ 
		if (keydown.a && !(keydown.d || keydown.w || keydown.s)) {
			myTank.x -= myTank.speed;
			myTank.direction = 'left';
			myTank.step = cellSize/10;
		}
		if (keydown.d && !(keydown.a || keydown.w || keydown.s)) {
			myTank.x += myTank.speed;
			myTank.direction = 'right';
			myTank.step = cellSize/10;
		}
		if (keydown.w && !(keydown.d || keydown.a || keydown.s)) {
    		myTank.y -= myTank.speed;
    		myTank.direction = 'up';
    		myTank.step = cellSize/10;
		}
		if (keydown.s && !(keydown.d || keydown.w || keydown.a)) {
			myTank.y += myTank.speed;
			myTank.direction = 'down';
			myTank.step = cellSize/10;
		}

	} else {
		
		if (myTank.direction == 'left') {
			myTank.x -= myTank.speed;
		}
		if (myTank.direction == 'right') {
			myTank.x += myTank.speed;
		}
		if (myTank.direction == 'up') {
    		myTank.y -= myTank.speed;
		}
		if (myTank.direction == 'down') {
			myTank.y += myTank.speed;
		}
		myTank.step -= 1;
	}
}

function moveRules(tank) {
	// запрет проезда за карту
	if(tank.x > fieldWidth - tank.width) {
		tank.x = fieldWidth - tank.width;
	}
	if(tank.x < 0) {
		tank.x = 0;
	}
	if(tank.y > fieldHeight - tank.height) {
		tank.y = fieldHeight - tank.height;
	}
	if(tank.y < 0) {
		tank.y = 0;
	}
	
	// запрет проезда через кирпичи
	if (tank.direction == 'left' && tank.x % cellSize == cellSize - tank.speed) {
		if(currentLevel[Math.ceil(tank.y/cellSize)][(tank.x+tank.speed)/cellSize-1]==1 || currentLevel[Math.floor(tank.y/cellSize)][(tank.x+tank.speed)/cellSize-1]==1 ) {
			tank.x += tank.speed;
		}
	}
	if (tank.direction == 'right' && tank.x % cellSize == tank.speed) {
		if(currentLevel[Math.ceil(tank.y/cellSize)][(tank.x-tank.speed)/cellSize+1]==1 || currentLevel[Math.floor(tank.y/cellSize)][(tank.x-tank.speed)/cellSize+1]==1 ) {
			tank.x -= tank.speed;
		}
	}
	if (tank.direction == 'up' && tank.y % cellSize == cellSize-tank.speed) {
		if(currentLevel[(tank.y+tank.speed)/cellSize-1][Math.ceil(tank.x/cellSize)]==1 || currentLevel[(tank.y+tank.speed)/cellSize-1][Math.floor(tank.x/cellSize)]==1 ) {
			tank.y += tank.speed;
		}
	}
	if (tank.direction == 'down' && tank.y % cellSize == tank.speed) {
		if(currentLevel[(tank.y-tank.speed)/cellSize+1][Math.ceil(tank.x/cellSize)]==1 || currentLevel[(tank.y-tank.speed)/cellSize+1][Math.floor(tank.x/cellSize)]==1 ) {
			tank.y -= tank.speed;
		}
	}
}


function Bullet(I) {
	I.active = true;
	I.width = cellSize/10;
	I.height = cellSize/10;
	I.color = "#000";
	
	I.inBounds = function() {
		return I.x >= 0 && I.x <= fieldWidth && I.y >= 0 && I.y <= fieldHeight;
	};

	I.draw = function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	};
	
	I.update = function() {
		if(I.flyDirection == 'left'){
			I.x -= I.speed;
 			I.y += 0;
		}
		if(I.flyDirection == 'right'){
			I.x += I.speed;
 			I.y += 0;
		}
		if(I.flyDirection == 'up'){
			I.x += 0;
 			I.y -= I.speed;
		}
		if(I.flyDirection == 'down'){
			I.x += 0;
 			I.y += I.speed;
		}
		
		I.active = I.active && I.inBounds();
	};
	
	return I;
}


myTank.shoot = function() {
	var bulletPosition = shootPointFunc(myTank);
	playerShots.push(Bullet({
		speed: 6,
		flyDirection: this.direction,
		x: bulletPosition.x,
		y: bulletPosition.y
	}));	
}

	// начало выстрела
function shootPointFunc(tank) {
	if(tank.direction == 'left'){
		return {
			x: tank.x,
 			y: tank.y + tank.height/2 - cellSize/20
		};
	}
	if(tank.direction == 'right'){
		return {
			x: tank.x + tank.width,
 			y: tank.y + tank.height/2 - cellSize/20
		};
	}
	if(tank.direction == 'up'){
		return {
			x: tank.x + tank.width/2 - cellSize/20,
 			y: tank.y
		};
	}
	if(tank.direction == 'down'){
		return {
			x: tank.x + tank.width/2 - cellSize/20,
 			y: tank.y + tank.height
		};
	}
};

function Enemy(I) {
	I = I || {};
	I.active = true;
	I.color = "#A2B";
	switch(randomInt(1,3)) {
		case 1:
			I.x = 0;
			break;
		case 2:
			I.x = 440;
			break;
		case 3:
			I.x = 880;
			break;
	}
	I.y = 0,
	I.width = cellSize,
	I.height = cellSize,
	I.direction = 'down',
	
	I.draw = function() {
		canvas.save();
		canvas.translate(this.x + this.width/2, this.y + this.height/2);
		if(this.direction == 'left'){
			canvas.rotate(Math.PI/2);
		}
		if(this.direction == 'right'){
			canvas.rotate(-Math.PI/2);
		}
		if(this.direction == 'up'){
			canvas.rotate(Math.PI);
		}
		if(this.direction == 'down'){
			canvas.rotate(Math.PI*2);
		}			
		canvas.translate(-this.x - this.width/2, -this.y - this.height/2);
		canvas.drawImage(enemyImg, this.x, this.y);
		canvas.restore();
	};
	
	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

		I.age++;

		I.active = I.active && I.inBounds();
	};
	return I;
}



function collide(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function breakWall(levelNum, tankShots) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			if(levelNum[i][j]==1){
				var wallPos = {
					x: j*cellSize,
					y: i*cellSize,
					width: cellSize,
					height: cellSize
				}
				tankShots.forEach(
					function(bullet) {
						var tryBullet = bullet;
						var hit = collide(tryBullet, wallPos);
						
						console.log(tryBullet.x,tryBullet.y,hit)
						if(hit) {
							levelNum[i][j] = 0;
							bullet.active = false;
						}
						
					}
				);

			}
			
		}
	}


	
	
}





var level1 = [];
	level1[0]  = [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[1]  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[2]  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[3]  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[4]  = [0,1,1,0,0,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0];
	level1[5]  = [0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,0,0,0,0,0,0];
	level1[6]  = [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0];
	level1[7]  = [0,1,0,1,0,1,0,1,0,0,0,1,0,1,1,1,0,0,0,0,0,0,0];
	level1[8]  = [0,1,1,0,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0];
	level1[9]  = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[10] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[11] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[12] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[13] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	level1[14] = [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0];
	level1[15] = [0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0];


var expandLvl = [];


function expandLevelArr(levelNum) {
	for(var j = 0; j < 46; j++) {
		expandLvl[j] = new Array(32);
	}
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
				expandLvl[j*2][i*2] = levelNum[i][j];
				expandLvl[j*2+1][i*2] = levelNum[i][j];
				expandLvl[j*2][i*2+1] = levelNum[i][j];
				expandLvl[j*2+1][i*2+1] = levelNum[i][j];
		}
	}
	
}

expandLevelArr(level1);
//console.log(expandLvl);
for(var j = 0; j < expandLvl.length;j++) {
	console.log(j,expandLvl[j]);
}


function createLevel(levelNum) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			if(levelNum[i][j]==1){
				canvas.save();
				canvas.drawImage(brickImg, j*cellSize, i*cellSize);
				canvas.drawImage(enemyImg, j*cellSize, i*cellSize);
				//canvas.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
				canvas.restore();
			}
			
		}
	}

}

function changeLevel() {
	currentLevel = level1;
}







