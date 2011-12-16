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
		this._object = object;
		
		var rows = this.rows();
		this.empty();
		
		var self = this;
		object.editableSlots().forEach(function(editableSlot){
			editableSlot.addTo(self);
		});
	}
});
