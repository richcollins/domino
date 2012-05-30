dm.BorderedButton = dm.Button.clone().newSlots({
	type: "dm.BorderedButton",
	borderImageUrl: null,
	borderImage: null,
	leftBorderWidth: 0,
	rightBorderWidth: 0,
	topBorderWidth: 0,
	bottomBorderWidth: 0,
}).setSlots({
	setBorderImageUrl: function(borderImageUrl)
	{
		var borderImage = new Image();
		borderImage.src = borderImageUrl; //start loading it
		this.setBorderImage(borderImage);
		
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
		this.setCssWidth(w);
		this.updateStyle();
		return this;
	},
	
	setHeight: function(h)
	{
		this.setCssHeight(h);
		this.updateStyle();
		return this;
	},
	
	sizeWidthToFit: function()
	{
		dm.Button.sizeWidthToFit.call(this);
		w = this.width() + Math.max(this.leftBorderWidth() + this.rightBorderWidth(), 2*this.fontSize());
		this.setWidth(w);
	},
	
	updateStyle: function()
	{
		var style = this.element().style;
		var widths = [this.topBorderWidth(), this.rightBorderWidth(), this.bottomBorderWidth(), this.leftBorderWidth()];
		var value = "url(" + this.borderImageUrl() + ") " + widths.join(" ");
		style.setProperty("-webkit-border-image", value);
		style.setProperty("-o-border-image", value);
		widths = widths.map(function(w){ return w + "px"  });
		style.borderWidth = widths.join(" ");
		style.width = (this.width() - this.leftBorderWidth() - this.rightBorderWidth()) + "px";
		var h = (this.height() - this.topBorderWidth() - this.bottomBorderWidth());
		style.height = h + "px";
		style.lineHeight = h + "px";
	}
});