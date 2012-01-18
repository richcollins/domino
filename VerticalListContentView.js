VerticalListContentView = View.clone().newSlots({
	type: "VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15,
	confirmsRemove: true,
	closeButton: null,
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		this.setItems(this.items().copy());
		
		if(Window.inited())
		{
			var closeButton = ImageButton.clone().newSlot("itemView", null);
			this.setCloseButton(closeButton);
			closeButton.setDelegate(this);
			closeButton.setDelegatePrefix("closeButton");
			closeButton.setImageUrl("http://f.cl.ly/items/3P3Y2Z2B31222w0l1K0E/gray-close.png");
			closeButton.setWidth(12);
			closeButton.setHeight(12);
			closeButton.setX(this.width() - closeButton.width() - closeButton.width()/2);
			closeButton.setResizesLeft(true);
			closeButton.setZIndex(1);
			closeButton.hide();
			this.addSubview(closeButton);
		}
	},
	
	addItemWithText: function(text)
	{
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		
		var itemView = Button.clone().newSlots({
			type: "ItemView",
			label: null
		}).clone();
		itemView.setTracksMouse(true);
		itemView.setDelegate(this);
		itemView.setWidth(this.width());
		itemView.setResizesWidth(true);
		
		var label = Label.clone();
		itemView.setLabel(label);
		label.setColor(Color.Gray);
		label.setText(text);
		label.setWidth(this.width() - hMargin - 2*this.closeButton().width());
		label.sizeHeightToFit();
		label.setX(hMargin);
		itemView.setHeight(label.height() + hMargin);
		itemView.addSubview(label);
		
		itemView.addSubview(label);
		label.centerVertically();
		
		this.addItem(itemView);
	},
	
	itemViewMouseEntered: function(itemView, previousView)
	{
		if (!this.closeButton().contains(previousView))
		{
			var closeButton = this.closeButton();
			closeButton.centerYOver(itemView);
			closeButton.moveDown(1);
			closeButton.show();
			closeButton.setItemView(itemView);
		}
	},
	
	itemViewMouseExited: function(itemView, nextView)
	{
		if (!this.closeButton().contains(nextView))
		{
			var closeButton = this.closeButton();
			closeButton.hide();
			closeButton.setItemView(null);
		}
	},
	
	itemViewClicked: function(button)
	{
		if (this.selectedItemIndex() !== null)
		{
			var selectedItem = this.selectedItem();
			if (selectedItem)
			{
				var l = selectedItem.label();
				l.setColor(Color.Gray);
				l.setFontWeight("normal");
			}
		}

		var l = button.label();
		l.setColor(Color.Black);
		l.setFontWeight("bold");
		
		this.setSelectedItemIndex(this.items().indexOf(button));

		this.delegatePerform("selectedItem", button);
	},
	
	addItem: function(itemView)
	{
		var hMargin = VerticalListContentView.itemHMargin();
		
		itemView.setY(this.items().length * itemView.height());
		this.setHeight(itemView.bottomEdge());
		this.addSubview(itemView);
		this.items().append(itemView);
	},
	
	removeLastItem: function()
	{
		var item = this.items().pop();
		
		this.removeSubview(item);
		this.setHeight(this.height() - item.height());
	},
	
	selectItem: function(item)
	{
		this.itemViewClicked(item);
	},
	
	removeItem: function(item)
	{
		if (this.confirmsRemove())
		{
			if (!confirm("Remove " + item.label().text() + "?"))
			{
				return;
			}
		}
		
		var selectedItem = this.selectedItem();
		
		var itemIndex = this.items().indexOf(item);
		this.items().remove(item);
		this.items().slice(itemIndex).forEach(function(itemToMove){
			itemToMove.setY(itemToMove.y() - item.height());
		});
		this.removeSubview(item);
		this.setHeight(this.height() - item.height());
		if (selectedItem == item)
		{
			var itemToSelect = this.items()[itemIndex] || this.items().last();
			if (itemToSelect)
			{
				this.selectItem(itemToSelect);
			}
		}
		var newItemAtIndex = this.items()[itemIndex];
		if (newItemAtIndex)
		{
			this.itemViewMouseEntered(newItemAtIndex, null);
		}
		
		this.delegatePerform("removedItem", item);
	},
	
	closeButtonClicked: function(closeButton)
	{
		this.removeItem(closeButton.itemView());
	},
	
	selectedItem: function()
	{
		return this.items()[this.selectedItemIndex()];
	},
	
	removeSelectedItem: function()
	{
		this.removeItem(this.selectedItem());
	}
});
