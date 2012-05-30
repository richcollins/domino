dm.EditableCheckBoxSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableCheckBoxSlot",
	controlProto: dm.CheckBox,
	controlWidth: 0 //sizeToFit
}).setSlots({
	checkBoxChanged: function(dd)
	{
		//this.updateValue();
	}
});
