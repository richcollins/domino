Window = View.clone().newSlots({
	type: "Window",
	lastResizeWidth: null,
	lastResizeHeight: null,
	inited: false
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		document.body.innerHTML = "";
		
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
		
		window.onresize = function()
		{
			Window.autoResize();
		}
		
		/* Doesn't work for some reason.  Add it to html for now
		var meta = document.createElement("meta");
		meta.httpEquiv = "Content-Type";
		meta.content = "text/html;charset=utf-8";
		
		document.head.appendChild(meta);
		*/
		
		this.setInited(true);
		this.delegatePerform("windowInited");
	},
	
	createElement: function()
	{
		this.setElement(document.body);
	},

	initElement: function()
	{
	},
	
	width: function()
	{
		return this.element().clientWidth;
	},
	
	height: function()
	{
		return this.element().clientHeight;
	},
	
	autoResize: function()
	{
		this.subviews().forEachPerform("autoResize", this.lastResizeWidth(), this.lastResizeHeight());
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
	}
});

window.addEventListener("load", function(){
	Window.init();
})