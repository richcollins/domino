EditableSlot = Proto.clone().newSlots({
	type: "EditableSlot",
	object: null,
	name: null,
	label: null,
	control: null,
	slotEditorView: null,
	controlProto: TextField
}).setSlots({
	label: function()
	{
		if (!this._label)
		{
			var l = Label.clone();
			l.setText(this.name());
			l.sizeToFit();
			this._label = l;
		}
		return this._label;
	},
	
	control: function()
	{
		if (!this._control)
		{
			var c = this.controlProto().clone();
			c.setDelegate(this);
			this._control = c;
		}
		return this._control;
	},
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	},
	
	updateValue: function(v)
	{
		this.object().perform("set" + this.name().asCapitalized(), this.control().value());
	},
	
	addTo: function(slotEditorView)
	{
		var row = this.object().editableSlots().indexOf(this);
		slotEditorView.addAtRowCol(this.label(), row, 0);
		this.control().setValue(this.object().perform(this.name()));
		this.control().sizeToFit();
		slotEditorView.addAtRowCol(this.control(), row, 1);
	}
});
