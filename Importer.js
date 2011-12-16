Importer = Proto.clone().setType("Importer").newSlots({
	basePath: null
})
.setSlots(
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
			
			document.write('<script type=\"text/javascript\" src="' + path.replace("/", "\\/") + '"><\/script>');
		}
	}
});
