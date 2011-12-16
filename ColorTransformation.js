ColorTransformation = Proto.clone().setSlots({
	apply: function(color)
	{
		return "rgba(" + [color.red(), color.green(), color.blue(), color.alpha()].join(",") + ")";
	}
});
