TextField = Label.clone().newSlots({
	type: "TextField"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var e = this.element();
		e.contentEditable = true;
		e.style.outline = "none";
		
		var self = this;
		e.onkeydown = function(evt)
		{
			if (evt.keyCode == 13)
			{
				self.preventDefault(evt);
				
				self.element().blur();
			}
		}
		
		e.onblur = function(evt)
		{
			if (!(self.delegate() && self.delegate().canPerform("textFieldShouldEndEditing")) || self.delegatePerform("textFieldShouldEndEditing"))
			{
				self.delegatePerform("textFieldEditingEnded", self);
			}
			else
			{
				setTimeout(function(){
					self.focus();
					self.selectAll();
				});
			}
		}
	},
	
	text: function()
	{
		return this.element().innerText;
	},
	
	sizingElement: function()
	{
		var e = Label.sizingElement.call(this);
		e.contentEditable = false;
		return e;
	},
	
	selectAll: function()
	{
		var range = document.createRange();
		range.selectNodeContents(this.element());
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
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
