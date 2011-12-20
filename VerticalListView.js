VerticalListView = TitledView.clone().newSlots({
	type: "VerticalListView",
	scrollView: null,
	controlsView: null,
	addButton: null,
	removeButton: null,
	defaultItemText: "New Item"
}).setSlots({
	init: function()
	{
		TitledView.init.call(this);
		
		if (Window.inited())
		{
			var addButton = Button.clone();
			addButton.setFontWeight("bold");
			addButton.setText("+");
			addButton.setColor(Color.DimGray);
			addButton.sizeToFit();
			addButton.setX(addButton.fontSize());
			addButton.setY(addButton.fontSize()/2);
			addButton.setDelegate(this, "addButton").setDelegatePrefix("addButton");
			this.setAddButton(addButton);
			
			var removeButton = Button.clone();
			removeButton.setFontWeight("bold");
			removeButton.setText("−");
			removeButton.setColor(Color.DimGray);
			removeButton.sizeToFit();
			removeButton.setX(2*addButton.fontSize() + addButton.width()/2);
			removeButton.setY(addButton.fontSize()/2);
			removeButton.setDelegate(this).setDelegatePrefix("removeButton");
			this.setRemoveButton(removeButton);
		
			var selfWidth = Math.max(addButton.width() + removeButton.width() + 3*addButton.fontSize(), this.titleBar().width());
		
			var contentView = VerticalListContentView.clone();
			contentView.setWidth(selfWidth);
			contentView.setResizesWidth(true);
			contentView.setDelegate(this);
			contentView.setDelegatePrefix("vlcv");
		
			var scrollView = ScrollView.clone();
			scrollView.setWidth(selfWidth);
			scrollView.setHeight(1);
			scrollView.setResizesHeight(true);
			scrollView.setResizesWidth(true);
			scrollView.setContentView(contentView);
			this.setScrollView(scrollView);
		
			var controlsView = View.clone();
			controlsView.setBackgroundColor(Color.LightGray);
			controlsView.setY(scrollView.height());
			controlsView.setWidth(selfWidth);
			controlsView.setHeight(addButton.height() + 0.5*addButton.fontSize());
			controlsView.setResizesWidth(true);
			controlsView.setResizesTop(true);
		
			this.setControlsView(controlsView);
		
			var controlsDivider = View.clone();
			controlsDivider.setBackgroundColor(Color.Gray);
			controlsDivider.setY(controlsView.y() - 1);
			controlsDivider.setWidth(selfWidth);
			controlsDivider.setHeight(1);
			controlsDivider.setResizesTop(true);
			controlsDivider.setResizesWidth(true);
		
			this.setWidth(selfWidth);
			this.setHeight(this.titleBar().height() + scrollView.height() + controlsView.height());
		
			var cv = this.contentView();
			cv.addSubview(scrollView);
			cv.addSubview(controlsView);
			cv.addSubview(controlsDivider);
			cv.addSubview(addButton);
			cv.addSubview(removeButton);
		}
	},
	
	addButtonClicked: function()
	{
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		var textField = TextField.clone();
		textField.setText(this.defaultItemText());
		textField.setWidth(this.width() - 2*hMargin);
		textField.sizeHeightToFit();
		textField.setX(hMargin);
		textField.setDelegate(this);
		
		var itemView = View.clone();
		itemView.setWidth(this.width());
		itemView.setHeight(textField.height() + vMargin);
		
		itemView.addSubview(textField);
		textField.centerVertically();
		
		var sv = this.scrollView();
		var cv = sv.contentView();
		cv.addItem(itemView);
		this.scrollView().scrollToBottom();
		
		textField.focus();
		textField.selectAll();
		
		if (!this.shouldDockButton())
		{
			this.addButton().setHidden(true);
			this.removeButton().setHidden(true);
		}
	},
	
	vlcv: function()
	{
		return this.scrollView().contentView();
	},
	
	removeButtonClicked: function()
	{
		var items = this.vlcv().items();
		var itemCount = items.length;
		var selectedItem = this.vlcv().selectedItem();
		this.vlcv().removeSelectedItem();
		if (items.length != itemCount)
		{
			this.updateButtons();
			this.delegatePerform("removedItem", selectedItem);
		}
	},
	
	textFieldShouldEndEditing: function(textField)
	{
		return !(this.delegate() && this.delegate().canPerform(this.delegateMessageName("shouldAddItemWithText"))) || this.delegatePerform("shouldAddItemWithText", textField.text());
	},
	
	textFieldEditingEnded: function(textField)
	{
		var cv = this.scrollView().contentView();
		cv.removeLastItem();
		cv.addItemWithText(textField.text());
		cv.buttonClicked(cv.items().last());
		this.scrollView().scrollToBottom();
	},
	
	shouldDockButton: function()
	{
		return (this.scrollView().contentView().height() + this.addButton().height()) > this.scrollView().height()
	},
	
	updateButtons: function()
	{
		if (this.shouldDockButton())
		{
			this.addButton().setY(this.scrollView().height() + this.controlsView().height()/2 - this.addButton().height()/2 - 2);
			this.addButton().setResizesTop(true);
			this.addButton().setResizesBottom(false);
			
			this.removeButton().setY(this.scrollView().height() + this.controlsView().height()/2 - this.removeButton().height()/2 - 2);
			this.removeButton().setResizesTop(true);
			this.removeButton().setResizesBottom(false);
		}
		else
		{
			this.addButton().setY(this.scrollView().contentView().height());
			this.addButton().setResizesTop(false);
			this.addButton().setResizesBottom(true);
			
			this.removeButton().setY(this.scrollView().contentView().height());
			this.removeButton().setResizesTop(false);
			this.removeButton().setResizesBottom(true);
		}
		
		this.addButton().setHidden(false);
		this.removeButton().setHidden(this.vlcv().items().length == 0);
	},
	
	vlcvSelectedItem: function(contentView, item)
	{
		this.updateButtons();
		this.delegatePerform("vlvSelectedItem", item);
	},
	
	selectFirstItem: function()
	{
		var vlcv = this.scrollView().contentView();
		var item = vlcv.items().first();
		if (item)
		{
			vlcv.selectItem(item);
		}
	},
	
	selectItemWithTitle: function(title)
	{
		var vlcv = this.scrollView().contentView();
		var item = vlcv.items().detect(function(item){ return item.label().text() == title });
		if (item)
		{
			vlcv.selectItem(item);
		}
	},
	
	cancelAdd: function()
	{
		this.addButton().setHidden(false);
		this.removeButton().setHidden(false);
		this.scrollView().contentView().removeLastItem();
	},
	
	isEmpty: function()
	{
		return this.vlcv().items().length == 0;
	}
});
