
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
	var canvas;
	var text;
	return function(id) {
		// Remove the specified id, replace with canvas
		original = $('#' + id);
		canvas = $("<canvas></canvas>");
		text = $("<textarea></textarea>");
		canvas.attr('id',ShellUtils.getNewShellID());
		original.parent().append(canvas);
		original.parent().append(text);
		original.remove();
		delete original;

		// callbacks for canvas
		canvas.click(function() {
			text.focus();
		});

		// callbacks for text
	};
})();
