Point = Proto.clone().newSlots({
	type: "Point",
	x: 0,
	y: 0
}).setSlots({
	scaleToFitPoint: function(point)
	{
		var aspectRatio = this.aspectRatio();

		if(aspectRatio > point.x()/point.y())
		{
			this.setX(point.x());
			this.setY(point.x() / aspectRatio);
		}
		else
		{
			this.setX(point.y() * aspectRatio);
			this.setY(point.y());
		}
		return this;
	},
	
	aspectRatio: function()
	{
		return this.x()/this.y();
	},
	
	withXY: function(x, y)
	{
		return this.clone().setX(x).setY(y);
	},
	
	isPortrait: function()
	{
		return this.aspectRatio() <= 1;
	},
	
	isLandscape: function()
	{
		return this.aspectRatio() > 1;
	},
	
	translateY: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	asLandscape: function()
	{
		return this.isLandscape() ? this : this.transposed();
	},
	
	asPortrait: function()
	{
		return this.isPortrait() ? this : this.transposed();
	},
	
	transposed: function()
	{
		return this.clone().setX(this.y()).setY(this.x());
	}
})