dm.Editable = dm.Delegator.clone().newSlots({
	type: "dm.Editable",
	watchesSlots: true,
	editableSlotDescriptions: [],
	editableSlots: null
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		this.setEditableSlotDescriptions(this.editableSlotDescriptions().copy());
	},
	
	newEditableSlots: function()
	{
		var self = this;
		dm.Arguments_asArray(arguments).forEach(function(description){
			self.editableSlotDescriptions().append(description);
			
			self.newSlot(description.name, description.value);
			
			self["set" + description.name.asCapitalized()] = function(newValue)
			{
				var oldValue = this["_" + description.name];
				if (oldValue != newValue)
				{
					this["_" + description.name] = newValue;
					if (this.watchesSlots())
					{
						this.delegatePerform("slotChanged", description.name, oldValue, newValue);
					}
				}

				return this;
			}
		});
		
		return this;
	},
	
	editableSlots: function()
	{
		if (!this._editableSlots)
		{
			this._editableSlots = [];
			var self = this;
			this.editableSlotDescriptions().forEach(function(description){
				var editableSlot = dm.Object_lookupPath(window, "dm.Editable" + description.control.type.asCapitalized() + "Slot").clone();
				var control = dm.Object_shallowCopy(description.control);
				delete control.type;
				editableSlot.control().performSets(control);
				editableSlot.setName(description.name);
				editableSlot.setNormalizer(description.normalizer);
				editableSlot.setObject(self);
				editableSlot.setSectionName(description.sectionName);
				if (description.label)
				{
					editableSlot.label().performSets(description.label).sizeToFit();
				}
				self._editableSlots.append(editableSlot);
			});
		}
		
		return this._editableSlots;
	},
	
	asObject: function()
	{
		var obj = {};
		this.editableSlots().forEach(function(s){
			obj[s.name()] = s.value();
		});
		return obj;
	},
	
	asJson: function()
	{
		return JSON.stringify(this.asObject());
	}
});
