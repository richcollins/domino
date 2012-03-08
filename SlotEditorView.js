dm.SlotEditorView = dm.TableView.clone().newSlots({
	type: "dm.SlotEditorView",
	object: null
}).setSlots({
	init: function()
	{
		dm.TableView.init.call(this);
		
		this.alignCol(0, dm.TableView.ColAlignmentRight);
		this.alignCol(1, dm.TableView.ColAlignmentLeft);
	},
	
	setObject: function(object)
	{
		if (!object)
		{
			this.empty();
		}
		else
		{
			this._object = object;

			this.empty();

			var self = this;
			object.editableSlots().forEach(function(editableSlot){
				editableSlot.addTo(self);
			});
		}
	},
	
	midX: function()
	{
		return this.colWidth(0) + this.hMargin() + this.hMargin()/2;
	}
});
