Label = View.clone().newSlots({
	type: "Label",
	text: null
}).newStyleSlots({
	fontFamily: { value: "Helvetica, Arial, sans-serif" },
	fontSize: { value: 15, transformation: { name: "suffix", suffix: "px" } },
	fontWeight: { value: "normal" },
	textDecoration: { value: "none" },
	color: { value: Color.Black, transformation: { name: "color" } },
	textOverflow: { value: "ellipsis" },
	whiteSpace: { value: "pre" },
	textAlign: { value: "left" },
	lineHeight: { value: "" }
}).setSlots({
	setText: function(text)
	{
		this._text = text;
		this.element().innerText = text;
	}
});
