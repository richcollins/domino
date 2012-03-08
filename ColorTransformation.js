dm.ColorTransformation = dm.Proto.clone().setSlots({
	apply: function(color)
	{
		return "rgba(" + [color.red()*255, color.green()*255, color.blue()*255, color.alpha()].join(",") + ")";
	}
});
