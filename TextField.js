TextField = Label.clone().newSlots({
	type: "TextField",
	elementName: "input",
	placeholderText: "Enter Text",
	placeholderTextColor: Color.Gray,
	growsToFit: true
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var e = this.element();
		
		e.style.margin = "";
		e.style.padding = "";
		
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
		//e.style = window.getComputedStyle(this.element());
		var myStyle = window.getComputedStyle(this.element());
		for (var i = myStyle.length - 1; i > -1; i --)
		{
		    var name = myStyle[i];
		    e.style.setProperty(name, myStyle.getPropertyValue(name));
		}

		e.style.position = "fixed";
		e.style.width = "";
		e.style.height = "";
		e.style.top = screen.height + "px";
		if (this.text() == "")
		{
			e.innerText = this.placeholderText();
		}
		else
		{
			e.innerText = this.text()
		}
		document.body.appendChild(e);
		return e;
	},
	
	sizeWidthToFit: function()
	{
		View.sizeWidthToFit.call(this);
		this.setWidth(this.width() + 2);
		return this;
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
				self.delegatePerform("changed");
			}
		});
	},
	
	setText: function(text)
	{
		if (text.strip() == "")
		{
			this._originalColor = this.color();
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
			this.element().value = text;
		}
		
		this.checkChanged();
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
