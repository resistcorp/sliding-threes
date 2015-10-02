$(function() {
	console.log('go');
	var container = $('#gameContainer'),
		width = 8, height = 8;
	TweenMax.defaultOverwrite = "all";
	Tile.Init(container,width,height)
	$("#dirCheck").on("change", Tile.swapDirs)
	$("#darkCheck").on("change", function() {
		$(document.body).toggleClass('dark', {dureation : 1000, easing : "easeOutSine", children: true})
	});
	$(window).on('resize', $.debounce(500, Tile.resize));
	Tile.resize();
})
function Tile () {
	this.dirtyClass = ["true"]
	this.el = $('<div class="tile" />');
	this.child = $('<div />')
	this.el.append(this.child);
	this.el.data('tile', this);
	this.neighbors = Tile.giveMeAnArray();
	this.moveList = Tile.giveMeAnArray();
	this.class = [];
	this.addClass('tile');
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
		//this.el.addClass(this.class.join(' '));
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
			this.setText('');
		}
		return this;
	},
	removeClass: function(_str, _time) {
		var str, index;
		for(str of _str.split(" ")){
			index = this.class.indexOf(str);
			if(index != -1){
				this.class.splice(index, 1);
			}
		}
	},
	addClass: function(_str, _time) {
		var l = this.class.length;
		for(var str of _str.split(" "))
			if(str != "" && this.class.indexOf(str) == -1)
				this.class.push(str);
	},
	setText : function(_str){
		this.child.text(_str);
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
		//var up = this.arrive.bind(this);
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
		//this.el.stop();
		this.removeClass('up down left right isGroup almostGroup noGroup', 250);
		//this.el.addClass( this.class.join(' ') + " moving")
		return TweenMax.to(
			this.el, .5,
			{
				top: 5 + _y * 100 + 'px',
				left: 5 + _x * 100 + 'px',
				//duration : 500,
				className : this.class.join(' ') + " moving",
				onComplete : this.arrive,
				onCompleteScope : this,
				overwrite : "all"
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
		this.removeClass('moving');
		this.el.stop().css({
			top: 5 + _y * 100 + 'px',
			left: 5 + _x * 100 + 'px'
		});
		if(!_noUpdate)
			this.update();
	},
	arrive:function() {
		var index = Tile.moving.indexOf(this);
		if(index != -1)
			Tile.moving.splice(index, 1);
		this.moving = false;
		this.removeClass('moving');
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
				classes = classes.replace("right", "");
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
				classes = classes.replace("up", "");
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
				classes = classes.replace("left", "");
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
				classes = classes.replace("down", "");
				remClasses.push("down");
				if(!neighbor.isDirty) 
					groups.push(neighbor.group);
			}
		}
		this.removeClass(remClasses.join(' '));
		this.addClass(classes);
		this.group = groups.length? groups[0] : [];
		if(this.group.indexOf(this) == -1)
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
		this.setText(text);
		this.isDirty = false;
		Tile.releaseArray(remClasses);
		Tile.releaseArray(groups);
		group = this.class.join(' ');
		neighbor = this.el.prop('class');
		if(neighbor != group){
			this.dirtyClass = true;
			if(Tile.allDirtyClasses.indexOf(this) == -1)
				Tile.allDirtyClasses.push(this);
		}
	}
};
//Tile.COLORS = ["#F00", "#0F0", "#00F", "#FF0", "#0FF", "#F0F"];
Tile.numColors = 6;
Tile.DIRS = ["right","up","left","down"];

Tile.width = 8;
Tile.height = 8;
Tile.all = [];
Tile.pool = [];
Tile.groups = [];
Tile.arrayPool = [];
Tile.moving = [];
Tile.dirties = [];
Tile.allDirtyClasses = [];
Tile.threshold = 4;
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
	/*_tile2.update();
	_tile1.update();
	for(var tile of _tile2.neighbors)
		tile && tile.dirty();
	for(tile of _tile1.neighbors)
		tile && tile.dirty();*/
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
			//one!
			if(i==0)
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
	for(tile of Tile.all) tile.update();
		Tile.container = _container;
	Tile.containerWidth = (_w * 100 + 8);
	Tile.containerHeight = (_h * 100 + 8);
	_container.css({
		width : Tile.containerWidth + 'px',
		height : Tile.containerHeight + 'px'
	})
	Tile.Update();
}
Tile.resize = function(){
	var w = $(window).width() * .95,
		h = $(window).height() * .95,
		c = Tile.container,
		m = Tile.container.css('margin').replace(/px/g, "").split(' ').map(x=>+x);

	if(m[1] === undefined)
		m[1] = m[0]
	if(m[2] === undefined)
		m[2] = m[0]
	if(m[3] === undefined)
		m[3] = m[1]
	var wRatio = w / (Tile.containerWidth + m[1] + m[3]),
		hRatio = h / (Tile.containerHeight + m[0] + m[2]);
	TweenMax.to(Tile.container, .5, {scale: Math.min(wRatio, hRatio)});
}
Tile.sortByClass = function(_a, _b) {
	return _a.el.prop('class').length - _b.el.prop('class').length;
}
Tile.Update = function() {
	var tile, tile2, list, totest, group;
	var start = new Date().getTime();
	for(tile of Tile.dirties)
		tile.update();
	Tile.releaseArray(Tile.dirties);
	Tile.dirties = Tile.moving.concat();
	for(group of Tile.groups) {
		if(group.dirty){
			group.dirty = false;
			totest = true;
			if(group.length >= Tile.threshold){
				group.sort(Tile.sortByClass);
			}
			for(tile of group){
				if( group.length >= Tile.threshold){
					tile.removeClass('almostGroup noGroup');
					tile.addClass('isGroup');
					if(totest && tile.child.text() == ""){
						totest = false;
						tile.setText(group.length);
					}
				}else if( group.length > 1){
					tile.removeClass('isGroup noGroup');
					tile.addClass('almostGroup');
				}else{
					tile.removeClass('almostGroup isGroup');
					tile.addClass('noGroup')	
				}
			}
		}
	}
	requestAnimationFrame(Tile.Update);
	while(Tile.allDirtyClasses.length){
		if(new Date().getTime() > start + 25){
			return;
		}
		tile = Tile.allDirtyClasses.shift();
		if(!tile.moving && tile.dirtyClass){
			TweenMax.to(
				tile.el, .5,
				{
					className: tile.class.join(' ')
				}
			);
			tile.dirtyClass = false;
			/*requestAnimationFrame(Tile.Update);
			return;*/
		}
	}
}
Tile.swapDirs(false)