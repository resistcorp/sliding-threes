function Tile () {
	this.dirtyClass = ["true"]
	this.el = $('<div class="tile" />');
	this.child = $('<div class="dead" />')
	this.el.append(this.child);
	this.el.data('tile', this);
	this.child.data('tile', this);
}
//Tile.prototype = $('<div class="tile" />');
Tile.prototype = {
	init : function(_x, _y, _avoid1, _avoid2) {
		this.neighbors = Tile.giveMeAnArray();
		this.moveList = Tile.giveMeAnArray();
		this.class = Tile.giveMeAnArray();
		this.addClass('tile');
		if(_avoid1 === true) {
			this.tileColor = -1;
			this.addClass('hole');
			this.isHole = true;
			Tile.hole = this;
		}else{
			this.tileColor = Tile.getRandColor(_avoid1, _avoid2);
			this.isHole = false;
		}
		this.classColor = 'color'+this.tileColor;
		this.addClass(this.classColor);
		this.placeAt(_x, _y, true);
		this.dirty();
		this.el.prop('class',this.class.join(' '));
		this.child.prop('class', "dead");

		return TweenMax.to(
				this.child, .5,
				{
					className: ""
				}
			);
	},
	swipeMe: function(_event) {
		console.log(this, _event)
	},
	dirty: function() {
		if(!this.isDirty) {
			this.isDirty = true;
			var index = Tile.dirties.indexOf(this);
			if(index == -1)
				Tile.dirties.push(this);
			if(this.group){
				for(var tile of this.group){
					if(tile !== this){
						tile.group = null;
						tile.dirty();
					}
				}
				index = Tile.groups.indexOf(this.group);
				if(index != -1)
					Tile.groups.splice(index, 1);
				Tile.releaseArray(this.group)
				this.group = null;
			}
			this.setText('');
		}
		return this;
	},
	removeClass: function() {
		var str, index, list = arguments;
		if(_.isArray(list[0]))
			list = list[0];
		for(str of list){
			index = this.class.indexOf(str);
			if(index != -1){
				this.class.splice(index, 1);
			}
		}
	},
	addClass: function() {
		var str, list = arguments;
		if(_.isArray(list[0]))
			list = list[0];
		for(str of list)
			if(str != "" && this.class.indexOf(str) == -1)
				this.class.push(str);
	},
	setText : function(_str){
		this.child.text(_str);
	},
	release : function() {
		var index = Tile.all.indexOf(this);
		if(index != -1)
			Tile.all.splice(index, 1);
		this.tileColor = -1;
		this.class.length = 0;
		this.neighbors = 0;
		index = Tile.groups.indexOf(this.group);
		if(index != -1)
			Tile.groups.splice(index, 1);
		Tile.releaseArray(this.group);
		Tile.releaseArray(this.moveList);
		Tile.releaseArray(this.neighbors);
		this.group = null;
		this.moveList = null;
		this.neighbors = null;
		return TweenMax.to(
			this.child, .5,
			{
				className: 'dead',
				onComplete: Tile.giveUp,
				onCompleteParams: [this]
			}
		);
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
		this.removeClass('up', 'down', 'left', 'right', 'isGroup', 'almostGroup', 'noGroup');
		//this.el.addClass(this.class.join(' ') + " moving")
		return TweenMax.to(
			this.el, .5,
			{
				y: 5 + _y * 100 + 'px',
				x: 5 + _x * 100 + 'px',
				rotation : 0,
				scale : 1.0,
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
		TweenMax.set(
			this.el,
			{
				rotation : 0,
				scale : 1.0,
				y : 5 + _y * 100,
				x : 5 + _x * 100
			}
		);
		if(!_noUpdate)
			this.update();
	},
	prepareMove: function(_part){
		if(this.currentMove != _part){
			if(_part == -1){
				TweenMax.to(this.el, 0.5, {rotation : 0, scale : 1.0});
				this.moving = false;
				this.removeClass('moving');
				this.removeClass('turned');
			}else{
				TweenMax.to(this.el, 0.5, {rotation : 40 - _part * 30, scale : .25 + _part * .5});
				this.moving = true;
				this.addClass('turned');
				this.addClass('moving');
			}
			this.currentMove = _part;
		}
		return this;
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
			classes = Tile.giveMeAnArray(),
			remClasses = Tile.giveMeAnArray(),
			text = "", neighbor;
		this.moveList.length = 0;
		this.neighbors.length = 0;
		if(this.group)
			groups.push(this.group);
		if(x < Tile.width -1) {
			neighbor = Tile.get(x +1, y);
			this.neighbors[2] = neighbor;
			neighbor.neighbors[0] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[0];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
				classes.push("right");
			}else if(neighbor.tileColor == this.tileColor){
				remClasses.push("right");
				if(!neighbor.isDirty && groups.indexOf(neighbor.group) == -1) 
					groups.push(neighbor.group);
			}else
				classes.push("right");
		}else
			classes.push("right");

		if(y > 0) {
			neighbor = Tile.get(x, y -1);
			this.neighbors[3] = neighbor;
			neighbor.neighbors[1] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[1];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
				classes.push("up");
			}else if(neighbor.tileColor == this.tileColor){
				remClasses.push("up");
				if(!neighbor.isDirty && groups.indexOf(neighbor.group) == -1) 
					groups.push(neighbor.group);
			}else
				classes.push("up");
		}else
			classes.push("up");

		if(x > 0) {
			neighbor = Tile.get(x -1, y);
			this.neighbors[0] = neighbor;
			neighbor.neighbors[2] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[2];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
				classes.push("left");
			}else if(neighbor.tileColor == this.tileColor){
				remClasses.push("left");
				if(!neighbor.isDirty && groups.indexOf(neighbor.group) == -1) 
					groups.push(neighbor.group);
			}else
				classes.push("left");
		}else
			classes.push("left");

		if(y < Tile.height -1) {
			neighbor = Tile.get(x, y +1);
			this.neighbors[1] = neighbor;
			neighbor.neighbors[3] = this;
			if(neighbor.isHole) {
				text = Tile.DIRS[3];
				moves.push(text);
				text = Tile.DIRTEXTS[text]
				classes.push("down");
			}else if(neighbor.tileColor == this.tileColor){
				remClasses.push("down");
				if(!neighbor.isDirty && groups.indexOf(neighbor.group) == -1) 
					groups.push(neighbor.group);
			}else
				classes.push("down");
		}else
			classes.push("down");

		this.removeClass(remClasses);
		this.addClass(classes);
		this.group = groups.length? groups[0] :Tile.giveMeAnArray();
		if(this.group.indexOf(this) == -1)
			this.group.push(this);
		while(groups.length > 0) {
			var group = groups.pop();
			if(group != this.group && groups.indexOf(group) == -1) {//treat each one, once
				for(var tile of group)
					if(this.group.indexOf(tile) == -1){
						this.group.push(tile);
						tile.group = this.group;
					}
				var index = Tile.groups.indexOf(group);
				if(index != -1)
					Tile.groups.splice(index, 1);
				Tile.releaseArray(group);
			}
		}
		if(Tile.groups.indexOf(this.group) == -1)
			Tile.groups.push(this.group);
		this.group.dirty = true;
		this.setText(text);
		this.isDirty = false;
		Tile.releaseArray(remClasses);
		Tile.releaseArray(classes);
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
Tile.NUM_COLORS = 6;
Tile.numColors = 6;
Tile.DIRS = ["right","up","left","down"];
Tile.OPPDIRS = ["right","up","down","left"];
const 	left = 0,
		down = 1,
		right = 2,
		up = 3;
Tile.get = function(_x,_y) {
	if(_x >= Tile.width || _x < 0 )
		return null;
	return Tile.cols[_x][_y];
}
Tile.factory = function() {
	return Tile.pool.pop() || new Tile();
}
Tile.giveMeAnArray = function() {
	ret = Tile.arrayPool.pop() || [];
	ret.length = 0;
	return ret;
}
Tile.releaseArray = function(_array) {
	if(!_.isArray(_array))
		return;
	_array.length = 0;
	if(Tile.arrayPool.indexOf(_array) == -1)
		Tile.arrayPool.push(_array);
}
Tile.getRandColor = function(_avoid1, _avoid2) {
	var num;
	do{
		num = _.random(0, Tile.numColors -1)
	}while(num == _avoid1 || num == _avoid2)
	return "" + num;
}
Tile.swapDirs = function(_val) {
	if(_val && _val.type == "change")
		_val = _val.target.checked;
	if(_val)
		Tile.DIRTEXTS = {right : "→",up : "↑",left : "←",down : "↓"};
	else
		Tile.DIRTEXTS = {right : "←",up : "↓",left : "→",down : "↑"};
	Tile.invertedDirs = _val;
	for(var tile of Tile.all)
		tile.update()
}
Tile.applyMoves = function(_move) {
	if(_.isArray(_move)){
		for(var move of _move)
			Tile.applyMoves(move);
		return;
	}
	move = Tile.DIRS.indexOf(_move);
	var tile = Tile.hole.neighbors[move];
	if(tile)
		Tile.swap(tile, Tile.hole);
	//Tile.moves++;
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
}
/*Tile.handleMouse = function(_event){
	var tile = $(this).data('tile');
	switch(_event.type){
		case "mousedown":
			Tile.currentGesture = null;
			Tile.updateGesture(0, tile, _event.pageX, _event.pageY, "mouse");
		    _event.preventDefault();
		    return false;
			break;
		case "mousemove":
			if(Tile.currentGesture){
				Tile.updateGesture(0, tile, _event.pageX, _event.pageY, "mouse");
			    _event.preventDefault();
			    return false;
			}
			break;
		case "mouseenter":
			if(Tile.currentGesture)
				Tile.updateGesture(0, tile, _event.pageX, _event.pageY, "mouse");
			break;
		case "mouseup":
			if(Tile.currentGesture)
				Tile.endGesture(0, tile, _event.pageX, _event.pageY);
			break;
	}
}
Tile.handleTouch = function(_event){
	var t = _event.originalEvent.touches[0],
		div = t && document.elementFromPoint(t.pageX, t.pageY),
		tile = div && $(div).data('tile');
	if(tile)
		Tile.updateGesture(t.identifier, tile, t.pageX, t.pageY, "touch");
	else
		Tile.endGesture();
	if(_event.type == 'touchmove')//prevent
		_event.preventDefault();
}
Tile.handleKey = function( _event ) {
	if(_event.type == 'keydown' && _event.keyCode == 27)
		$("#gameOptions").toggleClass('hide')
}
Tile.updateGesture = function(_id, _tile, _pageX, _pageY, _type){
	if(!Tile.currentGesture){
		Tile.currentGesture = {
			id: _id,
			tiles: Tile.giveMeAnArray(),
			//overlays: Tile.giveMeAnArray(),
			moves: Tile.giveMeAnArray(),
			ended: false,
			type: _type,
			created: _.now(),
			_startX: _pageX,
			_startY: _pageY
		}
		if(_tile.moveList.length == 1){
			Tile.currentGesture.tiles.push(Tile.hole);
			//Tile.currentGesture.moves.push(_tile.moveList[0]);
		}
	}
	if(Tile.currentGesture.id != _id){
		//TODO
	}
	Tile.currentGesture.lastUpdated = _.now();
	if(Tile.currentGesture.tiles.length > 1){
		var prev, last = _.last(Tile.currentGesture.tiles, 2);
		//Tile.arrayPool.push(last);
		prev = last[0];
		last = last[1];
	}else{
		last = _.last(Tile.currentGesture.tiles);
	}
	if(last != _tile){
		if(_tile == prev){
			//cancel a move
			for(var tween of TweenMax.getTweensOf(last.el))
				tween.progress(1.0);
			last.el.removeClass('moving');
			last.removeClass('moving');
			Tile.currentGesture.moves.pop();
			Tile.currentGesture.tiles.pop();
		}else{
			if(last){
				var index = last.neighbors.indexOf(_tile);
				if(index == -1)
					return Tile.currentGesture.ended = true;
				Tile.currentGesture.moves.push(Tile.DIRS[index]);
			}
			Tile.currentGesture.tiles.push(_tile);
			for(var tween of TweenMax.getTweensOf(_tile.el))
				tween.progress(1.0);
			_tile.el.addClass('moving');
			_tile.addClass('moving');
		}
	}
}
Tile.endGesture = function(_id, _tile, pageX, pageY){
	Tile.moves++;
	Tile.currentGesture.nextMove = 0;
	return Tile.currentGesture.ended = true;
}*/
Tile.giveUp = function(_tile){
	_tile.el.detach();
	Tile.tileColor = -1;
	Tile.releaseArray(_tile.class);
	_tile.class = null;
	if(Tile.pool.indexOf(_tile) == -1)
		Tile.pool.push(_tile);
}
Tile.releaseAll = function(){
	if(Tile.lockdown)
		return;
	Tile.lockdown = true;
	cancelAnimationFrame(Tile.loop)
	var array = Tile.giveMeAnArray(),
		st = 1 / Tile.all.length,
		i;
	while(Tile.all.length > 0){
		i = _.random(Tile.all.length-1);
		var tile = Tile.all[i];
		tile.setText('');
		Tile.all.splice(i, 1)
		array.push(tile.release());
	}
	var tl = new TimelineLite({tweens : array, stagger : st});
	Tile.releaseArray(array);
	Tile.releaseArray(Tile.groups);
	Tile.releaseArray(Tile.dirties);
	Tile.releaseArray(Tile.allDirtyClasses);
	Tile.groups = [];
	Tile.dirties = Tile.giveMeAnArray();
	Tile.allDirtyClasses = Tile.giveMeAnArray();
	return tl
}
Tile.Init = function(_options) {
	var avoid1, avoid2, tile, container,
		options = _options ||{},
		w = options.w || Tile.width,
		h = options.h || Tile.height;
	Tile.width = w;
	Tile.height = h;
	Tile.resize();
	Tile.timeline = new TimelineLite();
	container = options.container || $('#gameContainer')
	Tile.cols = Tile.giveMeAnArray();
	Tile.rows = Tile.giveMeAnArray();
	Tile.numColors = options.numColors ||Tile.NUM_COLORS
	var colors = Array();
	for(var i= 0; i < Tile.numColors; i++){
		colors[i] = false;
	}
	var remove = _.random(w * h -1),
		arr = Tile.giveMeAnArray();
	if (w == 1 && h == 1){
		remove = 2;
		Tile.isPlaying = false;
	}else{
		Tile.hole = null;
		Tile.isPlaying = true;
	}
	for(var i= 0; i < w; ++i) {
		Tile.cols[i] = Tile.giveMeAnArray();
		for(var j= 0; j < h; ++j) {
			//one!
			if(i==0)
				Tile.rows[j] = Tile.giveMeAnArray();
			avoid1 = avoid2 = -2;
			if(remove == (w * j + i)) {
				remove = -1
				tile = Tile.factory();
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
				
				tile = Tile.factory();
				arr.push({
					init : tile.init(i, j, avoid1, avoid2),
					val : ((tile.x + 1) + (tile.y + 1)) + tile.y/100
				});
				colors[tile.tileColor] = true;
			}
			tile.el.appendTo(container);
			Tile.cols[i][j] = tile;
			Tile.rows[j][i] = tile;
			Tile.all.push(tile);
		}
	}
	for(var i= 0; i < colors.length; i++){
		if(colors[i] == false)
			Tile.numColors--;
	}
	//for(tile of Tile.all) tile.update();
	Tile.container = container;
	Tile.containerWidth = (w * 100 + 8);
	Tile.containerHeight = (h * 100 + 8);
	container.css({
		width : Tile.containerWidth + 'px',
		height : Tile.containerHeight + 'px'
	})
	var sorted = _.sortBy(arr, 'val');
	Tile.releaseArray(arr);
	arr = _.pluck(sorted, 'init'), dur = 2.5;
	if(arr.length < 100)
		dur = 1.5;
	if(arr.length < 40)
		dur = 1.0;
	if(arr.length < 20)
		dur = 0.5;

	var tl = new TimelineLite(
		{
			tweens : arr,
			stagger : dur/arr.length,
			onComplete: Tile.Update
		});
	Tile.releaseArray(sorted);
	$("#goal").text("(get to " + Tile.numColors + ")");
	$("#widthInput").val(w);
	$("#heightInput").val(h);
	$("#colorsInput").val(Tile.numColors);
	$(window).on('resize', _.debounce(Tile.resize, 500));
	$(document.body).on("keydown", Tile.handleKey)
	TileGesture.Init(container);

	Tile.moves = 0;
	Tile.resize();
	return tl;
}
Tile.resize = function(){
	var w = $(window).width() * .95,
		h = $(window).height() * .95,
		c = $('#gameSpacer'),
		m = c.css('margin').replace(/px/g, "").split(' ').map(x=>+x);

	if(w > h)
		$(document.body).removeClass('vertical');
	else
		$(document.body).addClass('vertical');

	if(m[1] === undefined)
		m[1] = m[0]
	if(m[2] === undefined)
		m[2] = m[0]
	if(m[3] === undefined)
		m[3] = m[1]
	var wRatio = w / (Tile.containerWidth + m[1] + m[3]),
		hRatio = h / (Tile.containerHeight + m[0] + m[2]);
	TweenMax.to(c, .5, {scale: Math.min(wRatio, hRatio)});
}
Tile.sortByClass = function(_a, _b) {
	return _a.el.prop('class').length - _b.el.prop('class').length;
}
Tile.checkSizes = function(_e) {
	if(!_e ||_e.target == $("#widthInput")[0]){
		var v = +$("#widthInput").val();
		if(v < 2)
			v = 2;
		if(v > 17)
			v = 17;
		$("#widthInput").val(v);
	}
	if(!_e ||_e.target == $("#widthInput")[0]){
		v = +$("#heightInput").val();
		if(v < 2)
			v = 2;
		if(v > 17)
			v = 17;
		$("#heightInput").val(v);
	}
	if(!_e ||_e.target == $("#widthInput")[0]){
		v = +$("#colorsInput").val();
		if(v < 2)
			v = 2;
		if(v > 6)
			v = 6;
		$("#colorsInput").val(v);
	}
}
Tile.restart = function() {
	if(Tile.lockdown)
		return;
	Tile.checkSizes();
	var w = +$("#widthInput").val(),
		h = +$("#heightInput").val(),
		c = +$("#colorsInput").val();
	if(confirm("really abandon this game and start a new " + w + "x" + h + "?")){
		var tl = Tile.releaseAll();
		if(tl)
			tl.eventCallback(
				"onComplete",
				Tile.Init, 
					[{
						container : $('#gameContainer'),
						w : w, h: h,
						numColors : c
					}]);
		else
			Tile.Init(
				{
					container : $('#gameContainer'),
					w : w, h: h,
					numColors : c
				});
		$('#gameOptions').addClass('hide')
	}
}
Tile.randomInit = function() {
	if(Tile.lockdown)
		return;
	var w = _.random(2, 17),
		h = _.random(2, 17),
		tl = Tile.releaseAll();
	tl && tl.eventCallback("onComplete", Tile.Init, [$('#gameContainer'), w>>0, h>>0]);
}
Tile.Update = function() {
	kd.tick();
	Tile.lockdown = false;
	var tile, tile2, list, totest, group;
	var start = _.now();
	_.invoke(Tile.dirties, 'update');
	Tile.releaseArray(Tile.dirties);
	Tile.dirties = Tile.giveMeAnArray();
	for(group of Tile.groups) {
		if(group.dirty){
			group.dirty = false;
			totest = true;
			if(group.length >= Tile.threshold){
				group.sort(Tile.sortByClass);
			}
			for(tile of group){
				if( group.length >= Tile.threshold){
					tile.removeClass('almostGroup', 'noGroup');
					tile.addClass('isGroup');
					if(totest && tile.child.text() == ""){
						totest = false;
						tile.setText(group.length);
					}
				}else if( group.length > 1){
					tile.removeClass('isGroup', 'noGroup');
					tile.addClass('almostGroup');
				}else{
					tile.removeClass('almostGroup', 'isGroup');
					tile.addClass('noGroup')	
				}
			}
		}
	}
	Tile.loop = requestAnimationFrame(Tile.Update);
	var arr = Tile.giveMeAnArray(),
		str = (Tile.groups.length -1)+ " groups";
	if($("#progress").text() != str)
		$("#progress").text(str);
	str = Tile.moves + " moves";
	if($("#score").text() != str)
		$("#score").text(str);
	while(Tile.allDirtyClasses.length){
		if(_.now() > start + 10){
			break;
		}
		tile = Tile.allDirtyClasses.shift();
		if(!tile.moving && tile.dirtyClass){
			arr.push(TweenMax.to(
				tile.el, .5,
				{
					className: tile.class.join(' ')
				}
			));
			tile.dirtyClass = false;
			/*requestAnimationFrame(Tile.Update);
			return;*/
		}
	}
	_.shuffle(arr);
	var tl = new TimelineLite({tweens : arr, stagger : 0.25/arr.length});
	Tile.releaseArray(arr);
	if(Tile.isPlaying && Tile.moving.length == 0){
		if(Tile.groups.length == Tile.numColors + 1){
			Tile.isPlaying = false;
			alert("you won (TODO : better win screen).");
		}
	}
	var update = 1.0;
	if(TileGesture.Current)
		update = TileGesture.Current.update(_.now());
	if(isNaN(update)){
		Tile.applyMoves(update);
		update = 1.0;
	}
	//update = 100;
	update = Math.round(Tile.containerWidth * update);
	var top = Math.round((Tile.containerWidth - update) *.5);
	$('#timerStyle').html(
		"#gameContainer::after{height : " + (update + 8) + "px; top : " + (top -4) + "px;}\n" +
		"#gameContainer::before{width : " + (update + 8) + "px; left : " + (top -4) + "px;}"
	);

	/*if(Tile.currentGesture){
		if(Tile.currentGesture.ended){
			var now = _.now();
			if(Tile.currentGesture.nextMove < now){
				var move = Tile.currentGesture.moves.shift()
				if(move){
					Tile.applyMoves(move);
					if(Tile.currentGesture.moves.length < 25)
						Tile.currentGesture.nextMove = now + 50;
					else
						Tile.currentGesture.nextMove = now + 10;
				}else{
					Tile.currentGesture = null;
					$('.tile').removeClass('moving');
				}
			}
		}else if(Tile.currentGesture.lastUpdated < _.now() - (350 + Tile.currentGesture.moves.length * 50))
			Tile.endGesture();
	}//*/
}
Tile.lockdown = true;
Tile.isPlaying = true;
Tile.width = 8;
Tile.height = 8;
Tile.arrayPool = [];
Tile.all = Tile.giveMeAnArray();
Tile.pool = Tile.giveMeAnArray();
Tile.groups = Tile.giveMeAnArray();
Tile.moving = Tile.giveMeAnArray();
Tile.dirties = Tile.giveMeAnArray();
Tile.nextMoves = Tile.giveMeAnArray();
Tile.allDirtyClasses = Tile.giveMeAnArray();
Tile.threshold = 4;
Tile.swapDirs(false)