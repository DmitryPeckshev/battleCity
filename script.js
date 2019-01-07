var canvasElement = document.getElementById('canvas');
var canvas = canvasElement.getContext('2d');
var fullscreenBtn = document.getElementById('fullscreenBtn');

document.onkeydown = document.onkeypress = document.onkeyup = getKeyPress;
var keydown = {};

var fieldWidth = 1120;
var fieldHeight = 720;
var infoWidth = 160;
var infoHeight = 720;
var cellSize = 40;

var currentLevel = false;
var levelNum = 0;
var countEnemies = 0;
var createEnemy = false;
var enemyCreateDelay = true;
var freezeEnemies = false;

var playerShots = [];
var allEnemies = [];
var enemyShots = [];

var myKills = 0;
var myLives = 3;
var killsToWin = 4;
var enemiesOnScreen = 8;

var barriers = [1,2,3,9];
var breakable = [1];
var unbreakable = [2];

var levelEnds = true;
var isPause = true;
var lvlStartY = -300;
var gameOverStartY = -300;
var startTime = Date.now();
var timer = 0;

var FPS = 30;
// главный цикл
setInterval(function() {
	update();
	draw();
},1000/FPS);

var myTank = {
	color: "#00A",
	x: 440,
	y: 640,
	width: cellSize,
	height: cellSize,
	direction: 'up',
	speed: 4, // возможные значения только 4 и 5
	step: 0,
	shootDelay: 15,
	shootTimer: 0,
	number: 0,
	nearEnemy: 0,
	canBrakeConcrete: false,
	unbreakable: false,
	armorFrame:1,
	shoot: function() {
		var bulletPosition = shootPointFunc(myTank);
		playerShots.push(Bullet({ 
			speed: 8,
			flyDirection: this.direction,
			x: bulletPosition.x,
			y: bulletPosition.y,
			brakeConcrete: this.canBrakeConcrete,
		}));	
	},
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


		if(this.unbreakable == true){
			if(this.armorFrame == 1){
				canvas.drawImage(armor1Img, this.x, this.y);
				this.armorFrame = 2;
			}else if(this.armorFrame == 2){
				canvas.drawImage(armor2Img, this.x, this.y);
				this.armorFrame = 1;
			}
			
		}
		canvas.restore();

	}
}

function update() {

	if(pause()){
		return;
	}

	if(myLives < 0){
		return;
	}

	if(myKills >= killsToWin && !levelEnds && countEnemies !=0){
		setTimeout(function(){
			levelEnds = true;
			if(lvlStartY == 0){
				lvlStartY = -300;
			}
		},4000);
		countEnemies = 0;
	}
	if(levelEnds){
		if(lvlStartY != 0){
			levelNum = changeLevel(levelNum);
		}
		return;
	}

	controls();
	
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

	addEnemy();
	
	allEnemies.forEach(function(enemy) {
		AI(enemy);
		enemy.update();
		moveRules(enemy);
	});
	
	enemyShots.forEach(function(bullet) {
		bullet.update();
	});
	
	enemyBulletsCollision();
	
	barriersAndBullets(currentLevel, playerShots);
	barriersAndBullets(currentLevel, enemyShots);
	
	playerShots = playerShots.filter(function(shot) {
		return shot.active;
	});
	
	enemyShots = enemyShots.filter(function(shot) {
		return shot.active;
	});
	
	killEnemy();
	
	allEnemies = allEnemies.filter(function(enemy) {
		return enemy.active;
	});

	choseBonus();

	if (keydown.t) {
		launchFullScreen(canvasElement);
	}
}

function draw() {
	canvas.clearRect(0, 0, fieldWidth, fieldHeight);
	
	createLevel(currentLevel);

	if(!levelEnds){

		myTank.draw();	
		
		playerShots.forEach(function(bullet) {
			bullet.draw();
		});
		
		allEnemies.forEach(function(enemy) {
			enemy.draw();
		});

		headquarters.draw();
		
		enemyShots.forEach(function(bullet) {
			bullet.draw();
		});
	
		createForest(currentLevel);

		drawBonus();
	}

	createInfo();

	drawPause();

	drawGameOver();
}

function randomInt(minRandom,maxRandom) {
	return Math.floor(Math.random()* (maxRandom - minRandom + 1)) + minRandom;
}

function getKeyPress(event){
	var pressedButton;
	switch(event.keyCode) {
		case 87:
		    pressedButton = 'w'; break;
		case 65:
		    pressedButton = 'a'; break;
		case 83:
		    pressedButton = 's'; break;
		case 68:
		    pressedButton = 'd'; break;
		case 32:
		    pressedButton = 'space'; break;
		case 13:
		    pressedButton = 'enter'; break;
	}
	if(event.type == 'keydown' || event.type == 'keypress'){
		keydown[pressedButton] = true;
	}
	if(event.type == 'keyup'){
		keydown[pressedButton] = false;
	}
}

function controls() {
	if(myTank.step <= 0 && myTank.x%(cellSize/2)==0 && myTank.y%(cellSize/2)==0) { 
		if (keydown.a && !(keydown.d || keydown.w || keydown.s)) {
			myTank.direction = 'left';
			myTankCollide('a');
			if(myTank.nearEnemy != 1) {
				myTank.step = onIce(myTank)*(cellSize/2/myTank.speed)-1;
				myTank.x -= myTank.speed;
			}
		}
		if (keydown.d && !(keydown.a || keydown.w || keydown.s)) {
			myTank.direction = 'right';
			myTankCollide('d');
			if(myTank.nearEnemy != 2) {
				myTank.step = onIce(myTank)*(cellSize/2/myTank.speed)-1;
				myTank.x += myTank.speed;
			}
		}
		if (keydown.w && !(keydown.d || keydown.a || keydown.s)) {
    		myTank.direction = 'up';
    		myTankCollide('w');
    		if(myTank.nearEnemy != 3) {
    			myTank.step = onIce(myTank)*(cellSize/2/myTank.speed)-1;
    			myTank.y -= myTank.speed;
    		}
		}
		if (keydown.s && !(keydown.d || keydown.w || keydown.a)) {
			myTank.direction = 'down';
			myTankCollide('s');
			if(myTank.nearEnemy != 4) {
				myTank.step = onIce(myTank)*(cellSize/2/myTank.speed)-1;
				myTank.y += myTank.speed;
			}
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

function onIce(tank){
	if (tank.direction == 'left') {
		if(currentLevel[tank.y/(cellSize/2)][tank.x/(cellSize/2)] == 5 && 
			currentLevel[(tank.y/(cellSize/2))+1][tank.x/(cellSize/2)] == 5)
		{
			if(currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))-2] == 5 && 
				currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))-2] == 5)
			{
				return 3;
			}
			if(currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))-1] == 5 && 
				currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))-1] == 5)
			{
				return 2;
			}
		}
	}else if (tank.direction == 'right') {
		if(currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))+1] == 5 && 
			currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))+1] == 5)
		{
			if(currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))+3] == 5 && 
				currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))+3] == 5)
			{
				return 3;
			}
			if(currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))+2] == 5 && 
				currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))+2] == 5)
			{
				return 2;
			}
		}
	}else if (tank.direction == 'up') {
		if(currentLevel[tank.y/(cellSize/2)][tank.x/(cellSize/2)] == 5 && 
			currentLevel[tank.y/(cellSize/2)][(tank.x/(cellSize/2))+1] == 5)
		{
			if(currentLevel[(tank.y/(cellSize/2))-2][tank.x/(cellSize/2)] == 5 &&
				currentLevel[(tank.y/(cellSize/2))-2][(tank.x/(cellSize/2))+1] == 5)
			{
				return 3;
			}
			if(currentLevel[(tank.y/(cellSize/2))-1][tank.x/(cellSize/2)] == 5 &&
				currentLevel[(tank.y/(cellSize/2))-1][(tank.x/(cellSize/2))+1] == 5)
			{
				return 2;
			}
		}
	}else if (tank.direction == 'down') {
		if(currentLevel[(tank.y/(cellSize/2))+1][tank.x/(cellSize/2)] == 5 && 
			currentLevel[(tank.y/(cellSize/2))+1][(tank.x/(cellSize/2))+1] == 5)
		{
			if(currentLevel[(tank.y/(cellSize/2))+3][tank.x/(cellSize/2)] == 5 &&
				currentLevel[(tank.y/(cellSize/2))+3][(tank.x/(cellSize/2))+1] == 5)
			{
				return 3;
			}
			if(currentLevel[(tank.y/(cellSize/2))+2][tank.x/(cellSize/2)] == 5 &&
				currentLevel[(tank.y/(cellSize/2))+2][(tank.x/(cellSize/2))+1] == 5)
			{
				return 2;
			}
		}
	}
	return 1;
}

function isBarrier(nearCells, barriers){
	nearCells.forEach(function(oneNearCell){
		barriers.forEach(function(oneBarrier){
			if(oneNearCell === oneBarrier){
				return true;
			}
		});
	});
}

function moveRules(tank) {
	// запрет проезда за карту
	if(tank.x > fieldWidth - tank.width) {
		tank.x = fieldWidth - tank.width;
		tank.go = 'barrier';
	}
	if(tank.x < 0) {
		tank.x = 0;
		tank.go = 'barrier';
	}
	if(tank.y > fieldHeight - tank.height) {
		tank.y = fieldHeight - tank.height;
		tank.go = 'barrier';
	}
	if(tank.y < 0) {
		tank.y = 0;
		tank.go = 'barrier';
	}
	
	// запрет проезда через препятствие
	var nearCells = [];
	if (tank.direction == 'left' && tank.x % (cellSize/2) == (cellSize/2) - tank.speed) {
		nearCells[0] = currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x+tank.speed)/(cellSize/2)-1];
		nearCells[1] = currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x+tank.speed)/(cellSize/2)-1];
		if(tank.y % (cellSize/2) != 0){
			nearCells[2] = currentLevel[Math.floor(tank.y/(cellSize/2))+2][(tank.x+tank.speed)/(cellSize/2)-1];
		}
	}
	if (tank.direction == 'right' && tank.x % (cellSize/2) == tank.speed) {
		nearCells[0] = currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x-tank.speed)/(cellSize/2)+2];
		nearCells[1] = currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x-tank.speed)/(cellSize/2)+2];
		if(tank.y % (cellSize/2) != 0){
			nearCells[2] = currentLevel[Math.floor(tank.y/(cellSize/2))+2][(tank.x-tank.speed)/(cellSize/2)+2];
		}
	}
	if (tank.direction == 'up' && tank.y % (cellSize/2) == (cellSize/2)-tank.speed) {
		nearCells[0] = currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))];
		nearCells[1] = currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))+1];
		if(tank.x % (cellSize/2) != 0){
			nearCells[2] = currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))+2];
		}
	}
	if (tank.direction == 'down' && tank.y % (cellSize/2) == tank.speed) {
		nearCells[0] = currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))];
		nearCells[1] = currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))+1];
		if(tank.x % (cellSize/2) != 0){
			nearCells[2] = currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))+2];
		}
	}
	var isBarrier = false;
	nearCells.forEach(function(oneNearCell){
		barriers.forEach(function(oneBarrier){
			if(oneNearCell === oneBarrier){
				isBarrier = true;
			}
		});
	});
	if(isBarrier){
		if (tank.direction == 'left'){tank.x += tank.speed;}
		if (tank.direction == 'right'){tank.x -= tank.speed;}
		if (tank.direction == 'up'){tank.y += tank.speed;}
		if (tank.direction == 'down'){tank.y -= tank.speed;}
		tank.go = 'barrier';
	}

	// столкновения
	allEnemies.forEach(function(enemy) {
		if(collide(tank, enemy) && tank.number != 0) {
			if(tank.number == enemy.number){return;}
			if(tank.direction == 'left') {
				tank.x += tank.speed; 
				}
			if(tank.direction == 'right') {
				tank.x -= tank.speed; 
				}
			if(tank.direction == 'up') {
				tank.y += tank.speed;
				}
			if(tank.direction == 'down') {
				tank.y -= tank.speed;
				}
			tank.go = 'barrier';
		}
	});
	if(tank.number == 0) {
		allEnemies.forEach(function(enemy) {
			if(collide(tank, enemy)) {
				if(enemy.direction == 'left' ) {
					enemy.x += enemy.speed; 
					}
				if(enemy.direction == 'right' ) {
					enemy.x -= enemy.speed; 
					}
				if(enemy.direction == 'up' ) {
					enemy.y += enemy.speed;
					}
				if(enemy.direction == 'down' ) {
					enemy.y -= enemy.speed;
					}
				//tank.go = 'barrier';
			}
		})
	}
	
}

var headquarters = {
	active: true,
	x: fieldWidth/2 - cellSize/2,
	y: fieldHeight - cellSize,
	draw: function(){
		if(this.active) {
			canvas.save();
			canvas.drawImage(headquartersImg, this.x, this.y);
			canvas.restore();
		} 
	},
}

function Bullet(I) {
	I.active = true;
	I.hit = false;
	I.width = cellSize/10;
	I.height = cellSize/10;
	I.color = "#000";
	
	I.inBounds = function() {
		return I.x >= 0 && I.x <= fieldWidth && I.y >= 0 && I.y <= fieldHeight;
	};

	I.draw = function() {
		if(this.active) {
			canvas.save();
			canvas.fillStyle = this.color;
			canvas.fillRect(this.x, this.y, this.width, this.height);
			canvas.restore();
		} 
		if(this.hit) {
			canvas.save();
			canvas.drawImage(explosionImg, this.x-cellSize/2, this.y-cellSize/2, cellSize, cellSize);
			canvas.restore();
		}
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
		
		//I.active = I.active && I.inBounds();
		
		I.active = !I.hit;
		I.hit = !I.inBounds();
		
		
	};
	
	return I;
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
	//I.number = 0,
	I.color = "#A2B";
	switch(randomInt(1,4)) {
		case 1:
			I.x = 0;
			break;
		case 2:
			I.x = 360;
			break;
		case 3:
			I.x = 720;
			break;
		case 4:
			I.x = 1080;
			break;
	}
	I.y = 0,
	I.width = cellSize,
	I.height = cellSize,
	I.direction = 'down',
	I.step = 0,
	I.speed = 4,
	I.fire = false,
	I.shootDelay = 15,
	I.shootTimer = 0,
	I.go = 'down';
	I.explosed = false, // анимация использования гранаты
	
	I.draw = function() {
		if(this.active){
			if(this.explosed){
				canvas.save();
				canvas.drawImage(explosionImg, this.x, this.y);
				canvas.restore();
			}else{
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
				canvas.drawImage(enemyImg1, this.x, this.y);
				canvas.restore();
			}
		}
	};
	
	I.update = function() {		
		if(freezeEnemies){return;}
		if(this.explosed){
			this.active = false;
		}
		
		//if(this.step <= 0 && this.x%(cellSize/2)==0 && this.y%(cellSize/2)==0){ 
		if (this.go == 'left') {
			this.x -= this.speed;
			this.direction = 'left';
			//this.step = cellSize/10;
		}
		if (this.go == 'right') {
			this.x += this.speed;
			this.direction = 'right';
			//this.step = cellSize/10;
		}
		if (this.go == 'up') {
    		this.y -= this.speed;
    		this.direction = 'up';
    		//this.step = cellSize/10;
		}
		if (this.go == 'down') {
			this.y += this.speed;
			this.direction = 'down';
			//this.step = cellSize/10;
		}

	/*} else {
		
		if (this.direction == 'left') {
			this.x -= this.speed;
		}
		if (this.direction == 'right') {
			this.x += this.speed;
		}
		if (this.direction == 'up') {
    		this.y -= this.speed;
		}
		if (this.direction == 'down') {
			this.y += this.speed;
		}
		this.step -= 1;
	}*/
		
		
		
		
	};
	
	I.shoot = function() {
		if(freezeEnemies){return;}
		var bulletPosition = shootPointFunc(this);
		enemyShots.push(Bullet({ 
			speed: 8,
			flyDirection: this.direction,
			x: bulletPosition.x,
			y: bulletPosition.y
		}));	
	}
	return I;
}

function addEnemy() {
	if (allEnemies.length < enemiesOnScreen) { //занести врага в массив
		var respawnBusy = false;
		allEnemies.forEach(function(enemy) {
			if(enemy.y < cellSize) {
				respawnBusy = true;
			}
		});
		if(enemyCreateDelay){
			setTimeout(function(){createEnemy = true },3000)
			enemyCreateDelay = false;
		}
		if(respawnBusy == false && createEnemy) {
			if( myKills+allEnemies.length < killsToWin) {
				allEnemies.push(Enemy({number: countEnemies+=1}))
			}
			createEnemy = false;
			enemyCreateDelay = true;
		}		
	}
}

function AI(enemy) {
	function changeDirection () {
		switch(randomInt(0,3)) {
		case 0: enemy.go = 'left'; break;
		case 1: enemy.go = 'right'; break;
		case 2: enemy.go = 'up'; break;
		case 3: enemy.go = 'down'; break;
		}
	}
	if (enemy.go == 'barrier') {
		changeDirection ();
	}else if(enemy.x%(cellSize/2)==0 && enemy.y%(cellSize/2)==0){
		if(randomInt(0,8)==0) {
			changeDirection ();
		}
	}
	if (randomInt(0,30)==0 && enemy.shootTimer <= 0) {
    	enemy.shoot();
    	enemy.shootTimer = enemy.shootDelay;
	} else {
		enemy.shootTimer -= 1;
	}
}


function collide(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

function myTankCollide(direction) {
	myTank.nearEnemy = 0;
	allEnemies.forEach(function(oneEnemy) {
		if(myTank.x - myTank.width/4 < oneEnemy.x + oneEnemy.width &&
		myTank.x > oneEnemy.x &&
		myTank.y < oneEnemy.y + oneEnemy.height &&
		myTank.y + myTank.height > oneEnemy.y && direction == 'a'){
			myTank.nearEnemy = 1;
			return;
		}
		if(myTank.x + myTank.width < oneEnemy.x + oneEnemy.width &&
		myTank.x + myTank.width*5/4 > oneEnemy.x &&
		myTank.y < oneEnemy.y + oneEnemy.height &&
		myTank.y + myTank.height > oneEnemy.y && direction == 'd'){
			myTank.nearEnemy = 2;
			return;
		}
		if(myTank.x < oneEnemy.x + oneEnemy.width &&
		myTank.x + myTank.width > oneEnemy.x &&
		myTank.y - myTank.height/4 < oneEnemy.y + oneEnemy.height &&
		myTank.y > oneEnemy.y && direction == 'w'){
			myTank.nearEnemy = 3;
			return;
		}
		if(myTank.x < oneEnemy.x + oneEnemy.width &&
		myTank.x + myTank.width > oneEnemy.x &&
		myTank.y + myTank.height < oneEnemy.y + oneEnemy.height &&
		myTank.y + myTank.height*5/4 > oneEnemy.y && direction == 's'){
			myTank.nearEnemy = 4;
			return;
		}	
	});
}

// столкновения пуль с препятствиями
function barriersAndBullets(currentLevel, tankShots) {
	for(var i = 0; i < currentLevel.length;i++) {
		for(var j = 0; j < currentLevel[i].length;j++) {
			if(currentLevel[i][j] != 0){
				var wallPos = {
					x: j*cellSize/2,
					y: i*cellSize/2,
					width: cellSize/2,
					height: cellSize/2
				}
				tankShots.forEach(
					function(bullet) {
						var tryBullet = bullet;
						breakable.forEach(function(oneBreakable){
							if(currentLevel[i][j]==oneBreakable){
								if(collide(tryBullet, wallPos)) {
									currentLevel[i][j] = 0;
									bullet.hit = true;
								}
							}
						});
						unbreakable.forEach(function(oneUnbreakable){
							if(currentLevel[i][j]==oneUnbreakable){
								if(collide(tryBullet, wallPos)) {
									if(bullet.brakeConcrete == true){
										currentLevel[i][j] = 0;
									}
									bullet.hit = true;
								}
							}
						});
						if(currentLevel[i][j]==9){ //  попали по штабу
							if(collide(tryBullet, wallPos)) {
								myLives = -1;
								headquarters.draw = function(){};
							}
						}	
					}
				);
			}
		}
	}	
}

function killEnemy() {
	allEnemies.forEach(function(enemy){
		playerShots.forEach(function(bullet){
			if(collide(enemy,bullet)){
				enemy.active = false;
				bullet.hit = true;
				myKills++;
			}
		})
	})
}

function enemyBulletsCollision() {
	enemyShots.forEach(function(bullet){
		playerShots.forEach(function(myBullet){
			if(bullet.x -3 < myBullet.x + myBullet.width +3 &&
         		bullet.x + bullet.width +3 > myBullet.x -3 &&
         		bullet.y +3 < myBullet.y + myBullet.height +3 &&
        		bullet.y + bullet.height +3 > myBullet.y -3){
				bullet.hit = true;
				myBullet.hit = true;
			}
		})
		allEnemies.forEach(function(enemy){
			if(collide(bullet, enemy)){
				bullet.hit = true;
			}
		})
		if(collide(bullet, myTank)){
			bullet.hit = true;
			if(bullet.hit == true && bullet.active == true){
				if(!myTank.unbreakable){
					myLives--;
					myTank.canBrakeConcrete = false;
					resetMyTank();
				}
			}
			
		}
		
	})
}

function changeLevel(levelNum) {
	if(lvlStartY >= -300 && lvlStartY < -6){
		currentLevel = levelsStart[+levelNum+1];
		lvlStartY += 6;
		return levelNum;
	}else{
		setTimeout(function(){
			resetData();
			resetMyTank()
			currentLevel = levels[+levelNum];
			levelEnds = false;
		},2000);
		lvlStartY = 0;
		levelNum++;
		return levelNum;
	}
}

function resetData() {
	myKills = 0;
	playerShots = [];
	allEnemies = [];
	enemyShots = [];
	countEnemies = 0;
	createEnemy = false;
	enemyCreateDelay = true;
	startTime = Date.now();
	bonus.ready = false;
	bonus.lastPicked = 0;
}
function resetMyTank() {
	myTank.x = 440;
	myTank.y = 640;
	myTank.step = 0;
	myTank.direction = 'up';
}

function pause() {
	if(!keydown.enter){
		keydown.enter = 'wait';
		isPause = !isPause;
	}
	return isPause;
}

function levelTimer(){
	if(!isPause){
		timer = Date.now() - startTime;
	}else{
		startTime += Date.now() - startTime - timer;
	}
	var diffTime = Math.round(timer /1000);
	var mins = Math.floor(diffTime / 60);
	diffTime = diffTime - mins*60;
	if(levelEnds){
		return '0 : 00';
	}else{
		return mins+' : '+(diffTime<10?'0':'')+diffTime;
	}
}

fullscreenBtn.addEventListener("click", function(){launchFullScreen(canvasElement);});

function launchFullScreen(element) {
	if(element.requestFullScreen) {
		element.requestFullScreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen();
	}
}

var bonus = {
	ready: false,
	x: false,
	y: false,
	width: cellSize,
	height: cellSize,
	type: false,
	timeout: 50,
	lifetime: 10,
	lastPicked: 0,
	timePicked: false,
	fortPicked: false,
	armorPicked: false,
};

function choseBonus() {
	function chooseBonusPlace() {
		var bonusPlaceX = randomInt(0,currentLevel[0].length-2);
		var bonusPlaceY = randomInt(0,currentLevel.length-2);
		if(barriers.indexOf(currentLevel[bonusPlaceY][bonusPlaceX]) == -1 
			&& barriers.indexOf(currentLevel[bonusPlaceY+1][bonusPlaceX]) == -1
			&& barriers.indexOf(currentLevel[bonusPlaceY][bonusPlaceX+1]) == -1
			&& barriers.indexOf(currentLevel[bonusPlaceY+1][bonusPlaceX+1]) == -1){
			bonus.x = bonusPlaceX * (cellSize/2);
			bonus.y = bonusPlaceY * (cellSize/2);
			bonus.ready = true;
		}else{
			chooseBonusPlace();
		}
	}
	if(bonus.ready == true){
		if(Math.round((Date.now()-startTime)/1000) > bonus.lastPicked+bonus.timeout+bonus.lifetime){
			bonus.ready = false;
			bonus.lastPicked = Math.round(timer/1000);
		}
		if(collide(myTank, bonus)){
			if(bonus.type == 'life'){
				myLives += 1;
			}
			if(bonus.type == 'time'){
				freezeEnemies = true;
				bonus.timePicked = true;
			}
			if(bonus.type == 'grenade'){
				myKills += allEnemies.length;
				allEnemies.forEach(function(enemy){
					enemy.explosed = true;		
				})
			}
			if(bonus.type == 'fort'){
				currentLevel[35][26] = 2;
				currentLevel[34][26] = 2;
				currentLevel[33][26] = 2;
				currentLevel[33][27] = 2;
				currentLevel[33][28] = 2;
				currentLevel[33][29] = 2;
				currentLevel[34][29] = 2;
				currentLevel[35][29] = 2;
				bonus.fortPicked = true;
			}
			if(bonus.type == 'pistol'){
				myTank.canBrakeConcrete = true;
			}
			if(bonus.type == 'armor'){
				myTank.unbreakable = true;
				bonus.armorPicked = true;
			}
			bonus.ready = false;
			bonus.lastPicked = Math.round(timer/1000);
		}
	}
	if(bonus.timePicked == true && Math.round(timer/1000) > bonus.lastPicked + 10){
		freezeEnemies = false;
		bonus.timePicked = false;
	}
	if(bonus.fortPicked == true && Math.round(timer/1000) > bonus.lastPicked + 30){
		currentLevel[35][26] = 1;
		currentLevel[34][26] = 1;
		currentLevel[33][26] = 1;
		currentLevel[33][27] = 1;
		currentLevel[33][28] = 1;
		currentLevel[33][29] = 1;
		currentLevel[34][29] = 1;
		currentLevel[35][29] = 1;
		bonus.fortPicked = false;
	}
	if(bonus.armorPicked == true && Math.round(timer/1000) > bonus.lastPicked + 10){
		myTank.unbreakable = false;
		bonus.armorPicked = false;
	}
	if(bonus.ready == false && Math.round((Date.now()-startTime)/1000) > bonus.lastPicked+bonus.timeout){
		chooseBonusPlace();
		switch(randomInt(1,6)) {
			case 1: bonus.type = 'life'; break;
			case 2: bonus.type = 'time'; break;
			case 3: bonus.type = 'grenade'; break;
			case 4: bonus.type = 'fort'; break;
			case 5: bonus.type = 'pistol'; break;
			case 6: bonus.type = 'armor'; break;
		}
	}	
}