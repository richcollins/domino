Button = Label.clone().newSlots({
	type: "Button"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		this.setTextAlign("center");
		
		var self = this;
		var e = this.element();
		e.onclick = function()
		{
			self.delegatePerform("clicked");
		}
		e.style.cursor = "pointer";
	}
});
