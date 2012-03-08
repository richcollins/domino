dm.EditableCheckBoxSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableCheckBoxSlot",
	controlProto: dm.CheckBox
}).setSlots({
	checkBoxChanged: function(dd)
	{
		this.updateValue();
	}
});
