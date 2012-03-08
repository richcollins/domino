dm.EditableTextAreaSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableTextAreaSlot",
	controlProto: dm.TextArea
}).setSlots({
	textAreaEditingEnded: function(tf)
	{
		this.updateValue();
	}
});
