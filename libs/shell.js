
var ShellUtils = new ((function() {
	var shells = 0;
	return function() {
		this.numShells = function() {
			return shells;
		};
		this.getNewShellID = function() {
			shells++;
			return "shellID" + shells;
		};
	}
})())();

var Shell = (function() {
	// Stores a reference to the original replaced node
	var original;

	// Stores the canvas (visible) and the text area (hidden)
	var canvas, ctx, width = 800, height = 400;
	var text;

	var V_PADDING = 5;
	var LINE_HEIGHT = 12;

	var redrawCanvas = function() {
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,width,height);
		ctx.fillStyle = "rgb(255,255,255)";
		var str = text.val().split("\n");
		var y = LINE_HEIGHT + V_PADDING;
		$.each(str,function(i, item) {
			// TODO - if item length is longer than width, split it into multiple lines.
			ctx.fillText(item, 2, y);
			y += LINE_HEIGHT + V_PADDING;
		});
	};

	return function(id) {
		// Remove the specified id, replace with canvas
		original = $('#' + id);
		canvas = $("<canvas></canvas>").prop({width:width,height:height});
		canvas.attr('id',ShellUtils.getNewShellID());
		ctx = canvas[0].getContext('2d');
		text = $("<textarea></textarea>");
		original.parent().append(canvas);
		original.parent().append(text);
		original.remove();
		delete original;

		// set up canvas
		ctx.font = "20px Courier";
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,width,height);
		ctx.fillStyle = "rgb(255,255,255)";

		// callbacks for canvas
		canvas.click(function() {
			text.focus();
		});

		// callbacks for text
		text.keyup(function(e) {
			// TODO - if the value is more lines than I can handle, shift it and save.
			redrawCanvas();
		});
	};
})();
