dm.CheckBox = dm.NativeControl.clone().newSlots({
	type: "dm.CheckBox",
	elementName: "input",
	checked: false
}).setSlots({
	init: function()
	{
		dm.NativeControl.init.call(this);
		this.sizeToFit();
	},
	
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var self = this;
		
		var e = this.element();
		e.type = "checkbox";
		
		e.onclick = function(evt)
		{
			self.setChecked(self.element().checked);
		}
	},
	
	setChecked: function(checked)
	{
		if (this.checked() != checked)
		{
			this._checked = checked;
			this.element().checked = checked;
			this.delegatePerform("changed");
		}
	},
	
	toggleChecked: function()
	{
		this.setChecked(!this.checked());
	},
	
	sizeWidthToFit: function()
	{
		dm.View.sizeWidthToFit.call(this);
		this.setWidth(this.width() + 2);
		return this;
	},
	
	sizeHeightToFit: function()
	{
		dm.View.sizeHeightToFit.call(this);
		this.setHeight(this.height() + 2);
		return this;
	},
	
	value: function()
	{
		return this.checked();
	},

	setValue: function(value)
	{
		this.setChecked(value);
	}
});
