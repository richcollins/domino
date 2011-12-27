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
	},
	
	simulateClick: function()
	{
		var clickEvent = document.createEvent("MouseEvents");
		clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		this.element().dispatchEvent(clickEvent);
	}
});
