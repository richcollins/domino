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
			//alert("window.onresize");
			Window.autoResize();
		}
		
		var self = this;
		window.onmessage = function(e)
		{
			self.delegatePerform("messagedFrom", e.data, e.origin);
		}
		
		/* Doesn't work for some reason.  Add it to html for now
		var meta = document.createElement("meta");
		meta.httpEquiv = "Content-Type";
		meta.content = "text/html;charset=utf-8";
		
		document.head.appendChild(meta);
		*/
		
		this.setInited(true);
		this.delegatePerform("inited");
	},
	
	startResizeInterval: function() //window.onresize doesn't always work on mobile webkit.
	{
		var self = this;
		this._resizeTimer = setInterval(function(){
			if (self.width() != self.lastResizeWidth() || self.height() != self.lastResizeHeight())
			{
				self.autoResize();
			}
		}, 200);
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
		return window.innerWidth; //document.body isn't reliable on mobile
		//return this.element().clientWidth;
	},
	
	height: function()
	{
		return window.innerHeight; //document.body isn't reliable on mobile
		//return this.element().clientHeight;
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
});
