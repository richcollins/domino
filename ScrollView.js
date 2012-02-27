ScrollView = View.clone().newSlots({
	type: "ScrollView",
	contentView: null
}).setSlots({
	init: function()
	{
		View.init.call(this);
		this.setContentView(View.clone());
	},
	
	initElement: function()
	{
		View.initElement.call(this);
		
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
