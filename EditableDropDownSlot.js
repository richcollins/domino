EditableDropDownSlot = EditableSlot.clone().newSlots({
	type: "EditableDropDownSlot",
	controlProto: DropDown
}).setSlots({
	dropDownChanged: function(dd)
	{
		this.updateValue();
	}
});
