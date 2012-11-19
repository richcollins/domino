dm.Label = dm.View.clone().newSlots({
	type: "dm.Label",
	text: null
}).newStyleSlots({
	fontFamily: { value: "Helvetica, Arial, sans-serif" },
	fontSize: { value: 15, transformation: { name: "suffix", suffix: "px" } },
	fontWeight: { value: "normal" },
	textDecoration: { value: "none" },
	color: { value: dm.Color.Black, transformation: { name: "color" } },
	textOverflow: { value: "ellipsis" },
	whiteSpace: { value: "pre" },
	textAlign: { value: "left" },
	lineHeight: { value: "" }
}).setSlots({
	setText: function(text)
	{
		this._text = text;
		this.element().innerText = text;
		
		return this;
	},
	
	setValue: function(text)
	{
		return this.setText(text);
	}
});
