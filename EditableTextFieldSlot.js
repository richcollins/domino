dm.EditableTextFieldSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableTextFieldSlot",
	controlProto: dm.TextField
}).setSlots({
	textFieldChanged: function(tf)
	{
		if (this.slotEditorView())
		{
			this.slotEditorView().applyLayout();
		}
	},
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	}
});
