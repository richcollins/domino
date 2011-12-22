EditableTextFieldSlot = EditableSlot.clone().newSlots({
	type: "EditableTextFieldSlot",
	controlProto: TextField
}).setSlots({
	textFieldChanged: function(tf)
	{
		this.slotEditorView().applyLayout();
	},
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	}
});
