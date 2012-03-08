dm.ImageView = dm.View.clone().newSlots({
	type: "dm.ImageView",
	url: null,
	elementName: "img"
}).setSlots({
	setUrl: function(url)
	{
		this._url = url;
		this.element().src = url;
		return this;
	}
});