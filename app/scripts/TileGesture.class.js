function TileGesture(){
	this.tiles = [];
	this.realTiles = [];
	this.created = _.now();
}
TileGesture.prototype = {
	update : function(){
		
	},
	updateWithTile : function(){
		
	},
	updateWithDirection : function(){

	}
}
TileGesture.CLICK = "click";
TileGesture.TOUCH = "touch";
TileGesture.KEYBOARD = "keyboard";