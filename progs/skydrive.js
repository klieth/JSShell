

ShellUtils.registerProgram("skydrive",(function() {
	return function(args) {
		var that = this;
		if (args[1] == "auth") {
			WL.Event.subscribe("auth.login", function() {
				that.writeLine("signed in");
			});
			WL.init({
				client_id: "000000004C0FF690",
				redirect_uri: "http://ec2-54-200-9-210.us-west-2.compute.amazonaws.com/skydrivereceive.html",
				scope: "wl.signin",
				response_type: "token"
			}).then(function() {
				that.programComplete();
			});
			/*
			WL.ui({
				name: "signin",
				element: "signin"
			});
			*/
		} else if (args[1] == "ls") {
			WL.login({
				client_id: "000000004C0FF690",
				redirect_uri: "http://ec2-54-200-9-210.us-west-2.compute.amazonaws.com/skydrivereceive.html",
				scope: "wl.skydrive",
				response_type: "token"
			}).then(function(response) {
				WL.api({
					path: "me/skydrive/my_documents/files",
					method: "GET"
				}).then(function(response){
					console.log("response");
					console.log(response);
					$.each(response.data, function(i, item) {
						that.writeLine(item.name);
					});
					that.programComplete();
				},function(responseFailed){
					that.writeLine("Error getting drive: ");
					console.log("error");
					console.log(responseFailed);
					that.programComplete();
				});
			}, function(responseFailed) {
				that.writeLine("Error signing in: " + responseFailed.error_description);
				that.programComplete();
			});
		} else {
			that.writeLine("Not a recognized command");
			that.programComplete();
		}
		return 0;
	};
})());
