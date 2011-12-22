TextField = Label.clone().newSlots({
	type: "TextField",
	placeholderText: "Enter Text",
	placeholderTextColor: Color.LightGray,
	growsToFit: true
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
			self.checkChanged();
		}
		
		e.onpaste = function(evt)
		{
			self.checkChanged();
		}
		
		e.onmouseup = function(evt)
		{
			self.checkChanged();
		}
		
		e.onfocus = function(evt)
		{
			if (self._originalColor)
			{
				self.setColor(self._originalColor);
			}
			setTimeout(function(){
				self.selectAll();
			});
		}
		
		e.onblur = function(evt)
		{
			self.setText(self.text()); //placeholder color
			
			if (!(self.delegate() && self.delegate().canPerform(self.delegateMessageName("shouldEndEditing"))) || self.delegatePerform("shouldEndEditing"))
			{
				self.delegatePerform("editingEnded", self);
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
	
	checkChanged: function()
	{
		var self = this;
		setTimeout(function(){
			if (self.text() != self._lastText)
			{
				self._lastText = self.text();
				if (self.growsToFit())
				{
					self.sizeToFit();
				}
				console.log("changed");
				self.delegatePerform("changed");
			}
		});
	},
	
	/*
	setCursorPosition: function(position)
	{
		var e = this.element();
		if(e.setSelectionRange)
		{
			e.setSelectionRange(position, position);
		}
		else if (e.createTextRange)
		{
			var range = e.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	},
	*/
	
	setText: function(text)
	{
		Label.setText.call(this, text);
		
		if (text.strip() == "")
		{
			this._originalColor = this.color();
			this.setColor(this.placeholderTextColor());
			this.element().innerText = this.placeholderText();
		}
		else
		{
			if (this._originalColor)
			{
				this.setColor(this._originalColor);
				delete this._originalColor;
			}
		}
		
		this.checkChanged();
	},
	
	text: function()
	{
		var text = this.element().innerText;
		if (text == this.placeholderText())
		{
			return "";
		}
		else
		{
			return text;
		}
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
