Button = Label.clone().newSlots({
	type: "Button"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var self = this;
		var e = this.element();
		e.onclick = function()
		{
			self.delegatePerform("buttonClicked");
		}
		e.style.cursor = "pointer";
	}
});
