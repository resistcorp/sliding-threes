function TileGesture(){
	this.tiles = [];
	this.realTiles = [];
	this.created = _.now();
}
TileGesture.prototype = {
	update : function(){
		
	},
	updateWithTile : function(_tile){
		
	},
	startAt : function(_x, _y){
	},
	endAt : function(_x, _y){
	},
	updateWithDirection : function(_dir){

	}
}
TileGesture.Init = function(_container){
	$(document.body).on("keydown keyup", TileGesture.ProcessEvent)
	$(_container).on("click", ".tile", TileGesture.ProcessEvent)
	$(_container).on("touchstart touchmove touchend", ".tile", Tile.handleTouch);
	$(_container).on("mousedown mouseup mouseenter mousemove", ".tile", Tile.handleMouse);
}
TileGesture.ProcessEvent = function(_e){
	var dir, tile, type;
	switch(_e.type){
		case "keydown":
			type = TileGesture.KEYBOARD
			var dirs = Tile.invertedDirs
					? ['left','up','right','down']
					: ['right','down','left','up'];
			dir = dirs[event.keyCode - 37]; //arrows are keys 37-40
			/*switch(event.keyCode) {
				case 37:
					dir = Tile.invertedDirs? 'left' : 'right';
					break;
				case 38:
					dir = Tile.invertedDirs? 'up' : 'down';
					break;
				case 39:
					dir = Tile.invertedDirs? 'right' : 'left';
					break;
				case 40:
					dir = Tile.invertedDirs? 'down' : 'up';
					break;
			}*/
			if(dir){
				if(Tile.currentGesture)
					tile = _.last(Tile.currentGesture.tiles);
				else
					tile = Tile.hole;
				tile = tile.neighbors[Tile.DIRS.indexOf(dir)];
				if(tile){
					dir = tile.el.prop("_gsTransform")
					Tile.updateGesture("0", tile, tile.x, tile.y, _e.type);
				}
			}
			break;
		case "keyup":
			type = TileGesture.KEYBOARD
			if(TileGesture.Current)
				TileGesture.Current.lastUpdated = _.now();
			break;
		case "click":
			type = TileGesture.CLICK
			tile = $(this).data('tile');
			console.log( tile.tileColor, tile.moveList );
			Tile.applyMoves(tile.moveList);
			Tile.currentGesture = null;
			//TODO
			event.stopPropagation();
			break;
		case "touchstart":
			type = TileGesture.TOUCH
			break;
		case "touchmove":
			type = TileGesture.TOUCH
			break;
		case "touchend":
			type = TileGesture.TOUCH
			break;
		case "mousedown":
			Tile.currentGesture = null;
			Tile.updateGesture(0, tile, _e.pageX, _e.pageY, "mouse");
		    _e.preventDefault();
		    return false;
			break;
		case "mousemove":
			if(Tile.currentGesture){
				Tile.updateGesture(0, tile, _e.pageX, _e.pageY, "mouse");
			    _e.preventDefault();
			    return false;
			}
			break;
		case "mouseenter":
			if(Tile.currentGesture)
				Tile.updateGesture(0, tile, _e.pageX, _e.pageY, "mouse");
			break;
		case "mouseup":
			if(Tile.currentGesture)
				Tile.endGesture(0, tile, _e.pageX, _e.pageY);
			break;
	}
	if(dir || tile){
		if(!TileGesture.Current)
			TileGesture.Current = new TileGesture;
	}
}
TileGesture.Current = null;
TileGesture.CLICK = "click";
TileGesture.TOUCH = "touch";
TileGesture.KEYBOARD = "keyboard";