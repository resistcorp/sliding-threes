function TileGesture(_type){
	this.tiles = [];
	this.realTiles = [];
	this.moves = [];
	this.created = _.now();
	this.updated = _.now();
	this.lastTile = null;
	this.interval = 800;
	if(_type == TileGesture.KEYBOARD)
		this.lastTile = Tile.hole;
	this.type = _type;
}
TG = TileGesture;

TileGesture.prototype = {
	update : function(_now){
		var rate = false ? 30 : this.interval / this.moves.length,
			part = this.ended ? 1.0 : 0.0,//(_now - this.updated) / rate,
			move, index;
		if(part >= 1.0){
			//pop a move
			move = this.moves.shift();
			tile = this.tiles.shift();
			if(tile)
				tile.prepareMove(1.0);
			if(move){
				this.updated = _now;
				//this.interval *= .8;
				return move;
			}
			this.ended = true;
			this.lastTile = null;
			TG.Current = null;
			part = 1.0;
		}
		return part;
	},
	updateWithDirection : function(_dir, _tile){
		if(this.ended) return;
		var last = _.last(this.moves),
			tile = this.lastTile || Tile.hole,
			i;
		
		tile = tile.neighbors[Tile.DIRS.indexOf(_dir)];
		//tile is the tile to _dir from last tile
		if(tile){
			if(last && Tile.DIRS.indexOf(last) == 3- Tile.DIRS.indexOf(_dir)){
				this.moves.pop();
				this.tiles.pop().prepareMove(-1);
				this.lastTile = _.last(this.tiles);
				//if(this.moves.length == 0);
					//TG.Current = null;
				//return;
			}else{
				this.lastTile = tile;
				this.tiles.push(tile);
				this.moves.push(_dir);
				this.updated = _.now();
			}
			this.updateTiles();
			//tile.isHole = true;
		}
	},
	updateWithTile : function(_type, _tile, _x, _y, _eventType){
		if(_type == this.type){
			if(_tile){
				if(this.tiles.length == 1 && _tile == Tile.hole ){
					//remove last move
					this.tiles.pop();
				}else{
					if(this.tiles.length >= 2 && this.tiles[this.tiles.length-1] == _tile )
						//remove last move
						this.tiles.pop();
					else
						this.tiles.push(_tile);
					this.lastTile = _tile;
				}
				this.updated = _.now();
				this.updateTiles();
			}
		}else{
			//meh! on verra plus tard les cas spéciaux
		}
	},
	updateTiles : function(){
		for(i = 0; i < this.tiles.length; ++i){
			tile = this.tiles[i]
			if(Tile.hole != tile)
				tile.isHole = false;
			if(i == this.tiles.lastIndexOf(tile))
				tile.prepareMove( ( 1 + i ) / this.tiles.length);
		}
	},
	startAt : function(_x, _y){
	},
	endAt : function(_x, _y){
	}
}
TG.Init = function(_container){
	if(!TG.Ready){
		$(document.body).on("keydown keyup", TileGesture.ProcessEvent)
		$(_container).on("click", ".tile", TileGesture.ProcessEvent)
		$(_container).on("click", TileGesture.ProcessEvent)
		//$(_container).on("touchstart touchmove touchend", ".tile", Tile.handleTouch);
		//$(_container).on("mousedown mouseup mouseenter mousemove", ".tile", Tile.handleMouse);
		TG.Ready = true;
	}
	TG.Current = null;
}
TG.ProcessEvent = function(_e){
	var dir, tile, type, x, y, ret = true;
	switch(_e.type){
		case "keydown":
			type = TileGesture.KEYBOARD
			var dirs = Tile.invertedDirs
					? ['left','up','right','down']
					: ['right','down','left','up'];
			dir = dirs[event.keyCode - 37]; //arrows are keys 37-40
			if(event.keyCode == 13 && TG.Current){
				TG.Current.ended = true;
			}


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
			//if(TG.Current)
				//TG.Current.updated = _.now();
			break;
		case "click":
			var type = TileGesture.CLICK,
				target = _e.target,
				clickX = _e.offsetX / target.clientWidth,
				clickY = _e.offsetY / target.clientHeight;

			x = Math.floor(clickX  * (Tile.width + 2)) -1;
			y = Tile.height - Math.floor(clickY  * (Tile.height + 2));
			tile = Tile.get(x, y);
			console.log(x, y);
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
		if(!TG.Current)
			TG.Current = new TileGesture(type); // start new gesture

		if(dir)
			TG.Current.updateWithDirection(dir);
		else
			TG.Current.updateWithTile(type, tile, x, y, _e.type);
	}
	return ret;
}
TG.Current = null;
TG.CLICK = "click";
TG.TOUCH = "touch";
TG.KEYBOARD = "keyboard";