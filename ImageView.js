dm.ImageView = dm.View.clone().newSlots({
	type: "dm.ImageView",
	loadState: "init",
	url: null,
	elementName: "img"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var e = this.element();
		var self = this;
		e.onload = function()
		{
			self.loaded();
		}
		
		e.onerror = function()
		{
			self.loadFailed();
		}
		
		e.onabort = function()
		{
			self.loadFailed();
		}
	},
	
	setUrl: function(url)
	{
		this._url = url;
		this.element().src = url;
		return this;
	},
	
	loaded: function()
	{
		this.setLoadState("load");
		this.delegatePerform("loaded");
	},
	
	loadFailed: function()
	{
		this.setLoadState("loadFailed");
		this.delegatePerform("loadFailed");
	},

	hasLoaded: function()
	{
		return this.loadState() == "load";
	},
	
	didFailToLoad: function()
	{
		return this.loadState() == "loadFailed";
	},
	
	sizeToFit: function()
	{
		return this.setWidth(this.naturalWidth()).setHeight(this.naturalHeight());
	},
	
	naturalWidth: function()
	{
		return this.element().naturalWidth;
	},
	
	naturalHeight: function()
	{
		return this.element().naturalHeight;
	},
	
	naturalSize: function()
	{
		return dm.Point.withXY(this.naturalWidth(), this.naturalHeight());
	}
});