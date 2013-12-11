dm.ImageButton = dm.Button.clone().newSlots({
	type: "dm.ImageButton",
	imageUrl: null,
	imageView: null
}).setSlots({
	init: function()
	{
		dm.Button.init.call(this);
		
		this.setWidth(3);
		this.setHeight(3);
		
		var iv = dm.ImageView.clone();
		iv.setDelegate(this);
		iv.setDelegatePrefix("imageView");
		iv.setWidth(3);
		iv.setHeight(3);
		iv.resizeToFill();
		this.setImageView(iv);
		this.addSubview(iv);
	},
	
	setImageUrl: function(imageUrl)
	{
		this.imageView().setUrl(imageUrl);
	},
	
	imageViewLoaded: function()
	{
		this.delegatePerform("loaded");
	},
	
	imageViewLoadFailed: function()
	{
		this.delegatePerform("loadFailed");
	},
	
	sizeToFit: function()
	{
		this.setSize(this.imageView().naturalSize());
		this.imageView().setSize(this.imageView().naturalSize());
		return this;
	}
});