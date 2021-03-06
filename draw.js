
var myTankImg = new Image();
myTankImg.addEventListener("load", function() {},false);
myTankImg.src = 'img/myTank.png';

var myTank2Img = new Image();
myTank2Img.addEventListener("load", function() {},false);
myTank2Img.src = 'img/myTank2.png';

var myTank3Img = new Image();
myTank3Img.addEventListener("load", function() {},false);
myTank3Img.src = 'img/myTank3.png';

var myTank4Img = new Image();
myTank4Img.addEventListener("load", function() {},false);
myTank4Img.src = 'img/myTank4.png';

var brickImg = new Image();
brickImg.addEventListener("load", function() {},false);
brickImg.src = 'img/brick.png';

var concreteImg = new Image();
concreteImg.addEventListener("load", function() {},false);
concreteImg.src = 'img/concrete.png';

var enemyImg1 = new Image();
enemyImg1.addEventListener("load", function() {},false);
enemyImg1.src = 'img/enemy1.png';

var enemyImg2 = new Image();
enemyImg2.addEventListener("load", function() {},false);
enemyImg2.src = 'img/enemy2.png';

var enemyImg3 = new Image();
enemyImg3.addEventListener("load", function() {},false);
enemyImg3.src = 'img/enemy3.png';

var enemyImg4 = new Image();
enemyImg4.addEventListener("load", function() {},false);
enemyImg4.src = 'img/enemy4.png';

var explosionImg = new Image();
explosionImg.addEventListener("load", function() {},false);
explosionImg.src = 'img/explosion.png';

var headquartersImg = new Image();
headquartersImg.addEventListener("load", function() {},false);
headquartersImg.src = 'img/headquarters.png';

var groundImg = new Image();
groundImg.addEventListener("load", function() {},false);
groundImg.src = 'img/ground.jpg';

var waterImg = new Image();
waterImg.addEventListener("load", function() {},false);
waterImg.src = 'img/water.jpg';

var forestImg = new Image();
forestImg.addEventListener("load", function() {},false);
forestImg.src = 'img/forest.jpg';

var iceImg = new Image();
iceImg.addEventListener("load", function() {},false);
iceImg.src = 'img/ice.jpg';


var bonusLifeImg = new Image();
bonusLifeImg.addEventListener("load", function() {},false);
bonusLifeImg.src = 'img/bonus-life.png';

var bonusTimeImg = new Image();
bonusTimeImg.addEventListener("load", function() {},false);
bonusTimeImg.src = 'img/bonus-time.png';

var bonusGrenadeImg = new Image();
bonusGrenadeImg.addEventListener("load", function() {},false);
bonusGrenadeImg.src = 'img/bonus-grenade.png';

var bonusFortImg = new Image();
bonusFortImg.addEventListener("load", function() {},false);
bonusFortImg.src = 'img/bonus-fort.png';

var bonusArmorImg = new Image();
bonusArmorImg.addEventListener("load", function() {},false);
bonusArmorImg.src = 'img/bonus-armor.png';

var bonusStarImg = new Image();
bonusStarImg.addEventListener("load", function() {},false);
bonusStarImg.src = 'img/bonus-star.png';

var armor1Img = new Image();
armor1Img.addEventListener("load", function() {},false);
armor1Img.src = 'img/armor1.png';

var armor2Img = new Image();
armor2Img.addEventListener("load", function() {},false);
armor2Img.src = 'img/armor2.png';

function createLevel(levelNum) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			canvas.save();
			if(levelNum[i][j]==0 || levelNum[i][j]==9){
				canvas.drawImage(groundImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			if(lvlStartY < 0){
				canvas.drawImage(groundImg, j*cellSize/2, i*cellSize/2 + (400-Math.abs(lvlStartY)),cellSize/2,cellSize/2);	
			}
			if(levelNum[i][j]==1){
				canvas.drawImage(brickImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			if(levelNum[i][j]==2){
				canvas.drawImage(concreteImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			if(levelNum[i][j]==3){
				canvas.drawImage(waterImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			if(levelNum[i][j]==5){
				canvas.drawImage(iceImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			canvas.restore();
		}
	}
	canvas.save();
	canvas.fillStyle = "rgb(222, 103, 0)";
    canvas.fill();	
	canvas.restore();
}

function createForest(levelNum) {
	for(var i = 0; i < levelNum.length;i++) {
		for(var j = 0; j < levelNum[i].length;j++) {
			canvas.save();
			if(levelNum[i][j]==4){
				canvas.drawImage(forestImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
			}
			canvas.restore();
		}
	}
}

function drawGameOver() {
	canvas.save();
	canvas.fillStyle = "rgba(50,50,50,0.8)";
	canvas.fillRect(0, 0, fieldWidth+infoWidth, infoHeight);
	canvas.restore();
	if(gameOverStartY >= -300 && gameOverStartY < -6){
		gameOverStartY += 6;
	}
	for(var i = 0; i < gameOverPrint.length;i++) {
		for(var j = 0; j < gameOverPrint[i].length;j++) {
			canvas.save();
			if(gameOverPrint[i][j]==1){
				canvas.drawImage(brickImg, j*cellSize/2, i*cellSize/2 + gameOverStartY,cellSize/2,cellSize/2);
			}
			canvas.restore();
		}
	}
}

function drawPause() {
	if(isPause && myLives>=0){
		canvas.save();
		canvas.fillStyle = "rgba(50,50,50,0.8)";
		canvas.fillRect(0, 0, fieldWidth+infoWidth, infoHeight);
		canvas.restore();
		for(var i = 0; i < pausePrint.length;i++) {
			for(var j = 0; j < pausePrint[i].length;j++) {
				canvas.save();
				if(pausePrint[i][j]==1){
					canvas.drawImage(brickImg, j*cellSize/2, i*cellSize/2 + lvlStartY,cellSize/2,cellSize/2);
				}
				canvas.restore();
			}
		}
	}
}

function drawYouWin() {
	canvas.save();
	canvas.fillStyle = "rgba(50,50,50,0.8)";
	canvas.fillRect(0, 0, fieldWidth+infoWidth, infoHeight);
	canvas.restore();
	if(gameOverStartY >= -300 && gameOverStartY < -6){
		gameOverStartY += 6;
	}
	for(var i = 0; i < youWin.length;i++) {
		for(var j = 0; j < youWin[i].length;j++) {
			canvas.save();
			if(youWin[i][j]==1){
				canvas.drawImage(brickImg, j*cellSize/2, i*cellSize/2 + gameOverStartY,cellSize/2,cellSize/2);
			}
			canvas.restore();
		}
	}
}

function createInfo() {
	canvas.save();
	canvas.clearRect(fieldWidth, 0, fieldWidth+infoWidth, infoHeight);
	canvas.fillStyle = '#ccc';
	canvas.fillRect(fieldWidth, 0, fieldWidth+infoWidth, infoHeight);
	canvas.fillStyle = '#1c1c1c';
	canvas.font = 'bold 22px sans-serif';
	canvas.fillText("Level: " + levelNum, fieldWidth+15, 35);
	canvas.font = 'bold 16px sans-serif';
	canvas.fillText("Lives:  " + (myLives>0?myLives:0), fieldWidth+15, 85);
	canvas.fillText("Enemies:  " + (killsToWin-myKills), fieldWidth+15, 120);
	canvas.fillText("Time:  " + levelTimer(), fieldWidth+15, 155);
	canvas.fillText("Kills:  " + killsSum, fieldWidth+15, 190);
	canvas.font = 'bold 18px sans-serif';
	canvas.fillText("Controls:  ", fieldWidth+25, 537);
	canvas.font = 'bold 14px sans-serif';
	canvas.fillText("Up: w ", fieldWidth+15, 565);
	canvas.fillText("Left: a " , fieldWidth+15, 590);
	canvas.fillText("Down: s ", fieldWidth+15, 615);	
	canvas.fillText("Right: d ", fieldWidth+15, 640);
	canvas.fillText("Shoot: spase ", fieldWidth+15, 665);
	canvas.fillText("Pause: enter ", fieldWidth+15, 690);	
	canvas.restore();
}

function drawBonus() {
	if(bonus.ready){
		canvas.save();
		switch(bonus.type) {
			case 'life': canvas.drawImage(bonusLifeImg, bonus.x, bonus.y ,cellSize, cellSize); break;
			case 'time': canvas.drawImage(bonusTimeImg, bonus.x, bonus.y ,cellSize, cellSize); break;
			case 'grenade': canvas.drawImage(bonusGrenadeImg, bonus.x, bonus.y ,cellSize, cellSize); break;
			case 'fort': canvas.drawImage(bonusFortImg, bonus.x, bonus.y ,cellSize, cellSize); break;
			case 'armor': canvas.drawImage(bonusArmorImg, bonus.x, bonus.y ,cellSize, cellSize); break;
			case 'star': canvas.drawImage(bonusStarImg, bonus.x, bonus.y ,cellSize, cellSize); break;	
		}
		canvas.restore();
	}
}

// порядок появления разных видов противников
function enemyLineup() {
	enemiesCreated++;
	var enemyType = 1;
	if(levelNum == 1){
		if([6,7,12,13,19,20].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		killsToWin = 20;
		enemiesOnScreen = 4;
	}
	if(levelNum == 2){
		if([4,5,10,11,15,16].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([19,20].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
	}
	if(levelNum == 3){
		if([3,5,7,11,17].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([9,15,19,20].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
	}
	if(levelNum == 4){
		if([3,4,8,10,17,19].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([6,12,14,16,20].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		enemiesOnScreen = 5;
	}
	if(levelNum == 5){
		if([3,5,7,11,17,21].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([9,15,19,23,25].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		killsToWin = 25;
	}
	if(levelNum == 6){
		if([4,8,12,16].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([3,7,11,15].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		if([24,25].indexOf(enemiesCreated) > -1){
			enemyType = 4;
		}
	}
	if(levelNum == 7){
		if([4,5,6,7,17,18,19,20].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([10,11,12,13].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		if([21,23,25].indexOf(enemiesCreated) > -1){
			enemyType = 4;
		}
		enemiesOnScreen = 6;
	}
	if(levelNum == 8){
		if([2,3,11,12,13,14,15].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([7,8,9,19,20].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		if([21,23,25].indexOf(enemiesCreated) > -1){
			enemyType = 4;
		}
	}
	if(levelNum == 9){
		if([4,5,7,8,19,26,27].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([2,6,16,20,24].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		if([12,18,28,29,30].indexOf(enemiesCreated) > -1){
			enemyType = 4;
		}
		killsToWin = 30;
	}
	if(levelNum == 10){
		if([2,5,6,7,14,18,19].indexOf(enemiesCreated) > -1){
			enemyType = 2;
		}
		if([7,8,15,16,20,21,22,23,24].indexOf(enemiesCreated) > -1){
			enemyType = 3;
		}
		if([11,12,25,26,27,28,29,30].indexOf(enemiesCreated) > -1){
			enemyType = 4;
		}
	}
	pushEnemy(enemyType);
}
