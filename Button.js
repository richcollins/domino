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
			self.delegate().conditionallyPerform("buttonClicked", self);
		}
		e.style.cursor = "pointer";
	}
});
