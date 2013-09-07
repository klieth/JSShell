
var ShellUtils = new ((function() {
	var shells = 0;
	var progs = {
		test: function(args) {
			var that = this;
			//that.writeLine("getLastLine returned: " + this.getLastLine());
			$.each(args, function (i, item) {
				that.writeLine(item);
			});
			return 0;
		}
	};
	return function() {
		this.numShells = function() {
			return shells;
		};
		this.getNewShellID = function() {
			shells++;
			return "shellID" + shells;
		};
		this.registerProgram = function(name, main) {
			if (progs[name]) {
				console.err("Program with that name already exists");
				return null;
			}
			progs[name] = main;
		};
		this.runProgram = function(scope, name, args) {
			if (progs[name]) {
				return progs[name].call(scope, args);
			} else {
				scope.writeLine("No such program found");
				console.log("No such program found");
				return false;
			}
		};
	}
})())();

var Shell = (function() {
	// Stores a reference to the original replaced node
	var original;

	// Stores the canvas (visible) and the text area (hidden)
	var canvas, ctx, width = 800, height = 400;
	var text;
	var prompt = "> ";
	var currentProg = null;

	var LINE_HEIGHT = 17;
	var CHAR_WIDTH = 12;
	var CURSOR_FUDGE = 2;

	var linesOnScreen = 0;
	var caretPos;

	var redrawCanvas = function() {
		linesOnScreen = 0;
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,width,height);
		ctx.fillStyle = "rgb(255,255,255)";
		var str = text.val().split("\n");
		var y = LINE_HEIGHT;
		var chars = 0;
		$.each(str,function(i, item) {
			if (cursorPos && chars + item.length >= cursorPos) {
				var x = (cursorPos - chars) * CHAR_WIDTH + CURSOR_FUDGE;
				ctx.fillRect(x, y - LINE_HEIGHT + 2, 1, LINE_HEIGHT);
				// TODO - setTimeout to flash cursor
				caretPos = null;
			}
			chars += item.length + 1;
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

	var doScroll = function() {
		if (linesOnScreen * LINE_HEIGHT > height) {
			lines = Math.ceil((linesOnScreen * LINE_HEIGHT - height)/LINE_HEIGHT);
			var t = text.val().split('\n');
			var res = t[lines];
			for (var i = lines + 1; i < t.length; i++) {
				res += '\n' + t[i];
			}
			// TODO - save t[0]
			text.val(res);
		}
	};

	return function(id) {
		// Remove the specified id, replace with canvas
		original = $('#' + id);
		canvas = $("<canvas></canvas>").prop({width:width,height:height});
		canvas.attr('id',ShellUtils.getNewShellID());
		ctx = canvas[0].getContext('2d');
		text = $("<textarea></textarea>");
		text.val(prompt);
		original.parent().append(canvas);
		original.parent().append(text);
		original.remove();
		delete original;

		// set up canvas
		ctx.font = "20px Courier";
		ctx.fillStyle = "rgb(0,0,0)";
		ctx.fillRect(0,0,width,height);
		ctx.fillStyle = "rgb(255,255,255)";

		cursorPos = 2;
		redrawCanvas();

		// helper utils
		this.getLastLine = function(after) {
			var all = text.val().split("\n");
			return all[all.length - 1].substring(after ? after.length : "");
		};

		this.write = function(str) {
			str = str || "";
			text.val(text.val() + str);
		}

		this.writeLine = function(str) {
			str = str || "";
			text.val(text.val() + str + '\n');
		}

		// callbacks for canvas
		canvas.click(function() {
			text.focus();
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

		// callbacks for text
		text.keypress({that:this},function(e) {
			// TODO - if enter, parse the most recent line and start the program
			if (e.which == 13 || e.keyCode == 13) {
				var line = e.data.that.getLastLine(prompt).split(" ");
				e.data.that.writeLine();
				console.log(text.val().substring(2).split('\n'));
				console.log("running: " + line[0]);
				console.log(line[0] + " returned: " + ShellUtils.runProgram(e.data.that, line[0], line));
				e.data.that.write(prompt);
				cursorPos = text.prop("selectionStart");
				redrawCanvas();
				doScroll();
				return false;
			}
			return true;
		});
		text.keyup(function(e) {
			// Draw the text. This also counts the lines on the screen.
			cursorPos = text.prop("selectionStart");
			redrawCanvas();
			// Use the line count to scroll
			doScroll();
		});
		text.mouseup(function() {
			cursorPos = text.prop("selectionStart");
			redrawCanvas();
		});


	};
})();
