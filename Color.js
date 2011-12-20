Color = Proto.clone().newSlots({
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
	}
});

Color.setSlots({
	Transparent: Color.clone().setAlpha(0),
	White: Color.clone().setRed(1).setGreen(1).setBlue(1),
	LightGray: Color.clone().setRed(212/255).setGreen(212/255).setBlue(212/255),
	Gray: Color.clone().setRed(127/255).setGreen(127/255).setBlue(127/255),
	DimGray: Color.clone().setRed(105/255).setGreen(105/255).setBlue(105/255),
	Black: Color.clone(),
});
