dm.Button = dm.Label.clone().newSlots({
	type: "dm.Button"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		this.setTextAlign("center");
		
		var self = this;
		var e = this.element();
		e.onclick = function(e)
		{
			self.delegatePerform("clicked", e);
		}
		e.style.cursor = "pointer";
	},
	
	disable: function()
	{
		this.setColor(this.color().setAlpha(.5));
		this.setMessagesDelegate(false);
	},
	
	enable: function()
	{
		this.setColor(this.color().setAlpha(1.0));
		this.setMessagesDelegate(true);
	},
	
	simulateClick: function()
	{
		var clickEvent = document.createEvent("MouseEvents");
		clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		this.element().dispatchEvent(clickEvent);
	}
});
