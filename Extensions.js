(function(){
	for(var slotName in dm.Proto)
	{
		[Array, String, Number, Date].forEach(function(contructorFunction)
		{
			if(contructorFunction == Array && slotName == "clone" && dm.Browser.isInternetExplorer())
			{
				contructorFunction.prototype[slotName] = function(){ throw new Error("You can't clone an Array proto in IE yet.") };
			}
			else
			{
				contructorFunction.prototype[slotName] = dm.Proto[slotName];
			}
			contructorFunction.clone = function()
			{
				return new contructorFunction;
			}
		});
	}
})();
