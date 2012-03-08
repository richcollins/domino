dm.Window = dm.View.clone().newSlots({
	type: "dm.Window",
	lastResizeWidth: null,
	lastResizeHeight: null,
	inited: false,
	containerElement: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		
		this.element().innerHTML = "";
		
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
		
		window.onresize = function()
		{
			dm.Window.autoResize();
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
		if (!this._resizeTimer)
		{
			var self = this;
			this._resizeTimer = setInterval(function(){
				if (self.width() != self.lastResizeWidth() || self.height() != self.lastResizeHeight())
				{
					self.autoResize();
				}
			}, 200);
		}
	},
	
	createElement: function()
	{
		if (this.containerElement())
		{
			this.setElement(this.containerElement());
		}
		else
		{
			this.setElement(document.body);
		}
	},

	initElement: function()
	{
		//this.element().style.zIndex = 
	},
	
	width: function()
	{
		if (this.element() == document.body)
		{
			return window.innerWidth; //document.body isn't reliable on mobile
		}
		else
		{
			return this.element().clientWidth;
		}
	},
	
	height: function()
	{
		if (this.element() == document.body)
		{
			return window.innerHeight; //document.body isn't reliable on mobile
		}
		else
		{
			return this.element().clientHeight;
		}
	},
	
	autoResize: function()
	{
		this.subviews().forEachPerform("autoResize", this.lastResizeWidth(), this.lastResizeHeight());
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
	},
	
	windowLoaded: function()
	{
		dm.Window.init();
	}
});

window.addEventListener("load", dm.Window.windowLoaded);