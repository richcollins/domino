EditableDropDownSlot = EditableSlot.clone().newSlots({
	type: "EditableDropDownSlot",
	options: [],
	controlProto: DropDown
}).setSlots({
	init: function()
	{
		this.setOptions(this.options().copy());
	},
	
	control: function()
	{
		if (!this._control)
		{
			var c = EditableSlot.control.call(this);
			c.setOptions(this.options());
		}
		return this._control;
	},
	
	dropDownChanged: function(dd)
	{
		this.updateValue();
	}
});
