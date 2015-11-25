function TileGesture(_type){
	this.tiles = [];
	this.realTiles = [];
	this.created = _.now();
	this.updated = _.now();
	this.type = _type;
}
TileGesture.prototype = {
	update : function(){
		
	},
	updateWith : function(_type, _tile, _dir, _x, _y, _eventType){
		if(_type != this.type){
			//meh! on verra plus tard les cas spéciaux
		}
		var updateFunc = this[_type + "Update"]
		updateFunc && updateFunc(_tile, _dir, _eventType, _x, _y);
		this.updated = _.now();
	},
	touchUpdate: function(_tile, _dir, _eventType, _x, _y){

	},
	keyboardUpdate: function(_tile, _dir){

	},
	clickUpdate: function(_tile){

	},
	startAt : function(_x, _y){
	},
	endAt : function(_x, _y){
	}
}
TileGesture.Init = function(_container){
	$(document.body).on("keydown keyup", TileGesture.ProcessEvent)
	$(_container).on("click", ".tile", TileGesture.ProcessEvent)
	$(_container).on("touchstart touchmove touchend", ".tile", Tile.handleTouch);
	$(_container).on("mousedown mouseup mouseenter mousemove", ".tile", Tile.handleMouse);
}
TileGesture.ProcessEvent = function(_e){
	var dir, tile, type, x, y;
	switch(_e.type){
		case "keydown":
			type = TileGesture.KEYBOARD
			var dirs = Tile.invertedDirs
					? ['left','up','right','down']
					: ['right','down','left','up'];
			dir = dirs[event.keyCode - 37]; //arrows are keys 37-40
			/*if(dir){
				if(Tile.currentGesture)
					tile = _.last(Tile.currentGesture.tiles);
				else
					tile = Tile.hole;
				tile = tile.neighbors[Tile.DIRS.indexOf(dir)];
				if(tile){
					dir = tile.el.prop("_gsTransform")
					Tile.updateGesture("0", tile, tile.x, tile.y, _e.type);
				}
			}*/
			break;
		case "keyup":
			type = TileGesture.KEYBOARD
			if(TileGesture.Current)
				TileGesture.Current.updated = _.now();
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
		case "touchmove":
		case "touchend":
			type = TileGesture.TOUCH
			var t = _e.originalEvent.touches[0];
			x = t.pageX;
			y = t.pageY;
			break;
		case "mousedown":
			type = TileGesture.TOUCH
			x = _e.pageX;
			y = _e.pageY;
			Tile.currentGesture = null;
			Tile.updateGesture(0, tile, _e.pageX, _e.pageY, "mouse");
		    _e.preventDefault();
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
		TileGesture.Current.updateWith(type, tile, dir, x, y, _e.type)
	}
	return false;
}
TileGesture.Current = null;
TileGesture.CLICK = "click";
TileGesture.TOUCH = "touch";
TileGesture.KEYBOARD = "keyboard";