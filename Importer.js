dm.Importer = dm.Proto.clone().setType("dm.Importer").newSlots({
	basePath: null,
	addsTimestamp: false
}).setSlots(
{
	importPaths: function(paths)
	{
		for (var i = 0; i < paths.length; i ++)
		{
			if (this.basePath())
			{
				var path = this.basePath() + "/" + paths[i];
			}
			else
			{
				var path = paths[i];
			}
			
			path = path + ".js";
			
			var script = '<script type="text/javascript" src="' + path + (this.addsTimestamp() ? ("?" + new Date().getTime()) : "") + '"><\/script>';
			document.write(script);
		}
		return this;
	},
	
	extendBasePath: function(pathComponent)
	{
		this.setBasePath(this.basePath() + "/" + pathComponent);
		return this;
	},
	
	useSiblingPath: function(pathComponent)
	{
		this.setBasePath(this.basePath().siblingPath(pathComponent));
		return this;
	}
});
