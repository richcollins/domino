dm.ScrollView = dm.View.clone().newSlots({
	type: "dm.ScrollView",
	contentView: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		this.setContentView(dm.View.clone());
	},
	
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		this.element().style.overflow = "auto";
	},
	
	setContentView: function(contentView)
	{
		if (this._contentView)
		{
			this._contentView.removeFromSuperview();
		}
		this.addSubview(contentView);
		this._contentView = contentView;
		return this;
	},
	
	scrollToBottom: function()
	{
		this.element().scrollTop = this.contentView().height() - this.height();
	},
	
	scrollToTop: function()
	{
		this.element().scrollTop = 0;
	}
});
