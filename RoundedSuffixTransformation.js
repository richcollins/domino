RoundedSuffixTransformation = Proto.clone().setSlots({
	apply: function(value)
	{
		return Math.round(value) + this.suffix;
	}
});
