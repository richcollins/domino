dm.EditableSlot = dm.Proto.clone().newSlots({
	type: "dm.EditableSlot",
	object: null,
	name: null,
	normalizer: null,
	label: null,
	labelText: null,
	control: null,
	slotEditorView: null,
	controlProto: null,
	controlWidth: 200
}).setSlots({
	label: function()
	{
		if (!this._label)
		{
			var l = dm.Label.clone();
			l.setText(this.name().humanized());
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
	
	updateValue: function()
	{
		var v = this.control().value();
		var normalizer = this.normalizer() || function(v){ return v };
		try
		{
			v = normalizer(v);
		}
		catch (e)
		{
			console.log(e);
		}
		
		this.object().perform("set" + this.name().asCapitalized(), v)
	},
	
	value: function()
	{
		return this.object().perform(this.name())
	},
	
	addTo: function(slotEditorView)
	{
		var row = this.object().editableSlots().indexOf(this);
		slotEditorView.addAtRowCol(this.label(), row, 0);
		this.control().setValue(this.value());
		if (this.controlWidth())
		{
			this.control().setWidth(this.controlWidth());
		}
		else
		{
			this.control().sizeWidthToFit();
		}
		this.control().sizeHeightToFit();
		
		slotEditorView.addAtRowCol(this.control(), row, 1);
		this.setSlotEditorView(slotEditorView);
	}
});
