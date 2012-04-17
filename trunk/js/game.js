/**
 * Main game script
 * @author Angelo
 */

/******Global variables********/

// Canvas
var mainCanvas;
var ctx;
var canvasWidth;
var canvasHeight;

var soundStatus = true;
var isGamePaused = false;

// Resources
var bgImg;

// Others
var redFactor = 1;
var greenFactor = 0.64;
var blueFactor = 0;

var cachedGridTexture;
var lastGridRenderTime = 0;
var lastSchemeSwitchTime = 0;
var GridRandomizeInterval = 1000;
var SchemeSwitchInterval = 4000;

var snake;
var score = 0;

// Gain animation variables
var isDoingGainAnimation = false;
var gainAmountToAnim = 0;
var gainAnimAlpha = 0;
var gainAnimPos = new Object();

// Credits animation variables
var isDoingCreditsAnimation = false;
var creditsAnimAlpha = 0;
var isCreditsAnimFadingOut = false;

// Resource loading
var totalResourcesToLoad = 3;
var resourcesLoaded = 0;
var allResourcesLoaded = false;
var isAudioLoaded = false;

var noUseSessionStorage = false;
var highScore;

// FPS related
var GameFps = 60;
var lastFrameTime = new Date();
var RenderFps = false;

/*****************************/

// Main Function To Start
function start() {
	mainCanvas = document.getElementById("maincanvas");
	ctx = mainCanvas.getContext("2d");
	canvasWidth = mainCanvas.width;
	canvasHeight = mainCanvas.height;	
	
	document.addEventListener('keydown', onKeyDown);
	if(noUseSessionStorage === false)
	{	
		if(sessionStorage === null)
		{
			// Session storage not supported by browser
			noUseSessionStorage = true;
		}
	}
	
	if(noUseSessionStorage === false)
	{
		if(sessionStorage.highScore === undefined)
		{
			sessionStorage.highScore = 0;
		}
	}
	else
	{
		highScore = 0;
	}
	
	loadResources();
	switchScheme();		
	
	snake = new Snake();
	snake.init();

	return setInterval(draw, ~~(1000 / GameFps));
}

function loadResources()
{
	bgImg = new Image();
	bgImg.onload = resourceLoaded();
	bgImg.src = "resources/bg.png";		
}

function resetGame()
{
	if(isAudioLoaded === true)
	{
		document.getElementById('music').currentTime = 0;
		if(soundStatus === true)
		{
			document.getElementById('music').play();
		}
	}
	
	score = 0;
	
	isDoingGainAnimation = false;
	isDoingCreditsAnimation = true;
	isCreditsAnimFadingOut = false;
	creditsAnimAlpha = 0;
	
	snake.reset();
}

function increaseScoreBy(value)
{
	score += value;
	if(noUseSessionStorage === false)
	{
		if(score > (Number)(sessionStorage.highScore))
			sessionStorage.highScore = score;
	}
	else
	{
		if(score > highScore)
			highScore = score;
	}
}

function doGainAnimation(gainAmount, x, y)
{
	isDoingGainAnimation = true;
	gainAmountToAnim = gainAmount;
	gainAnimAlpha = 1;
	gainAnimPos.x = x;
	gainAnimPos.y = y;
}

// Get Key Input
function onKeyDown(evt) {	
	switch(evt.keyCode)
	{
		case 39:
			snake.setDirection(MOVEDIRECTION_RIGHT);
			break;
		case 37:
			snake.setDirection(MOVEDIRECTION_LEFT);
			break;
		case 38:
			snake.setDirection(MOVEDIRECTION_UP);
			break;
		case 40:
			snake.setDirection(MOVEDIRECTION_DOWN);
			break;
		case 83:
			toggleSound();
			break;
		case 80:
			isGamePaused = !isGamePaused;
			//Show the pause overlay.
			if(isGamePaused === true)
			{
				document.getElementById('pauseoverlay').style.opacity = "0.8";
			}
			else
			{
				document.getElementById('pauseoverlay').style.opacity = "0";
			}
			
			// Pause or unpause the sound depending on whether it is on.
			if(soundStatus === true)
			{				
				if(isGamePaused === false)
				{					
					document.getElementById('music').play();
				}
				else
				{
					document.getElementById('music').pause();
				}
			}
			break;
	}
}

function renderToCanvas(width, height, renderFunction)
{
	var buffer = document.createElement('canvas');
	buffer.width = width;
	buffer.height = height;
	
	renderFunction(buffer.getContext('2d'));
	return buffer;
}

// Draw Function
function draw() {	
	// Resource loading animation	
	if(resourcesLoaded < totalResourcesToLoad)
	{
		ctx.fillStyle = "#222222";
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.fillStyle = "#ffffff";
		ctx.font = "16px tahoma";
		ctx.textBaseline = "top";
		ctx.textAlign = "center";
		ctx.fillText("Please wait...", canvasWidth / 2, canvasHeight / 2);
		
		ctx.fillStyle = "#111111";
		ctx.roundRect(canvasWidth / 2 - 140, canvasHeight / 2 + 30, 280, 20, 8);
		ctx.fill();
		ctx.fillStyle = "#cccccc";		
		ctx.roundRect(canvasWidth / 2 - 140, canvasHeight / 2 + 30, 280 * (resourcesLoaded / totalResourcesToLoad), 20, 8);
		ctx.fill();			
		
		return;
	}
	else if(allResourcesLoaded === false)
	{
		resetGame();
		allResourcesLoaded = true;
	}		
	
	if(isGamePaused === true)
		return;
		
	var now = new Date();		
	if(now - lastSchemeSwitchTime > SchemeSwitchInterval)
	{
		switchScheme();
		lastSchemeSwitchTime = now;
	}	
	if(now - lastGridRenderTime > GridRandomizeInterval)
	{
		renderGridToTexture();	
		lastGridRenderTime = now;
	}		
	ctx.drawImage(cachedGridTexture, 0, 0);
	
	snake.update();
	if(snake.checkCollision() === true)
	{
		resetGame();
	}
	
	snake.draw(ctx);
	
	// Render the score and best score.
	ctx.save();
	ctx.globalAlpha = 0.66;
	ctx.fillStyle = "#ffffff";
	ctx.font = "22px Space Age";
	ctx.textBaseline = "top";
	ctx.textAlign = "right";
	ctx.fillText(score, canvasWidth - 5, 0);
	
	ctx.textAlign = "left";
	ctx.font = "18px Space Age";
	if(noUseSessionStorage === false)
	{
		ctx.fillText("Best: " + (Number)(sessionStorage.highScore), 5, 20);
	}
	else
	{
		ctx.fillText("Best: " + highScore, 5, 20);
	}
	ctx.restore();				
	
	// Render any gain animation
	if(isDoingGainAnimation)
	{
		ctx.save();
		ctx.fillStyle = "#33d6ff";
		ctx.font = "18px Space Age";
		ctx.textBaseline = "top";
		ctx.textAlign = "center";
		ctx.globalAlpha = gainAnimAlpha;
		ctx.fillText(gainAmountToAnim, gainAnimPos.x, gainAnimPos.y);
		gainAnimPos.y -= 0.5;
		gainAnimAlpha -= 0.01;
		if(gainAnimAlpha <= 0)
			isDoingGainAnimation = false;
		ctx.restore();
	}	
	
	// Credits loading animation
	if(isDoingCreditsAnimation)
	{		
		ctx.save();		
		ctx.fillStyle = "#ffffff";
		ctx.font = "20px tahoma";
		ctx.textBaseline = "top";
		ctx.textAlign = "left";
		ctx.globalAlpha = creditsAnimAlpha;
		ctx.fillText("Title: \"I am a Robot\"", 10, canvasHeight - 100);
		ctx.fillText("Artist: Ultrasyd", 10, canvasHeight - 75);
		ctx.fillText("ultrasyd.free.fr", 10, canvasHeight - 50);
		
		if(isCreditsAnimFadingOut === false)
		{
			creditsAnimAlpha += 0.01;
			if(creditsAnimAlpha >= 2)
			{
				isCreditsAnimFadingOut = true;
			}
		}
		else
		{
			creditsAnimAlpha -= 0.005;
			if(creditsAnimAlpha <= 0)
			{
				isDoingCreditsAnimation = false;
			}
		}
		
		ctx.restore();
	}	
	
	// Display FPS
	if(RenderFps) {		
		var actualFps = ~~(1000 / (now - lastFrameTime));
		ctx.save();
		ctx.fillStyle="#ffffff";		
		ctx.font="12px arial";
		ctx.textBaseline="top";		
		ctx.fillText("FPS: " + actualFps, 5, 5);		
		lastFrameTime = now;
	}
}

function renderGridToTexture()
{					
	cachedGridTexture = renderToCanvas(canvasWidth,canvasHeight,function(ctx) {		
		for(var i = 0; i < 15; ++i)
		{
			for(var j = 0; j < 23; ++j)
			{			
				var color = 110 + ~~(Math.random() * 108);				
				ctx.fillStyle = "rgba(" + ~~(color * redFactor) + "," +
								 ~~(color * greenFactor) +"," + 
								 ~~(color * blueFactor) + "," +
								  1.0 +")";
				ctx.strokeStyle = "#222222";				  
				ctx.fillRect(i * 22, j * 21, 22, 21);
				ctx.strokeRect(i * 22, j * 21, 22, 21);
			}
		}
		
		ctx.drawImage(bgImg,0,0);	
	});	
}

function switchScheme()
{
	var randomScheme = ~~(Math.random() * 6);
	
	switch(randomScheme)
	{
		case 0:
			redFactor = 1; greenFactor = 0.64; blueFactor = 0;
			break;
		case 1: 
	        redFactor = 1; greenFactor = 0.0; blueFactor = 0.64;
	        break;
	    case 2: 
	        redFactor = 0.64; greenFactor = 0.8; blueFactor = 0.0;
	        break;
	    case 3: 
	        redFactor = 0.0; greenFactor = 0.8; blueFactor = 0.64;
	        break;
	    case 4: 
	        redFactor = 0.0; greenFactor = 0.64; blueFactor = 1;
	        break;
	    case 5: 
	        redFactor = 0.64; greenFactor = 0.0; blueFactor = 1;
	        break;
	}
}

// Use JQuery to wait for document load
window.onload = function() {
	start();
}

function resourceLoaded()
{
	++resourcesLoaded;
}

function audioLoaded()
{
	isAudioLoaded = true;
	if(soundStatus === false)
	{
		document.getElementById('music').pause();
	}
}

function aboutClicked()
{	
	document.getElementById('desc').innerHTML = "	\
	Hi, my name is <b>Angelo Rohit</b>.				\
	I created this neon-themed game of snake as an HTML5 experiment and am rather pleased with the results!	\
	I hope you enjoy playing the game and would appreciate any feedback or suggestions sent to <a href=\"mailto:angelorohit@gmail.com\">angelorohit[at]gmail[dot]com</a>	\
	";
	
	document.getElementById('infocontent').style.top = "300px";
	document.getElementById('infocontent').style.opacity = "1.0";
}

function howtoplayClicked()
{	
	document.getElementById('desc').innerHTML = "	\
	Your objective is to collect as many dots as possible. The faster you get to a dot, the more score you get!	\
	Try not to be overzealous though, because if your snake collides with itself, it dies!	\
	<div>&nbsp;</div>									\
	<div>- Use the arrow keys to navigate.</div>			\
	<div>- 'P' pauses the game.</div>						\
	<div>- 'S' toggles sound.</div>						\
	";
	
	document.getElementById('infocontent').style.top = "260px";
	document.getElementById('infocontent').style.opacity = "1.0";	
}

function toggleSound()
{
	soundStatus = !soundStatus;
	if(isAudioLoaded === true)
	{
		if(soundStatus === false) {
			document.getElementById('music').pause();
			document.getElementById('soundbtn').innerHTML = 'Sound is OFF';
		}
		else
		{
			document.getElementById('music').play();
			document.getElementById('soundbtn').innerHTML = 'Sound is ON';
		}
	}
}

function closeInfoContent()
{
	document.getElementById('infocontent').style.opacity = "0";
}
