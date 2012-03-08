dm.Color = dm.Proto.clone().newSlots({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1
}).setSlots({
	withRGBA: function(r, g, b, a)
	{
		var c = this.clone();
		c.setRed(r);
		c.setGreen(g);
		c.setBlue(b);
		c.setAlpha(a);
		return c;
	},
	
	withRGB: function(r, g, b)
	{
		return this.withRGBA(r, g, b, 1);
	},
	
	withHex: function(hex)
	{
		return dm.Color.withRGB(
			parseInt(hex.substring(0, 2), 16)/255,
			parseInt(hex.substring(2, 4), 16)/255,
			parseInt(hex.substring(4, 6), 16)/255
		)
	}
});

dm.Color.setSlots({
	Transparent: dm.Color.clone().setAlpha(0),
	White: dm.Color.clone().setRed(1).setGreen(1).setBlue(1),
	LightGray: dm.Color.clone().setRed(212/255).setGreen(212/255).setBlue(212/255),
	Gray: dm.Color.clone().setRed(127/255).setGreen(127/255).setBlue(127/255),
	DimGray: dm.Color.clone().setRed(105/255).setGreen(105/255).setBlue(105/255),
	Black: dm.Color.clone(),
	Red: dm.Color.clone().setRed(1.0),
	Green: dm.Color.clone().setGreen(1.0),
	DarkGreen: dm.Color.clone().setGreen(100/255),
	Yellow: dm.Color.withRGB(1.0, 1.0, 0)
});
