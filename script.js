
var canvasElement = document.getElementById('canvas');
var canvas = canvasElement.getContext('2d');

var fieldWidth = 1120;
var fieldHeight = 720;
var infoWidth = 160;
var infoHeight = 720;
var cellSize = 40;
var currentLevel = 0;
var countEnemies = 0;
var createEnemy = false;
var enemyCreateDelay = true;

var playerShots = [];
var allEnemies = [];
var enemyShots = [];

var myKills = 0;
var myLives = 999;

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

var explosionImg = new Image();
explosionImg.addEventListener("load", function() {},false);
explosionImg.src = 'explosion.png';

var groundImg = new Image();
groundImg.addEventListener("load", function() {},false);
groundImg.src = 'ground.jpg';

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
	number: 0,
	nearEnemy: 0,
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

	
	if (allEnemies.length < 4 ) { //занести врага в массив
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
			allEnemies.push(Enemy({number: countEnemies+=1}))
			createEnemy = false;
			enemyCreateDelay = true;
		}		
	}
	
	allEnemies.forEach(function(enemy) {
		AI(enemy);
		enemy.update();
		moveRules(enemy);
		//console.log(enemy.number, enemy.x, enemy.y);
	});
	
	enemyShots.forEach(function(bullet) {
		bullet.update();
	});
	
	enemyBulletsCollision();
	
	breakWall(currentLevel, playerShots);
	breakWall(currentLevel, enemyShots);
	
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
}


function draw() {
	canvas.clearRect(0, 0, fieldWidth, fieldHeight);
	
	createLevel(currentLevel);
	
	myTank.draw();	
	
	playerShots.forEach(function(bullet) {
		bullet.draw();
	});
	
	allEnemies.forEach(function(enemy) {
		enemy.draw();
	});
	
	enemyShots.forEach(function(bullet) {
		bullet.draw();
	});
	
	createInfo();
}

function randomInt(minRandom,maxRandom) {
	return Math.floor(Math.random()* (maxRandom - minRandom + 1)) + minRandom;
}

function controls() {
	//myTankCollide();
	if(myTank.step <= 0 && myTank.x%(cellSize/2)==0 && myTank.y%(cellSize/2)==0) { 
		if (keydown.a && !(keydown.d || keydown.w || keydown.s)) {
			myTank.direction = 'left';
			myTankCollide('a');
			if(myTank.nearEnemy != 1) {
				myTank.x -= myTank.speed;
				myTank.step = cellSize/10;
			}
		}
		if (keydown.d && !(keydown.a || keydown.w || keydown.s)) {
			myTank.direction = 'right';
			myTankCollide('d');
			if(myTank.nearEnemy != 2) {
				myTank.x += myTank.speed;
				myTank.step = cellSize/10;
			}
		}
		if (keydown.w && !(keydown.d || keydown.a || keydown.s)) {
    		myTank.direction = 'up';
    		myTankCollide('w');
    		if(myTank.nearEnemy != 3) {
    			myTank.y -= myTank.speed;
    			myTank.step = cellSize/10;
    		}
		}
		if (keydown.s && !(keydown.d || keydown.w || keydown.a)) {
			myTank.direction = 'down';
			myTankCollide('s');
			if(myTank.nearEnemy != 4) {
				myTank.y += myTank.speed;
				myTank.step = cellSize/10;
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
	
	// запрет проезда через кирпичи
	if (tank.direction == 'left' && tank.x % (cellSize/2) == (cellSize/2) - tank.speed && tank.y % (cellSize/2) == 0) {
		if(currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x+tank.speed)/(cellSize/2)-1]==1 || currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x+tank.speed)/(cellSize/2)-1]==1 ) {
			tank.x += tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'right' && tank.x % (cellSize/2) == tank.speed && tank.y % (cellSize/2) == 0) {
		if(currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x-tank.speed)/(cellSize/2)+2]==1 || currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x-tank.speed)/(cellSize/2)+2]==1 ) {
			tank.x -= tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'up' && tank.y % (cellSize/2) == (cellSize/2)-tank.speed && tank.x % (cellSize/2) == 0) {
		if(currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))]==1 || currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))+1]==1 ) {
			tank.y += tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'down' && tank.y % (cellSize/2) == tank.speed && tank.x % (cellSize/2) == 0) {
		if(currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))]==1 || currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))+1]==1 ) {
			tank.y -= tank.speed;
			tank.go = 'barrier';
			
		}
	}
	if (tank.direction == 'left' && tank.x % (cellSize/2) == (cellSize/2) - tank.speed && tank.y % (cellSize/2) != 0) {
		if(currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x+tank.speed)/(cellSize/2)-1]==1 || currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x+tank.speed)/(cellSize/2)-1]==1 
			|| currentLevel[Math.floor(tank.y/(cellSize/2))+2][(tank.x+tank.speed)/(cellSize/2)-1]==1) {
			tank.x += tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'right' && tank.x % (cellSize/2) == tank.speed && tank.y % (cellSize/2) != 0) {
		if(currentLevel[Math.floor(tank.y/(cellSize/2))][(tank.x-tank.speed)/(cellSize/2)+2]==1 || currentLevel[Math.floor(tank.y/(cellSize/2))+1][(tank.x-tank.speed)/(cellSize/2)+2]==1 
			|| currentLevel[Math.floor(tank.y/(cellSize/2))+2][(tank.x-tank.speed)/(cellSize/2)+2]==1 ) {
			tank.x -= tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'up' && tank.y % (cellSize/2) == (cellSize/2)-tank.speed && tank.x % (cellSize/2) != 0) {
		if(currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))]==1 || currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))+1]==1 
			|| currentLevel[(tank.y+tank.speed)/(cellSize/2)-1][Math.floor(tank.x/(cellSize/2))+2]==1) {
			tank.y += tank.speed;
			tank.go = 'barrier';
		}
	}
	if (tank.direction == 'down' && tank.y % (cellSize/2) == tank.speed && tank.x % (cellSize/2) != 0) {
		if(currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))]==1 || currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))+1]==1 
			|| currentLevel[(tank.y-tank.speed)/(cellSize/2)+2][Math.floor(tank.x/(cellSize/2))+2]==1) {
			tank.y -= tank.speed;
			tank.go = 'barrier';
			
		}
	}
	
	// столкновения
	
	allEnemies.forEach(function(enemy) {
		if(collide(tank, enemy) && tank.number != 0) {
			//console.log(tank, enemy);
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
				/*if(tank.direction == 'left') {
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
				}*/
				/*/if(tank.x % cellSize/2 == cellSize/10) {
					tank.step = cellSize/10;
				}else{
					tank.step += 1; 
				}*/
				//console.log(tank.step);
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


myTank.shoot = function() {
	var bulletPosition = shootPointFunc(myTank);
	playerShots.push(Bullet({ 
		speed: 8,
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
	//I.number = 0,
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
	I.step = 0,
	I.speed = 4,
	I.fire = false,
	I.shootDelay = 15,
	I.shootTimer = 0,
	I.go = 'down';
	
	I.draw = function() {
		if(this.active){
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
		}
	};
	
	I.update = function() {		
		
		//if(this.step <= 0 && this.x%(cellSize/2)==0 && this.y%(cellSize/2)==0){ 
		if (this.go == 'left') {
			this.x -= this.speed;
			this.direction = 'left';
			this.step = cellSize/10;
		}
		if (this.go == 'right') {
			this.x += this.speed;
			this.direction = 'right';
			this.step = cellSize/10;
		}
		if (this.go == 'up') {
    		this.y -= this.speed;
    		this.direction = 'up';
    		this.step = cellSize/10;
		}
		if (this.go == 'down') {
			this.y += this.speed;
			this.direction = 'down';
			this.step = cellSize/10;
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
	}else{
		if(randomInt(0,39)==0) {
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

function breakWall(levelNum, tankShots) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			if(levelNum[i][j]==1){
				var wallPos = {
					x: j*cellSize/2,
					y: i*cellSize/2,
					width: cellSize/2,
					height: cellSize/2
				}
				tankShots.forEach(
					function(bullet) {
						var tryBullet = bullet;
						var hit = collide(tryBullet, wallPos);
						if(hit) {
							levelNum[i][j] = 0;
							bullet.hit = true;
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
				console.log('kills', myKills);
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
				//myBullet.active = false;
				//bullet.active = false;
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
				myLives--;
				console.log('damage', myLives);
			}
			
		}
		
	})
}

function createLevel(levelNum) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			if(levelNum[i][j]==0){
				canvas.save();
				canvas.drawImage(groundImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
				canvas.restore();
			}
			if(lvlStartY < 0){
				canvas.save();
				canvas.drawImage(groundImg, j*cellSize/2, i*cellSize/2 + (400-Math.abs(lvlStartY)),cellSize/2,cellSize/2);	
				canvas.restore();
			}
			if(levelNum[i][j]==1){
				canvas.save();
				canvas.drawImage(brickImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
				//canvas.drawImage(enemyImg, j*cellSize/2, i*cellSize/2,cellSize/2,cellSize/2);
				//canvas.fillRect(j*cellSize, i*cellSize, cellSize, cellSize);
				canvas.restore();
			}
		}
	}
	canvas.save();
	//canvas.drawImage(brickImg, 20, 20,cellSize/2,cellSize/2);
	canvas.fillStyle = "rgb(222, 103, 0)";
    canvas.fill();	
	canvas.restore();

}

function changeLevel() {
	if(levelNum == 0 && lvlStartY >= -300 && lvlStartY < 0){
		changeLvlAnim(level1Start);
	}
	if(levelNum == 0 && lvlStartY == 0) {
		levelNum = 1;
		setTimeout(function(){
			resetData();
			currentLevel = level1;
		},2000);
	}
	if(myKills == 2 && currentLevel == level1) {
		resetData();
		enemyCreateDelay = false;
		lvlStartY = -300;
		currentLevel = level2Start;
	}
	if(lvlStartY >= -300 && lvlStartY < 0 && currentLevel == level2Start){
		changeLvlAnim(level2Start);
		createEnemy = false;
	}
	if(currentLevel == level2Start && levelNum == 1 && lvlStartY == 0) {
		levelNum = 2;
		setTimeout(function(){
			resetData();
			currentLevel = level2;
		},2000);
	}
	if(currentLevel == level1Start && lvlStartY == 0 && levelNum == 2) {
		
	}
}

var levelNum = 0;
var lvlStartY = -300;

function changeLvlAnim(startimg) {
	enemyCreateDelay = false;
	currentLevel = startimg;
	lvlStartY += 6;
}

function resetData() {
	myKills = 0;
	playerShots = [];
	allEnemies = [];
	enemyShots = [];
	countEnemies = 0;
	createEnemy = false;
	enemyCreateDelay = true;
	myTank.x = 320;
	myTank.y = 600;
	myTank.step = 0;
	myTank.direction = 'up';
}


function createInfo() {
	canvas.save();
	canvas.clearRect(fieldWidth, 0, fieldWidth+infoWidth, infoHeight);
	canvas.fillStyle = '#ccc';
	canvas.fillRect(fieldWidth, 0, fieldWidth+infoWidth, infoHeight);
	canvas.fillStyle = '#1c1c1c';
	canvas.font = 'bold 16px sans-serif';
	canvas.fillText("Kills:  " + myKills, fieldWidth+15, 70);
	canvas.fillText("Lives:  " + myLives, fieldWidth+15, 120);		
	canvas.restore();
}


document.cancelFullScreen = document.cancelFullScreen || document.webkitCancelFullScreen ||      document.mozCancelFullScreen;

function onFullScreenEnter() {
  console.log("Enter fullscreen initiated from iframe");
};

function onFullScreenExit() {
  console.log("Exit fullscreen initiated from iframe");
};

// Note: FF nightly needs about:config full-screen-api.enabled set to true.
function enterFullscreen() {
  //onFullScreenEnter(id);
  var el =  document.getElementById(canvas);
  var onfullscreenchange =  function(e){
    var fullscreenElement = document.fullscreenElement || document.mozFullscreenElement || document.webkitFullscreenElement;
    var fullscreenEnabled = document.fullscreenEnabled || document.mozFullscreenEnabled || document.webkitFullscreenEnabled;
    console.log( 'fullscreenEnabled = ' + fullscreenEnabled, ',  fullscreenElement = ', fullscreenElement, ',  e = ', e);
  }

 // el.addEventListener("webkitfullscreenchange", onfullscreenchange);
 // el.addEventListener("mozfullscreenchange",     onfullscreenchange);
  //el.addEventListener("fullscreenchange",             onfullscreenchange);

  /*if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  } else {
    el.mozRequestFullScreen();
  }*/
  document.querySelector('button').onclick = function(){
    exitFullscreen();
  }
}

function exitFullscreen() {
  //onFullScreenExit(id);
  document.cancelFullScreen();
  document.querySelector('button').onclick = function(){
    enterFullscreen();
  }
}

function launchFullScreen(element) {
	if(element.requestFullScreen) {
		element.requestFullScreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullScreen) {
		element.webkitRequestFullScreen();
	}
	window.addEventListener("webkitfullscreenchange", onfullscreenchange);
	window.addEventListener("mozfullscreenchange", onfullscreenchange);
	window.addEventListener("fullscreenchange", onfullscreenchange);
	/*if (canvas.webkitRequestFullScreen) {
		canvas.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	} else {
		canvas.mozRequestFullScreen();
	}*/
	
}

function onfullscreenchange() {
	canvasElement.style.width = '100%';
	canvasElement.style.height = '100%';
	console.log(canvasElement.width);

}


