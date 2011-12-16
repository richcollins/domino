VerticalListContentView = View.clone().newSlots({
	type: "VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15,
	confirmsRemove: true
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		this.setItems(this.items().copy());
	},
	
	addItemWithText: function(text)
	{
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		var l = Label.clone();
		l.setColor(Color.Gray);
		l.setText(text);
		l.setWidth(this.width() - 2*hMargin);
		l.sizeHeightToFit();
		l.setX(hMargin);
		
		var b = Button.clone();
		b.newSlot("label", l);
		b.setDelegate(this);
		b.setWidth(this.width());
		b.setHeight(l.height() + hMargin);
		b.addSubview(l);
		
		l.centerVertically();
		
		this.addItem(b);
	},
	
	addItem: function(itemView)
	{
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
	
	buttonClicked: function(button)
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

		this.delegatePerform("vlcvSelectedItem", button);
	},
	
	selectItem: function(item)
	{
		this.buttonClicked(item);
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
		
		var i = this.items().indexOf(item);
		this.items().remove(item);
		this.items().slice(i).forEach(function(itemToMove, j){
			itemToMove.setY(itemToMove.y() - item.height());
		});
		this.removeSubview(item);
		this.setHeight(this.height() - item.height());
		var itemToSelect = this.items()[i] || this.items().last();
		if (itemToSelect)
		{
			this.selectItem(itemToSelect);
		}
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
