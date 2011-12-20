BorderedButton = Button.clone().newSlots({
	type: "BorderedButton",
	borderImageUrl: null,
	leftBorderWidth: 0,
	rightBorderWidth: 0,
	topBorderWidth: 0,
	bottomBorderWidth: 0
}).setSlots({
	setBorderImageUrl: function(borderImageUrl)
	{
		this._borderImageUrl = borderImageUrl;
		this.updateStyle();
		return this;
	},
	
	setLeftBorderWidth: function(w)
	{
		this._leftBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setRightBorderWidth: function(w)
	{
		this._rightBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setTopBorderWidth: function(w)
	{
		this._topBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setBottomBorderWidth: function(w)
	{
		this._bottomBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setWidth: function(w)
	{
		this._width = w;
		this.updateStyle();
		return this;
	},
	
	setHeight: function(h)
	{
		this._height = h;
		this.updateStyle();
		return this;
	},
	
	updateStyle: function()
	{
		var style = this.element().style;
		var widths = [this.topBorderWidth(), this.rightBorderWidth(), this.bottomBorderWidth(), this.leftBorderWidth()];
		style.webkitBorderImage = "url(" + this.borderImageUrl() + ") " + widths.join(" ");
		widths = widths.map(function(w){ return w + "px"  });
		style.borderWidth = widths.join(" ");
		style.width = (this.width() - this.leftBorderWidth() - this.rightBorderWidth()) + "px";
		var h = (this.height() - this.topBorderWidth() - this.bottomBorderWidth());
		style.height = h + "px";
		style.lineHeight = h + "px";
	}
});