App = Delegator.clone().newSlots({
	type: "App"
}).setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		Window.setDelegate(this);
	},
	
	windowInited: function()
	{
		this.start();
		this.delegatePerform("started");
	}
});