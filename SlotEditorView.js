SlotEditorView = TableView.clone().newSlots({
	type: "PropertyEditorView",
	object: null
}).setSlots({
	init: function()
	{
		TableView.init.call(this);
		
		this.alignCol(0, TableView.ColAlignmentRight);
		this.alignCol(1, TableView.ColAlignmentLeft);
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

			var rows = this.rows();
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
