
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

	var LINE_HEIGHT = 17;
	var CHAR_WIDTH = 12;

	var linesOnScreen = 0;

	var redrawCanvas = function() {
		linesOnScreen = 0;
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,width,height);
		ctx.fillStyle = "rgb(255,255,255)";
		var str = text.val().split("\n");
		var y = LINE_HEIGHT;
		$.each(str,function(i, item) {
			while (item.length * CHAR_WIDTH > width - (width%CHAR_WIDTH)) {
				var result = "";
				var i;
				for (i = 0; i < (width - (width%CHAR_WIDTH))/CHAR_WIDTH; i++) {
					result += item.substring(i,i+1);
				}
				ctx.fillText(result, 2, y);
				linesOnScreen++;
				y += LINE_HEIGHT;
				item = item.substring(i);
			}
			ctx.fillText(item, 2, y);
			linesOnScreen++;
			y += LINE_HEIGHT;
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
		// TODO - make cursor show up on canvas

		// callbacks for text
		text.keyup(function(e) {
			// Draw the text. This also counts the lines on the screen.
			redrawCanvas();
			// Use the line count to scroll
			if (linesOnScreen * LINE_HEIGHT > height) {
				var t = text.val().split('\n');
				var res = t[1];
				for (var i = 2; i < t.length; i++) {
					res += '\n' + t[i];
				}
				// TODO - save t[0]
				text.val(res);
			}
		});
		text.focus(function() {
			if (text[0].setSelectionRange) {
				text[0].setSelectionRange(text.val().length, text.val().length);
			} else if (text[0].createTextRange) {
				var range = text[0].createTextRange();
				range.collapse(true);
				range.moveEnd('character', text.val().length);
				range.moveStart('character', text.val().length);
				range.select();
			}
		});
	};
})();
