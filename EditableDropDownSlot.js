dm.EditableDropDownSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableDropDownSlot",
	controlProto: dm.DropDown
}).setSlots({
	dropDownChanged: function(dd)
	{
		this.updateValue();
	}
});
