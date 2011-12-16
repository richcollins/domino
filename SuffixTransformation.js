SuffixTransformation = Proto.clone().setSlots({
	apply: function(value)
	{
		return value + this.suffix;
	}
});
