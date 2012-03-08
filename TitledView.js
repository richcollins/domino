dm.TitledView = dm.View.clone().newSlots({
	type: "dm.TitledView",
	title: "",
	titleBar: null,
	contentView: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		
		if (dm.Window.inited())
		{
			var l = dm.Label.clone();
			l.setText("Title Bar");
			l.sizeToFit();
			l.resizeCentered();

			var tb = dm.View.clone();
			tb.setBackgroundColor(dm.Color.LightGray);
			tb.setWidth(l.width() + l.fontSize());
			tb.setHeight(l.height() + l.fontSize());
			tb.setResizesWidth(true);
			tb.addSubview(l);
			tb.newSlot("label", l);

			l.center();
			this.setTitleBar(tb);

			var cv = dm.View.clone();
			cv.setWidth(tb.width());
			cv.setHeight(1);
			cv.setY(tb.height());
			cv.setResizesWidth(true);
			cv.setResizesHeight(true);
			this.setContentView(cv);

			this.setWidth(tb.width());
			this.setHeight(tb.height() + cv.height());

			var tbDivider = dm.View.clone();
			tbDivider.setBackgroundColor(dm.Color.Gray);
			tbDivider.setY(tb.height());
			tbDivider.setWidth(tb.width());
			tbDivider.setHeight(1);
			tbDivider.setResizesWidth(true);

			var rightDivider = dm.View.clone();
			rightDivider.setBackgroundColor(dm.Color.Gray);
			rightDivider.setX(this.width() - 1);
			rightDivider.setWidth(1);
			rightDivider.setHeight(this.height());
			rightDivider.setResizesLeft(true);
			rightDivider.setResizesHeight(true);

			this.addSubview(tb);
			this.addSubview(tbDivider);
			this.addSubview(cv);
			this.addSubview(rightDivider);
		}
	},
	
	setTitle: function(title)
	{
		var l = this.titleBar().label();
		l.setText(title);
		l.sizeToFit();
		l.center();
		this._title = title;
	}
});
