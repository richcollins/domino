ImageButton = Button.clone().newSlots({
	type: "ImageButton",
	imageUrl: null,
	imageView: null
}).setSlots({
	init: function()
	{
		Button.init.call(this);
		
		this.setWidth(3);
		this.setHeight(3);
		
		var iv = ImageView.clone();
		iv.setWidth(3);
		iv.setHeight(3);
		iv.resizeToFill();
		this.setImageView(iv);
		this.addSubview(iv);
	},
	
	setImageUrl: function(imageUrl)
	{
		this.imageView().setUrl(imageUrl);
	}
});