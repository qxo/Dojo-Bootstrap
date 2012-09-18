var miniExcludes = {
		"Dojo-Bootstrap/CHANGES.md": 1,
		"Dojo-Bootstrap/LICENSE": 1,
		"Dojo-Bootstrap/README.md": 1,
		"Dojo-Bootstrap/package": 1
	},
	isTestRe = /\/test\//;

var profile = {
	resourceTags: {
		test: function(filename, mid){
			return isTestRe.test(filename);
		},

		miniExclude: function(filename, mid){
			return /\/(?:tests|demos)\//.test(filename) || mid in miniExcludes;
		},

		amd: function(filename, mid){
			return /\.js$/.test(filename);
		}
	}
};