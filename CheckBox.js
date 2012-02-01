CheckBox = NativeControl.clone().newSlots({
	type: "CheckBox",
	elementName: "input",
	checked: false
}).setSlots({
	init: function()
	{
		NativeControl.init.call(this);
		this.sizeToFit();
	},
	
	initElement: function()
	{
		View.initElement.call(this);
		
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
	
	sizeToFit: function()
	{
		View.sizeToFit.call(this);
		this.setWidth(this.width() + 2);
		this.setHeight(this.height() + 2);
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
