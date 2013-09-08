var dbxClientInstance = null;

ShellUtils.registerProgram("dropbox",(function() {
	var dir = '/';
	var ls = null;
	return function(args) {
		var that = this;
		if (args.length == 1 || args[1] == "--help") {
			that.writeLine("Usage: dropbox [command] [additional_args]");
			that.writeLine("Commands:");
			that.writeLine("  auth         - starts the authentication process. This must be done before any other dropbox commands work.");
			that.writeLine("  ls  or  list - lists the files in the current directory.");
			that.writeLine("  userinfo     - shows the signed in user");
			that.writeLine("  cd [dir]     - changes to the specified directory");
			that.writeLine("  pwd          - prints the current directory");
			that.programComplete();
			return 0;
		}
		if (args[1] == "auth") {
			that.writeLine("Authenticating....");
			var client = new Dropbox.Client({key: "cwo0v8ms7rlmqz6"});
			client.authDriver(new Dropbox.AuthDriver.Popup({receiverUrl: "https://ec2-54-200-9-210.us-west-2.compute.amazonaws.com/receive.html"}));
			client.authenticate(function(error, client) {
				if (error) {
					that.writeLine("There was an error while authenticating.");
					return error;
				}
				that.writeLine("Successfully authenticated!");
				dbxClientInstance = client;
				that.programComplete();
			});
		} else if (args[1] == "ls" || args[1] == "list") {
			that.writeLine("Listing contents of: " + dir);
			dbxClientInstance.readdir(dir, function (error, entries, dirs) {
				console.log(dirs);
				if (error) {
					that.writeLine("Error while listing directory contents");
					return error;
				}
				ls = dirs._json.contents;
				that.writeLine(entries.join("\n"));
				that.programComplete();
			});
		} else if (args[1] == "userinfo") {
			dbxClientInstance.getAccountInfo(function (error, accountInfo) {
				if (error) {
					that.writeLine("Error while getting account info");
					return error;
				}
				that.writeLine("Welcome, " + accountInfo.name + "!");
				that.programComplete();
			});
		} else if (args[1] == "cd") {
			if (!args[2]) {
				that.writeLine("cd must specify the directory to change to as an additional argument.");
				return 1;
			}
			if (args[2] == ".." && dir != "/") {
				var r = /[^\/]*\/$/;
				dir = dir.replace(r, '');
				console.log("dir: " + dir);
				ls = null;
				that.programComplete();
				return 0;
			}
			if (!ls) {
				dbxClientInstance.readdir(dir, function (error, entries, dirs) {
					if (error) {
						that.writeLine("Error checking if " + args[2] + " is a dir.");
						return error;
					}
					var found = false;
					ls = dirs._json.contents;
					for (var i = 0; i < ls.length; i++) {
						if (ls[i].path == dir + args[2]) {
							found = true;
							dir += args[2] + "/";
							break;
						}
					}
					if (!found) {
						that.writeLine("Directory " + args[2] + " does not exist.");
					}
					ls = null;
					that.programComplete();
				});
			} else {
				var found = false;
				for (var i = 0; i < ls.length; i++) {
					if (ls[i].path == dir + args[2]) {
						found = true;
						dir += args[2] + "/";
						break;
					}
				}
				if (!found) {
					that.writeLine("Directory " + args[2] + " does not exist.");
				}
				ls = null;
				that.programComplete();
			}
		} else if (args[1] == "pwd") {
			that.writeLine("The current directory is: " + dir);
			that.programComplete();
		} else {
			that.writeLine("Command isn't recognized");
			that.writeLine("see dropbox --help for usage information");
			that.programComplete();
		}
		return 0;
	};
})());
