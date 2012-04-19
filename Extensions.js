Array.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
Array.prototype.argsAsArray = dm.Proto.argsAsArray;
Array.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
String.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
Number.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
/*
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
*/