TextArea = Label.clone().newSlots({
	type: "TextArea",
	elementName: "textarea"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var e = this.element();
		
		e.style.margin = "";
		e.style.padding = "";
		
		var self = this;
		e.onblur = function(evt)
		{
			self.delegatePerform("editingEnded", self);
		}
	},
	
	setText: function(text)
	{
		this.element().value = text;
		return this;
	},
	
	text: function()
	{
		return this.element().value;
	},
	
	selectAll: function()
	{
		this.element().select();
	},
	
	focus: function()
	{
		this.element().focus();
	},
	
	value: function()
	{
		return this.text();
	},
	
	setValue: function(value)
	{
		this.setText(value);
	}
});
