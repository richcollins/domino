App = Proto.clone().newSlots({
	type: "App"
}).setSlots({
	init: function()
	{
		Window.setDelegate(this);
	},
	
	windowInited: function()
	{
		this.start();
	}
});