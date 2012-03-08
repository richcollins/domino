/*
leftBorderThickness: { name: "borderLeftWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
rightBorderThickness: { name: "borderRightWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
topBorderThickness: { name: "borderTopWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
bottomBorderThickness: { name: "borderBottomWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
leftPaddingThickness: { name: "paddingLeft", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
rightPaddingThickness: { name: "paddingRight", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
topPaddingThickness: { name: "paddingTop", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
bottomPaddingThickness: { name: "paddingBottom", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
borderRadius: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
borderColor: { value: dm.Color.Black, transformation: { name: "color" } },
*/

dm.NativeControl = dm.View.clone().newSlots({
	type: "dm.NativeControl"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var e = this.element();
		e.style.border = "";
		e.style.margin = "";
		e.style.padding = "";
	}
});