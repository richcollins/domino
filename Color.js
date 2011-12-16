Color = Proto.clone().newSlots({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1
}).setSlots({
	withRGB: function(r, g, b)
	{
		var c = this.clone();
		c.setRed(r);
		c.setGreen(g);
		c.setBlue(b);
		return c;
	}
});

Color.setSlots({
	Transparent: Color.clone().setAlpha(0),
	White: Color.clone().setRed(255).setGreen(255).setBlue(255),
	LightGray: Color.clone().setRed(212).setGreen(212).setBlue(212),
	//DarkGray: Color.clone().setRed(168).setGreen(168).setBlue(168),
	Gray: Color.clone().setRed(127).setGreen(127).setBlue(127),
	DimGray: Color.clone().setRed(105).setGreen(105).setBlue(105),
	Black: Color.clone(),
});
