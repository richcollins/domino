dm.HtmlView = dm.View.clone().newSlots({
	type: "dm.HtmlView",
	html: ""
}).setSlots({
	setHtml: function(html)
	{
		this._html = html;
		this.element().innerHTML = html;
		return this;
	}
})