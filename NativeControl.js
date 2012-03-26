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