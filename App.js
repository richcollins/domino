dm.App = dm.Delegator.clone().newSlots({
	type: "dm.App"
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		dm.Window.setDelegate(this);
	},
	
	windowInited: function()
	{
		this.start();
		this.delegatePerform("started");
	}
});