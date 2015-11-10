requirejs(["/lib/TweenMax.min.js","Tile.class","TileGesture.class"], function() {
	console.log('go');
	var container = $('#gameContainer'),
		width = 7, height = 7;
	TweenMax.defaultOverwrite = "all";
	Tile.Init(
		{
			container: container,
			w: width,
			h: height
		}
	);
	$("#heightInput, #widthInput, #colorsInput").on("blur", Tile.checkSizes);
	$("#heightInput, #widthInput, #colorsInput").on("keydown", function(_event){
		if(_event.keyCode == 13) Tile.restart();
		_event.stopPropagation();
	});
	$("#dirCheck").on("change", Tile.swapDirs)
	$("#darkCheck").on("change", function() {
		if($(document.body).hasClass('dark'))
			TweenMax.to($(document.body), 2.5, {className : ''});
		else
			TweenMax.to($(document.body), 2.5, {className : 'dark'});
	});
	$(window).on('resize', _.debounce(Tile.resize, 500));
	$(document.body).on("keydown keyup", Tile.handleKey)
	$('#openIcon, #closeIcon').on("click", function( event ) {
		$('#gameOptions').toggleClass('hide')
		/*if($('#gameOptions').hasClass('show'))
			TweenMax.to($('#gameOptions'), .5, {className : 'hide'});
		else
			TweenMax.to($('#gameOptions'), .5, {className : 'show'});*/
	});
	container.on("click", ".tile", function( event ) {
			var tile = $(this).data('tile');
			console.log( tile.tileColor, tile.moveList );
			Tile.applyMoves(tile.moveList);
			Tile.currentGesture = null;
			//TODO
			event.stopPropagation();
		})
	$(container).on("touchstart touchmove touchend", ".tile", Tile.handleTouch);
	$(container).on("mousedown mouseup mouseenter mousemove", ".tile", Tile.handleMouse);
	Tile.resize();
})
