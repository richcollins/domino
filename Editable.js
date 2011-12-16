Editable = Proto.clone().newSlots({
	type: "Editable",
	watchesSlots: true,
	editableSlotDescriptions: {},
	editableSlots: null
}).setSlots({
	init: function()
	{
		this.setEditableSlotDescriptions(Object_clone(this.editableSlotDescriptions()));
	},
	
	newEditableSlot: function(name, value)
	{
		this.newSlot(name, value);

		this["set" + name.asCapitalized()] = function(newValue)
		{
			var oldValue = this["_" + name];
			if (oldValue != newValue)
			{
				this["_" + name] = newValue;
				if (this.watchesSlots())
				{
					this.conditionallyPerform("slotChanged", name, oldValue, newValue);
				}
			}

			return this;
		}
	},
	
	editableSlots: function()
	{
		if (!this._editableSlots)
		{
			this._editableSlots = [];
			for (var name in this.editableSlotDescriptions())
			{
				var description = this.editableSlotDescriptions()[name];
				var editableSlot = window["Editable" + description.control.type.asCapitalized() + "Slot"].clone();
				var control = Object_shallowCopy(description.control);
				delete control.type;
				editableSlot.performSets(control);
				editableSlot.setName(name);
				editableSlot.setObject(this);
				this.editableSlots().append(editableSlot);
			}
		}
		
		return this._editableSlots;
	},
	
	newEditableSlots: function(descriptions)
	{
		this.setEditableSlotDescriptions(descriptions);
		for (var name in this.editableSlotDescriptions())
		{
			var description = this.editableSlotDescriptions()[name];
			this.newEditableSlot(name, description.value);
		}
		
		return this;
	}
});
