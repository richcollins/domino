TitledView = View.clone().newSlots({
	type: "TitledView",
	title: "",
	titleBar: null,
	contentView: null
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		if (Window.inited())
		{
			var l = Label.clone();
			l.setText("Title Bar");
			l.sizeToFit();
			l.resizeCentered();

			var tb = View.clone();
			tb.setBackgroundColor(Color.LightGray);
			tb.setWidth(l.width() + l.fontSize());
			tb.setHeight(l.height() + l.fontSize());
			tb.setResizesWidth(true);
			tb.addSubview(l);
			tb.newSlot("label", l);

			l.center();
			this.setTitleBar(tb);

			var cv = View.clone();
			cv.setWidth(tb.width());
			cv.setHeight(1);
			cv.setY(tb.height());
			cv.setResizesWidth(true);
			cv.setResizesHeight(true);
			this.setContentView(cv);

			this.setWidth(tb.width());
			this.setHeight(tb.height() + cv.height());

			var tbDivider = View.clone();
			tbDivider.setBackgroundColor(Color.Gray);
			tbDivider.setY(tb.height());
			tbDivider.setWidth(tb.width());
			tbDivider.setHeight(1);
			tbDivider.setResizesWidth(true);

			var rightDivider = View.clone();
			rightDivider.setBackgroundColor(Color.Gray);
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
