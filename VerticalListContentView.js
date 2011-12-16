VerticalListContentView = View.clone().newSlots({
	type: "VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15
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
		itemView.newSlot("itemIndex", this.items().length);
		itemView.setY(itemView.itemIndex() * itemView.height());
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
			var l = this.items()[this.selectedItemIndex()].label();
			l.setColor(Color.Gray);
			l.setFontWeight("normal");
		}

		var l = button.label();
		l.setColor(Color.Black);
		l.setFontWeight("bold");
		this.setSelectedItemIndex(button.itemIndex());

		this.delegatePerform("vlcvSelectedItem", button);
	},
	
	selectItem: function(item)
	{
		this.buttonClicked(item);
	}
});
