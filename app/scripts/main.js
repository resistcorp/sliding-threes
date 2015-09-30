$(function() {
	console.log('go');
	var container = $('#gameContainer'),
		width = 10, height = 10;
	Tile.Init(container,width,height)
	$("#dirCheck").on("change", Tile.swapDirs)
	$("#darkCheck").on("change", function() {
		$(document.body).toggleClass('dark', {dureation : 1000, easing : "easeOutSine", children: true})
	})
})
function Tile () {
	this.el = $('<div class="tile" />');
	this.el.data('tile', this);
	this.neighbors = Tile.giveMeAnArray();
	this.moveList = Tile.giveMeAnArray();
	this.class = [];
	this.addClass('tile');
	this.dirtyClass = "true"
	this.isDirty = true;
}
//Tile.prototype = $('<div class="tile" />');
Tile.prototype = {
	init : function(_x, _y, _avoid1, _avoid2) {
		if(_avoid1 === true) {
			this.tileColor = -1;
			this.addClass('hole');
			this.isHole = true;
			Tile.hole = this;
		}else{
			this.tileColor = Tile.getRandColor(_avoid1, _avoid2);
			this.addClass('color'+this.tileColor);
			this.isHole = false;
		}
		this.placeAt(_x, _y, true);
		this.dirty();
		return this;
	},
	dirty: function() {
		if(!this.isDirty) {
			this.isDirty = true;
			var index = Tile.dirties.indexOf(this);
			if(index == -1)
				Tile.dirties.push(this);
			if(this.group)
				while(this.group.length){
					var tile = this.group.pop();
					if(tile !== this)
						tile.group = null;
					tile.dirty();
				}
			index = Tile.groups.indexOf(this.group);
			if(index != -1)
				Tile.groups.splice(index, 1);
			this.group = null;
			this.el.text('');
		}
		return this;
	},
	removeClass: function(_str, _time) {
		var str, index;
		for(str of _str.split(" "))
			index = this.class.indexOf(str)
			if(index != -1){
				this.dirtyClass += str;
				this.class.splice(index, 1);
			}
		if(this.dirtyClass && Tile.allDirtyClasses.indexOf(this) == -1)
			Tile.allDirtyClasses.push(this)
	},
	addClass: function(_str, _time) {
		var l = this.class.length;
		for(var str of _str.split(" "))
			if(str != "" && this.class.indexOf(str) == -1)
				this.class.push(str);
		if(this.class.length != l){
		this.dirtyClass += "true";
			if(Tile.allDirtyClasses.indexOf(this) == -1)
				Tile.allDirtyClasses.push(this)
		}
	},
	release : function() {
		if(Tile.pool.indexOf(this) == -1)
			Tile.pool.push(this);
		var index = Tile.all.indexOf(this);
		if(index != -1)
			Tile.all.splice(index, 1);
	},
	moveTo : function(_x, _y) {
		this.x = _x;
		this.y = _y;
		var up = this.arrive.bind(this, true, true);
		if(Tile.moving.indexOf(this) == -1)
			Tile.moving.push(this);
		this.dirty();
		this.moving = true;
		for(var i = 0; i < 4; ++i){
			var tile = this.neighbors[i];
			if(tile && tile.dirty())
				tile.neighbors[tile.neighbors.indexOf(this)] = null;
			this.neighbors[i] = null;
		}
		return this.el.stop().animate({
				top: 5 + _y * 30 + 'px',
				left: 5 + _x * 30 + 'px'
			}, {
				duration : 250,
				complete : up
			});
	},
	placeAt: function(_x, _y, _noUpdate) {
		if(_x == _x)
			this.x = _x;
		if(_y == _y)
			this.y = _y;
		for(var i = 0; i < 4; ++i){
			var tile = this.neighbors[i];
			if(tile && tile.dirty())
				tile.neighbors[tile.neighbors.indexOf(this)] = null;
			this.neighbors[i] = null;
		}
		this.el.css({
			top: 5 + _y * 30 + 'px',
			left: 5 + _x * 30 + 'px'
		});
		if(!_noUpdate)
			this.update();
	},
	arrive:function() {
		var index = Tile.moving.indexOf(this);
		if(index != -1)
			Tile.moving.splice(index, 1);
		this.moving = false;
		this.dirty();
	},
	update: function() {
		//if(this.moving && ! this.isHole)
			//return;
		var x = this.x,
			y = this.y,
			moves = this.moveList,
			groups = Tile.giveMeAnArray(),
			classes = "up left right down",
			remClasses = [],
			text = "", neighbor;
		this.moveList.length = 0;
		this.neighbors.length = 0;
		if(x < Tile.width -1) {
			neighbor = Tile.get(x +1, y);
			this.neighbors[2] = neighbor;
			neighbor.neighbors[0] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[0];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}else if(neighbor.tileColor == this.tileColor){
				classes.replace("right", "");
				remClasses.push("right");
				if(!neighbor.isDirty) 
					groups.push(neighbor.group);
			}
		}
		if(y > 0) {
			neighbor = Tile.get(x, y -1);
			this.neighbors[3] = neighbor;
			neighbor.neighbors[1] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[1];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}else if(neighbor.tileColor == this.tileColor){
				classes.replace("up", "");
				remClasses.push("up");
				if(!neighbor.isDirty) 
					groups.push(neighbor.group);
			}
		}
		if(x > 0) {
			neighbor = Tile.get(x -1, y);
			this.neighbors[0] = neighbor;
			neighbor.neighbors[2] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[2];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}else if(neighbor.tileColor == this.tileColor){
				classes.replace("left", "");
				remClasses.push("left");
				if(!neighbor.isDirty) 
					groups.push(neighbor.group);
			}
		}
		if(y < Tile.height -1) {
			neighbor = Tile.get(x, y +1);
			this.neighbors[1] = neighbor;
			neighbor.neighbors[3] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[3];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
			}else if(neighbor.tileColor == this.tileColor){
				classes.replace("down", "");
				remClasses.push("down");
				if(!neighbor.isDirty) 
					groups.push(neighbor.group);
			}
		}
		this.addClass(classes);
		this.removeClass(remClasses.join(' '));
		this.group = groups.length? groups[0] : []
		this.group.push(this);
		while(groups.length > 0) {
			var group = groups.pop();
			if(group != this.group && groups.indexOf(group) == -1) {//treat each one, once
				for(var tile of group)
					if(this.group.indexOf(tile) == -1)
						this.group.push(tile);
				Tile.releaseArray(group);
				var index = Tile.groups.indexOf(group);
				if(index != -1)
					Tile.groups.splice(index, 1);
			}
		}
		for(var tile of this.group){
			tile.group = this.group;
		}
		Tile.groups.push(this.group);
		this.group.dirty = true;
		this.el.text(text);
		this.isDirty = false;
		Tile.releaseArray(remClasses);
		Tile.releaseArray(groups);
	}
};
//Tile.COLORS = ["#F00", "#0F0", "#00F", "#FF0", "#0FF", "#F0F"];
Tile.numColors = 6;
Tile.DIRS = ["right","up","left","down"];

Tile.width = 10;
Tile.height = 10;
Tile.all = [];
Tile.pool = [];
Tile.groups = [];
Tile.arrayPool = [];
Tile.moving = [];
Tile.dirties = [];
Tile.allDirtyClasses = [];
const 	left = 0,
		down = 1,
		right = 2,
		up = 3;
Tile.get = function(_x,_y) {
	if(_x >= Tile.width || _x < 0 )
		return null;
	return Tile.cols[_x][_y];
}
Tile.giveMeAnArray = function() {
	if(Tile.arrayPool.length)
		return Tile.arrayPool.pop();
	return [];
}
Tile.releaseArray = function(_array) {
	_array.length = 0;
	if(Tile.arrayPool.indexOf(_array) == -1)
		Tile.arrayPool.push(_array);
}
Tile.getRandColor = function(_avoid1, _avoid2) {
	var num;
	do{
		num = (Math.random() * Tile.numColors) >>0
	}while(num == _avoid1 || num == _avoid2)
	return "" + num;
}
Tile.swapDirs = function(_val) {
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
/*Tile.checkGrid = function() {
	var currentColor = -1, group = [], groups = []
	for(var col of Tile.cols) {
		for(var tile of col) {
			if(tile.tileColor != currentColor) {
				if(group.length >= 3) {
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
	for(var row of Tile.rows) {
		for(tile of row) {
			if(tile.tileColor != currentColor) {
				if(group.length >= 3) {
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
	for(col of groups) {
		for(tile of col)
			tile.el.effect("highlight");
	}
}*/
Tile.applyMoves = function(_moves) {
	for(var move of _moves) {
		move = Tile.DIRS.indexOf(move);
		var tile = Tile.hole.neighbors[move];
		if(tile) {
			Tile.swap(tile, Tile.hole);
			/*var x = Tile.hole.x,
				y = Tile.hole.y;
			Tile.cols[x][y] = tile
			Tile.rows[y][x] = tile
			x = tile.x;
			y = tile.y;
			Tile.cols[x][y] = Tile.hole;
			Tile.rows[y][x] = Tile.hole;
			tile.moveTo(Tile.hole.x,Tile.hole.y);
			Tile.hole.moveTo(x,y);
			tile.update(true);*/
		}
	}
}
Tile.swap = function(_tile1, _tile2) {
	var x = _tile2.x,
		y = _tile2.y;
	Tile.cols[x][y] = _tile1
	Tile.rows[y][x] = _tile1
	x = _tile1.x;
	y = _tile1.y;
	Tile.cols[x][y] = _tile2;
	Tile.rows[y][x] = _tile2;
	_tile1.moveTo(_tile2.x,_tile2.y);
	_tile2.moveTo(x,y);
	_tile2.update();
	_tile1.update();
	for(var tile of _tile2.neighbors)
		tile && tile.dirty();
	for(tile of _tile1.neighbors)
		tile && tile.dirty();
}
Tile.Init = function(_container, _w, _h) {
	var avoid1, avoid2, tile;
	_w = _w || Tile.width
	_h = _h || Tile.height
	Tile.width = _w;
	Tile.height = _h;
	_container = _container || $('#gameContainer')
	$(document.body).on("keydown", function( event ) {
			switch(event.keyCode) {
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
	for(var i= 0; i < _w; ++i) {
		Tile.cols[i] = [];
		for(var j= 0; j < _h; ++j) {
			if(i == 0)
				Tile.rows[j] = [];
			avoid1 = avoid2 = -1;
			if(remove == (_w * j + i)) {
				remove = -1
				tile = new Tile();
				tile.init(i, j, true);
			}else{
				if(j > 1) {
					tile = Tile.get(i,j-1);
					if(tile.tileColor == Tile.get(i,j-2).tileColor)
						avoid1 = tile.tileColor;
				}
				if(i > 1) {
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
	Tile.Update();
}
Tile.Update = function() {
	var tile, tile2, list, totest, group;
	var start = new Date().getTime();
	for(tile of Tile.dirties)
		tile.update();
	Tile.releaseArray(Tile.dirties);
	Tile.dirties = Tile.moving.concat();
	for(group of Tile.groups) {
		if(group.dirty)
			group.dirty = false;
			for(tile of group){
				if( group.length > 3){
					tile.removeClass('almostGroup noGroup');
					tile.addClass('isGroup');
					if(tile.el.text() == "")
						tile.el.text(group.length);
				}else if( group.length > 1){
					tile.removeClass('isGroup noGroup');
					tile.addClass('almostGroup');
				}else{
					tile.removeClass('almostGroup isGroup');
					tile.addClass('noGroup')	
				}
			}
	}
	/*list = Tile.all.concat();
	totest = [];
	while(list.length > 0) {
		tile = list.pop();
		totest.push(tile);
		var group = [tile];
		var col = tile.color;
		tile.removeClass("isGroup left right up down");
		while(totest.length > 0) {
			tile = totest.pop();
			tile2 = tile.neighbors[up];
			if(tile2 && tile2.tileColor == col) {
				if(list.indexOf(tile2) != -1) {
					list.splice(list.indexOf(tile2), 1)
					totest.push(tile2)
					group.push(tile2)
				}else{
					tile.addClass('up')
				}
			}
			tile2 = tile.neighbors[down];
			if(tile2 && tile2.tileColor == col) {
				if(list.indexOf(tile2) != -1) {
					list.splice(list.indexOf(tile2), 1)
					totest.push(tile2)
					group.push(tile2)
				}else{
					tile.addClass('down')
				}
			}
			tile2 = tile.neighbors[down];
			if(list.indexOf(tile2) != -1) {
				list.splice(list.indexOf(tile2), 1)
				if(tile2 && tile2.tileColor == col) {
					totest.push(tile2)
					group.push(tile2)
				}else{
					tile.addClass('right')
				}
			}
			tile2 = tile.neighbors[down];
			if(list.indexOf(tile2) != -1) {
				list.splice(list.indexOf(tile2), 1)
				if(tile2 && tile2.tileColor == col) {
					totest.push(tile2)
					group.push(tile2)
				}else{
					tile.addClass('left')
				}
			}
		}
		if(group.length > 3)
			for(tile of group) tile.el.addClass('isGroup')
	}*/
	while(Tile.allDirtyClasses.length){
		tile = Tile.allDirtyClasses.shift();
		if(tile.dirtyClass != ""){
			tile.el.removeClass(tile.dirtyClass);
			tile.dirtyClass = "";
			tile.el.addClass(tile.class.join(' '), 500)
			requestAnimationFrame(Tile.Update);
			return;
		}
	}
	requestAnimationFrame(Tile.Update);
}
Tile.swapDirs(false)