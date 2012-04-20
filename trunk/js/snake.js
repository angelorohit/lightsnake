
/*
 Copyright (c) 2011 Angelo Rohit Joseph Pulikotil
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * Snake
 * @author Angelo
 */

var MOVEDIRECTION_UP = 0;
var MOVEDIRECTION_DOWN = 1;
var MOVEDIRECTION_LEFT = 2;
var MOVEDIRECTION_RIGHT = 3;
	
function Snake()
{
	var snakeCellImg;	
	var speed;
	var moveMade;		
	
	var pickupImg;
	var pickupTilePos = {x:0,y:0};
	var isPickupVisible;
	var lastPickupSpawnTime;
	
	var snakeBlockArr = new Array();
	var junctureArr = new Array();
	
	this.init = function()
	{		
		snakeCellImg = new Image();
		snakeCellImg.onload = resourceLoaded();
		snakeCellImg.src = "resources/snakecell.png";
		
		pickupImg = new Image();
		pickupImg.onload = resourceLoaded();
		pickupImg.src = "resources/pickup1.png";
	
		this.reset();					
	}
	
	this.reset = function()
	{
		snakeBlockArr.length = 0;
		junctureArr.length = 0;	
		this.increaseLength();	
		isPickupVisible = false;
		speed = 0.05;
	}
	
	this.draw = function(ctx)
	{				
		if(isPickupVisible === true)
		{
			ctx.drawImage(pickupImg, pickupTilePos.x * 22 - 4, pickupTilePos.y * 21 - 4);
		}
		
		for(var i = 0; i < snakeBlockArr.length; ++i)
		{
			ctx.drawImage(snakeCellImg, snakeBlockArr[i].tilePos.x * 22 - 2, snakeBlockArr[i].tilePos.y * 21 - 2);
		}
	}
	
	function checkPickupCollision()
	{
		if(snakeBlockArr.length > 0)
		{
			var headTilePos = snakeBlockArr[0].tilePos;
			if(Math.round(headTilePos.x) === Math.round(pickupTilePos.x) && Math.round(headTilePos.y) === Math.round(pickupTilePos.y))
			{
				return true;
			}
		}
		
		return false;
	}

	this.update = function()
	{
		updateCellPositions();
		updateCellDirections();
			
		if(checkPickupCollision() === true)
		{
			isPickupVisible = false;						
			
			// Calculate gain score.
	        var timeBonus = 3000 - (new Date() - lastPickupSpawnTime);        
	        if( timeBonus <= 0 )
	            timeBonus = 1;
	
	        var totalGain = timeBonus * snakeBlockArr.length;
	        
	        doGainAnimation(totalGain, pickupTilePos.x * 22 - 4, pickupTilePos.y * 21 - 4);
	        
	        increaseScoreBy(totalGain);
	        this.increaseLength();
	        this.increaseSpeedBy(0.001);
		}
		
		if(isPickupVisible === false)
		{
			spawnPickup();			
		}		
	}
	
	this.increaseSpeedBy = function(value)
	{
		speed += value;
	}
	
	this.setDirection = function(moveDir)
	{
		if(snakeBlockArr.length === 0)
			return;
		
		var currentMoveDir = snakeBlockArr[0].moveDirection;
		if(currentMoveDir === moveDir)
			return;
					
		if( 
	        (
	        ((moveDir === MOVEDIRECTION_UP || moveDir === MOVEDIRECTION_DOWN) &&
	        (currentMoveDir === MOVEDIRECTION_LEFT || currentMoveDir === MOVEDIRECTION_RIGHT))
	        ||
	        ((moveDir === MOVEDIRECTION_LEFT || moveDir === MOVEDIRECTION_RIGHT) &&
	        (currentMoveDir === MOVEDIRECTION_UP || currentMoveDir === MOVEDIRECTION_DOWN))
	        )
	        &&
	        (moveMade)
	      )
	      {
	      	var headTilePos = snakeBlockArr[0].tilePos;
	      	var junctureInfo = new Object();
	      	junctureInfo.tilePos = new Object();
	      	junctureInfo.tilePos.x = Math.round(headTilePos.x);
	      	junctureInfo.tilePos.y = Math.round(headTilePos.y);
	      	junctureInfo.moveDirection = moveDir;
	      	junctureArr.push(junctureInfo);
	      	
	      	updateCellDirections();
	      	moveMade = false;	     
	      }	      
	}
	
	function updateCellDirections()
	{
		for(var i = 0; i < snakeBlockArr.length; ++i)
		{
			var cellPositionX = Math.round(snakeBlockArr[i].tilePos.x);
			var cellPositionY = Math.round(snakeBlockArr[i].tilePos.y);
			for(var j = 0; j < junctureArr.length; ++j)
			{
				if(junctureArr[j].tilePos.x === cellPositionX && junctureArr[j].tilePos.y === cellPositionY)
				{
					snakeBlockArr[i].moveDirection = junctureArr[j].moveDirection;
					
					if( i === snakeBlockArr.length - 1)
					{
						junctureArr.splice(j,1);
						break;
					}
				}
			}
		}
	}
	
	function updateCellPositions()
	{
		var actualSpeed = speed;
		for(var i = 0; i < snakeBlockArr.length; ++i)
		{							
			if(i > 0)
			{		
				var currentTilePos = snakeBlockArr[i].tilePos;
				var lastTilePos = snakeBlockArr[i - 1].tilePos;
				var currentMoveDir = snakeBlockArr[i].moveDirection;
				var lastMoveDir = snakeBlockArr[i - 1].moveDirection;
									
				if( Math.round(currentTilePos.x) === Math.round(lastTilePos.x) &&
	                Math.round(currentTilePos.y) === Math.round(lastTilePos.y) )
	            {                   
	                actualSpeed *= 0.1;
	            }                 
	            else if( currentMoveDir === lastMoveDir )
	            {
	                if( lastMoveDir === MOVEDIRECTION_UP )
	                {
	                    if( currentTilePos.y < lastTilePos.y - 1 )
	                    {
	                        actualSpeed *= 1.01;
	                    }
	                }
	                else if( lastMoveDir === MOVEDIRECTION_DOWN )
	                {
	                    if( currentTilePos.y > lastTilePos.y + 1 )
	                    {
	                        actualSpeed *= 1.01;
	                    }
	                }
	                else if( lastMoveDir === MOVEDIRECTION_RIGHT )
	                {
	                    if( currentTilePos.x < lastTilePos.x - 1 )
	                    {
	                        actualSpeed *= 1.01;
	                    }
	                }
	                else if( lastMoveDir === MOVEDIRECTION_LEFT )
	                {
	                    if( currentTilePos.x > lastTilePos.x + 1 )
	                    {
	                        actualSpeed *= 1.01;
	                    }
	                }
	            } 
			}
	
					
			var oldTilePosX = 
	            Math.round(snakeBlockArr[i].tilePos.x);
	        var oldTilePosY = 
	            Math.round(snakeBlockArr[i].tilePos.y);
						
	        switch(snakeBlockArr[i].moveDirection)
	        {
	        case MOVEDIRECTION_UP:
	            snakeBlockArr[i].tilePos.y -= actualSpeed;
	            snakeBlockArr[i].tilePos.x = Math.round(snakeBlockArr[i].tilePos.x);            
	            break;
	        case MOVEDIRECTION_DOWN:
	            snakeBlockArr[i].tilePos.y += actualSpeed;
	            snakeBlockArr[i].tilePos.x = Math.round(snakeBlockArr[i].tilePos.x);            
	            break;
	        case MOVEDIRECTION_RIGHT:
	            snakeBlockArr[i].tilePos.x += actualSpeed;
	            snakeBlockArr[i].tilePos.y = Math.round(snakeBlockArr[i].tilePos.y);            
	            break;
	        case MOVEDIRECTION_LEFT:
	            snakeBlockArr[i].tilePos.x -= actualSpeed;
	            snakeBlockArr[i].tilePos.y = Math.round(snakeBlockArr[i].tilePos.y);            
	            break;
	        }  	                                   
	        
	        if( snakeBlockArr[i].tilePos.y > 23 - 1 )
	        {
	            snakeBlockArr[i].tilePos.y = 0;
	        }
	        else if( snakeBlockArr[i].tilePos.y < 0 )
	        {
	            snakeBlockArr[i].tilePos.y = 23 - 1;
	        }      
	        
	        if( snakeBlockArr[i].tilePos.x > 15 - 1 )
	        {
	            snakeBlockArr[i].tilePos.x = 0;
	        }
	        else if( snakeBlockArr[i].tilePos.x < 0 )
	        {
	            snakeBlockArr[i].tilePos.x = 15 - 1;
	        }        
	        
	        var newTilePosX = 
	            Math.round(snakeBlockArr[i].tilePos.x);
	        var newTilePosY = 
	            Math.round(snakeBlockArr[i].tilePos.y);
	
	        // Check whether a move was made.
	        if( !moveMade && i === 0 &&
	            (oldTilePosX != newTilePosX || oldTilePosY != newTilePosY) )
	        {
	            moveMade = true;   
	        }	        
		}
	}
	
	this.increaseLength = function()
	{		
		var cellInfo = new Object();				
		if(snakeBlockArr.length === 0)
		{
			cellInfo.moveDirection = MOVEDIRECTION_DOWN;
			cellInfo.tilePos = {x:8,y:8};
		}
		else
	    {	    		    		    		    	 	
	        // Tack onto the end of the snake.	        
	        var lastTilePos = snakeBlockArr[snakeBlockArr.length - 1].tilePos;	        
	        var lastMoveDir = snakeBlockArr[snakeBlockArr.length - 1].moveDirection;
	        cellInfo.moveDirection = lastMoveDir;	  
	        cellInfo.tilePos = new Object();      
	        
	        switch(lastMoveDir)
	        {
	        case MOVEDIRECTION_UP:
	            cellInfo.tilePos.x = lastTilePos.x;
	            cellInfo.tilePos.y = lastTilePos.y + 1;
	            break;
	        case MOVEDIRECTION_DOWN:	   	
	        	cellInfo.tilePos.x = lastTilePos.x;
	            cellInfo.tilePos.y = lastTilePos.y - 1;	            
	            break;
	        case MOVEDIRECTION_LEFT:
	        	cellInfo.tilePos.x = lastTilePos.x + 1;
	            cellInfo.tilePos.y = lastTilePos.y;     
	            break;
	        case MOVEDIRECTION_RIGHT:
	            cellInfo.tilePos.x = lastTilePos.x - 1;
	            cellInfo.tilePos.y = lastTilePos.y;
	            break;
	        }     
	    }	    	   
				
		if( cellInfo.tilePos.y > 23 - 1 )
	    {
	        cellInfo.tilePos.y = 0;
	    }
	    else if( cellInfo.tilePos.y < 0 )
	    {
	        cellInfo.tilePos.y = 23 - 1;
	    }      
	        
	    if( cellInfo.tilePos.x > 15 - 1 )
	    {
	        cellInfo.tilePos.x = 0;
	    }
	    else if( cellInfo.tilePos.x < 0 )
	    {
	        cellInfo.tilePos.x = 15 - 1;
	    }     
	    
	    snakeBlockArr.push(cellInfo);   
	}

	function spawnPickup()
	{
		// Find a new tile to spawn the pick up. 
		// Just make sure that it doesn't spawn anywhere in the body of the snakeblocks.
		var tilesToPickFrom = new Array();		
		for(var i = 0; i < 15; ++i)
		{
			for(var j = 0; j < 23; ++j)
			{
				var noIncludeTile = false;
				for(var k = 0; k < snakeBlockArr.length; ++k)
				{
					if(
						( 
							Math.round(snakeBlockArr[k].tilePos.x) === i ||
							~~(snakeBlockArr[k].tilePos.x) === i ||
							Math.ceil(snakeBlockArr[k].tilePos.x) === i
						) &&
						(
							Math.round(snakeBlockArr[k].tilePos.y) === j ||
							~~(snakeBlockArr[k].tilePos.y) === j ||
							Math.ceil(snakeBlockArr[k].tilePos.y) === j
						)
					)
					{
						noIncludeTile = true;
						
						break;
					}
				}
				
				if(noIncludeTile === false)
				{
					var tilePos = {x:i,y:j};
					tilesToPickFrom.push(tilePos);
				}
			}
		}							
		
		var tileIndex = ~~(Math.random() * tilesToPickFrom.length);			
		
		pickupTilePos.x = tilesToPickFrom[tileIndex].x
		pickupTilePos.y = tilesToPickFrom[tileIndex].y;
		
		lastPickupSpawnTime = new Date();
		isPickupVisible = true;
	}

	this.checkCollision = function()
	{
		if(snakeBlockArr.length > 3)
		{			
			var headTilePos = snakeBlockArr[0].tilePos;
			for(var i = 3; i < snakeBlockArr.length; ++i)
			{
				if(	
					Math.round(headTilePos.x) === Math.round(snakeBlockArr[i].tilePos.x) &&
					Math.round(headTilePos.y) === Math.round(snakeBlockArr[i].tilePos.y)
				)
				{					
					return true;
				}
			}
		}
		
		return false;
	}
}
