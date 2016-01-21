function TileGesture(_type){
	this.tiles = [];
	this.realTiles = [];
	this.created = _.now();
	this.updated = _.now();
	this.lastTile = null;
	this.interval = 1500;
	if(_type == TileGesture.KEYBOARD)
		this.lastTile = Tile.hole;
	this.type = _type;
}
TileGesture.prototype = {
	update : function(_now){
		var part = (_now - this.updated) / this.interval,
			tile;
		if(part >= 1.0){
			//pop a move
			tile = this.realTiles;
			this.updated = _now;
		}
		return part;
	},
	updateWith : function(_type, _tile, _dir, _x, _y, _eventType){
		if(_type != this.type){
			//meh! on verra plus tard les cas spéciaux
		}
		//var updateFunc = this[_type + "Update"]
		//updateFunc && updateFunc(_tile, _dir, _eventType, _x, _y);
		if(_tile){
			if(_tile == _.last(this.realTiles)){
				//remove last move
				this.realTiles.pop();
			}else{
				this.realTiles.push(this.lastTile);
			}
			this.lastTile = _tile;
		}
		this.updated = _.now();
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
	var dir, tile, type, x, y, ret = true;
	switch(_e.type){
		case "keydown":
			type = TileGesture.KEYBOARD
			var dirs = Tile.invertedDirs
					? ['left','up','right','down']
					: ['right','down','left','up'];
			dir = dirs[event.keyCode - 37]; //arrows are keys 37-40
			if(!this.lastTile)
				this.lastTile = Tile.hole;
			tile = this.lastTile.neighbors[Tile.DIRS.indexOf(dir)];

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
			/*Tile.applyMoves(tile.moveList);
			Tile.currentGesture = null;*/
			//TODO
			event.stopPropagation();
			break;
		case "touchmove":
			ret = false;
		case "touchstart":
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
			TileGesture.Current = new TileGesture(type);
		TileGesture.Current.updateWith(type, tile, dir, x, y, _e.type)
	}
	return ret;
}
TileGesture.Current = null;
TileGesture.CLICK = "click";
TileGesture.TOUCH = "touch";
TileGesture.KEYBOARD = "keyboard";