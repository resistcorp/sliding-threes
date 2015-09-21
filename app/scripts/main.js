$(function(){
	console.log('go');
	var container = $('#gameContainer'),
		width = 10, height = 10;
	Tile.Init(container,width,height)
	$("#dirCheck").on("change", Tile.swapDirs)
	$("#darkCheck").on("change", function() {
		$(document.body).toggleClass('dark', {dureation : 1000, easing : "easeOutSine", children: true})
	})
})
function Tile (){
	this.el = $('<div class="tile" />');
	this.el.data('tile', this);
	this.neighbors = [];
	this.moveList = [];
}
//Tile.prototype = $('<div class="tile" />');
Tile.prototype = {
	init : function(_x, _y, _avoid1, _avoid2){
		if(_avoid1 === true){
			this.tileColor = -1;
			this.el.addClass('hole');
			this.isHole = true;
			Tile.hole = this;
		}else{
			this.tileColor = Tile.getRandColor(_avoid1, _avoid2);
			this.el.addClass('color'+this.tileColor);
			this.isHole = false;
		}
		this.placeAt(_x, _y, true);
		return this;
	},
	release : function(){
		if(Tile.pool.indexOf(this) == -1)
			Tile.pool.push(this);
		var index = Tile.all.indexOf(this);
		if(index != -1)
			Tile.all.splice(index, 1);
	},
	moveTo : function(_x, _y){
		this.x = _x;
		this.y = _y;
		var up = this.update.bind(this, true, true);
		if(Tile.moving.indexOf(this) == -1)
			Tile.moving.push(this);
		return this.el.stop().animate({
				top: 5 + _y * 30 + 'px',
				left: 5 + _x * 30 + 'px'
			}, {
				duration : 250,
				complete : up
			});
	},
	placeAt: function(_x, _y, _noUpdate){
		if(_x == _x)
			this.x = _x;
		if(_y == _y)
			this.y = _y;
		this.el.css({
			top: 5 + _y * 30 + 'px',
			left: 5 + _x * 30 + 'px'
		});
		if(!_noUpdate)
			this.update();
	}, 
	update: function(_propagate,_checkRemovals){
		if(!this)
			console.log("error");
		var x = this.x,
			y = this.y,
			moves = this.neighbors,
			text = "", neighbour;
		if(_checkRemovals){
			var index = Tile.moving.indexOf(this);
			if(index != -1)
				Tile.moving.splice(index, 1);
			if(Tile.moving.length == 0)
				Tile.checkGrid();
		}
		while(moves.length){
			neighbour = moves.pop()
			if(_propagate && neighbour)
				neighbour.update(false)
		}
		moves = this.moveList;
		while(moves.length) moves.pop();
		if(x < Tile.width -1){
			neighbour = Tile.get(x +1, y);
			if(!neighbour)
				console.log("error");
			this.neighbors[2] = neighbour;
			if(neighbour.isHole){
				text = Tile.DIRS[0];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}
			_propagate && neighbour.update(false);
		}
		if(y > 0){
			neighbour = Tile.get(x, y -1);
			if(!neighbour)
				console.log("error");
			this.neighbors[3] = neighbour;
			if(neighbour.isHole){
				text = Tile.DIRS[1];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}
			_propagate && neighbour.update(false);
		}
		if(x > 0){
			neighbour = Tile.get(x -1, y);
			if(!neighbour)
				console.log("error");
			this.neighbors[0] = neighbour;
			if(neighbour.isHole){
				text = Tile.DIRS[2];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}
			_propagate && neighbour.update(false);
		}
		if(y < Tile.height -1){
			neighbour = Tile.get(x, y +1);
			if(!neighbour)
				console.log("error");
			this.neighbors[1] = neighbour;
			if(neighbour.isHole){
				text = Tile.DIRS[3];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}
			_propagate && neighbour.update(false);
		}
		this.moveList = moves;
		this.el.text(text);
	}
};
//Tile.COLORS = ["#F00", "#0F0", "#00F", "#FF0", "#0FF", "#F0F"];
Tile.numColors = 6;
Tile.DIRS = ["right","up","left","down"];

Tile.width = 10;
Tile.height = 10;
Tile.all = [];
Tile.pool = [];
Tile.moving = [];
Tile.get = function(_x,_y){
	if(_x >= Tile.width || _x < 0 )
		return null;
	return Tile.cols[_x][_y];
}
Tile.getRandColor = function(_avoid1, _avoid2){
	var num;
	do{
		num = (Math.random() * Tile.numColors) >>0
	}while(num == _avoid1 || num == _avoid2)
	return "" + num;
}
Tile.swapDirs = function(_val){
	if(_val && _val.type == "change")
		_val = _val.target.checked;
	if(_val)
		Tile.DIRTEXTS = {right : "►",up : "▲",left : "◄",down : "▼"};
	else
		Tile.DIRTEXTS = {right : "◄",up : "▼",left : "►",down : "▲"};
	Tile.invertedDirs = _val;
	for(var tile of Tile.all)
		tile.update()
}
Tile.checkGrid = function(){
	var currentColor = -1, group = [], groups = []
	for(var col of Tile.cols){
		for(var tile of col){
			if(tile.tileColor != currentColor){
				if(group.length >= 3){
					groups.push(group);
					group = [];
				}else{
					while(group.length)
						group.pop();
				}
				currentColor = tile.tileColor;
			}
			group.push(tile);
		}
	}
	for(var row of Tile.rows){
		for(tile of row){
			if(tile.tileColor != currentColor){
				if(group.length >= 3){
					groups.push(group);
					group = [];
				}else{
					while(group.length)
						group.pop();
				}
				currentColor = tile.tileColor;
			}
			group.push(tile);
		}
	}
	for(col of groups){
		for(tile of col)
			tile.el.effect("highlight");
	}
}
Tile.applyMoves = function(_moves){
	for(var move of _moves){
		move = Tile.DIRS.indexOf(move);
		var tile = Tile.hole.neighbors[move];
		if(tile){
			var x = Tile.hole.x,
				y = Tile.hole.y;
			Tile.cols[x][y] = tile
			Tile.rows[y][x] = tile
			x = tile.x;
			y = tile.y;
			Tile.cols[x][y] = Tile.hole;
			Tile.rows[y][x] = Tile.hole;
			tile.moveTo(Tile.hole.x,Tile.hole.y);
			Tile.hole.moveTo(x,y);
			if(!tile)
				console.log('error')
			tile.update(true);
		}
	}
}
Tile.Init = function(_container, _w, _h){
	var avoid1, avoid2, tile;
	_w = _w || Tile.width
	_h = _h || Tile.height
	Tile.width = _w;
	Tile.height = _h;
	_container = _container || $('#gameContainer')
	$(document.body).on("keydown", function( event ) {
			switch(event.keyCode){
				case 37:
					Tile.applyMoves([Tile.invertedDirs? 'left' : 'right']);
					break;
				case 38:
					Tile.applyMoves([Tile.invertedDirs? 'up' : 'down']);
					break;
				case 39:
					Tile.applyMoves([Tile.invertedDirs? 'right' : 'left']);
					break;
				case 40:
					Tile.applyMoves([Tile.invertedDirs? 'down' : 'up']);
					break;
			}
		})
	_container.on("click", ".tile", function( event ) {
			var tile = $(this).data('tile');
			console.log( tile.tileColor, tile.moveList );
			Tile.applyMoves(tile.moveList)
			event.stopPropagation();
		})
	Tile.cols = [];
	Tile.rows = [];
	var remove = Math.floor(Math.random() * _w * _h)
	for(var i= 0; i < _w; ++i){
		Tile.cols[i] = [];
		for(var j= 0; j < _h; ++j){
			if(i == 0)
				Tile.rows[j] = [];
			avoid1 = avoid2 = -1;
			if(remove == (_w * j + i)){
				remove = -1
				tile = new Tile();
				tile.init(i, j, true);
			}else{
				if(j > 1){
					tile = Tile.get(i,j-1);
					if(tile.tileColor == Tile.get(i,j-2).tileColor)
						avoid1 = tile.tileColor;
				}
				if(i > 1){
					tile = Tile.get(i-1,j);
					if(tile.tileColor == Tile.get(i-2,j).tileColor)
						avoid2 = tile.tileColor;
				}
				if(avoid1 == avoid2)
					avoid2 = -1;
				
				tile = new Tile();
				tile.init(i, j, avoid1, avoid2);
			}
			tile.el.appendTo(_container);
			Tile.cols[i][j] = tile;
			Tile.rows[j][i] = tile;
			Tile.all.push(tile);
		}
	}
	for(tile of Tile.all) tile.update()
	_container.css({
		width : (_w * 30 + 8) + 'px',
		height : (_h * 30 + 8) + 'px'
	})
}
Tile.swapDirs(false)