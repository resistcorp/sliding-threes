requirejs(["./lib/TweenMax.min.js","./Tile.class","./TileGesture.class"], function() {
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
		toLight = $(document.body).hasClass('dark');
		_.delay(Tile.SwapColors, 1250, toLight);
		if(toLight)
			TweenMax.to($(document.body), 2.5, {className : ''});
		else
			TweenMax.to($(document.body), 2.5, {className : 'dark'});
	});
	$('#openIcon, #closeIcon').on("click", function( event ) {
		$('#gameOptions').toggleClass('hide')
		/*if($('#gameOptions').hasClass('show'))
			TweenMax.to($('#gameOptions'), .5, {className : 'hide'});
		else
			TweenMax.to($('#gameOptions'), .5, {className : 'show'});*/
	});
	Tile.resize();
})
