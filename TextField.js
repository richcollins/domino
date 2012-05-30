dm.TextField = dm.Label.clone().newSlots({
	type: "dm.TextField",
	elementName: "input",
	placeholderText: "Enter Text",
	placeholderTextColor: dm.Color.Gray,
	growsToFit: false
}).setSlots({
	initElement: function()
	{
		dm.NativeControl.initElement.call(this); //hack since TextField clones Label
		
		var e = this.element();
		
		e.type = "text";
		
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
		
		this.setText(this.text());
	},
	
	sizingElement: function()
	{
		var e = document.createElement("div");

		var clonedElement = this.element().cloneNode(true);
		document.body.appendChild(clonedElement);
		var myStyle = window.getComputedStyle(clonedElement);
		for (var i = myStyle.length - 1; i > -1; i --)
		{
		    var name = myStyle[i];
		    e.style.setProperty(name, myStyle.getPropertyValue(name));
		}
		document.body.removeChild(clonedElement);

		e.style.display = "block";
		e.style.position = "fixed";
		e.style.width = "";
		e.style.height = "";
		e.style.top = screen.height + "px";
		if (this.text() == "")
		{
			e.innerText = this.placeholderText() || " ";
		}
		else
		{
			e.innerText = this.text();
		}
		document.body.appendChild(e);
		return e;
	},
	
	width: function()
	{
		var style = window.getComputedStyle(this.element());
		return this.cssWidth() +
			parseFloat(style.getPropertyValue("padding-left") || 0) +
			parseFloat(style.getPropertyValue("padding-right") || 0) +
			parseFloat(style.getPropertyValue("border-left-width") || 0) +
			parseFloat(style.getPropertyValue("border-right-width") || 0) + 2;
	},
	
	height: function()
	{
		var style = window.getComputedStyle(this.element());
		return this.cssHeight() + parseFloat(style.getPropertyValue("padding-top") || 0) + parseFloat(style.getPropertyValue("padding-bottom") || 0) + parseFloat(style.getPropertyValue("border-top-width") || 0) + parseFloat(style.getPropertyValue("border-bottom-width") || 0);
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
				
				self.changed();
			}
		});
	},
	
	changed: function()
	{
		this.delegatePerform("changed");
	},
	
	setText: function(text)
	{
		if (text.strip() == "")
		{
			if (!this._originalColor)
			{
				this._originalColor = this.color();
			}
			this.setColor(this.placeholderTextColor());
			this.element().value = this.placeholderText();
		}
		else
		{
			if (this._originalColor)
			{
				this.setColor(this._originalColor);
				delete this._originalColor;
			}
			else
			{
				this.setColor(dm.TextField.color());
			}
			this.element().value = text;
		}
		
		this.checkChanged();
		
		return this;
	},
	
	text: function()
	{
		var text = this.element().value;
		if (text == this.placeholderText())
		{
			return "";
		}
		else
		{
			return text;
		}
	},
	
	setPlaceholderText: function(placeholderText)
	{
		var text = this.text();
		this._placeholderText = placeholderText;
		this.setText(text);
		return this;
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
