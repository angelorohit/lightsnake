/**
 * Utility routines
 * @author angelo
 */

// Renders a rectangle with rounded corners
CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
	if(width == 0 || height == 0) {
		this.beginPath();		
		this.closePath();
		return;
	}
	
	if( typeof radius === "undefined") {
		radius = 5;
	}
	this.beginPath();
	this.moveTo(x + radius, y);
	this.lineTo(x + width - radius, y);
	this.quadraticCurveTo(x + width, y, x + width, y + radius);
	this.lineTo(x + width, y + height - radius);
	this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	this.lineTo(x + radius, y + height);
	this.quadraticCurveTo(x, y + height, x, y + height - radius);
	this.lineTo(x, y + radius);
	this.quadraticCurveTo(x, y, x + radius, y);
	this.closePath();
}