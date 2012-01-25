EditableTextAreaSlot = EditableSlot.clone().newSlots({
	type: "EditableTextAreaSlot",
	controlProto: TextArea
}).setSlots({
	textAreaEditingEnded: function(tf)
	{
		this.updateValue();
	}
});
