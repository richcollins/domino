View = Delegator.clone().newSlots({
	type: "View",
	superview: null,
	subviews: [],
	element: null,
	elementName: "div",
	resizesLeft: false,
	resizesRight: false,
	resizesWidth: false,
	resizesTop: false,
	resizesBottom: false,
	resizesHeight: false,
	styleSlots: []
}).setSlot("newStyleSlots", function(slots){
	for (var name in slots)
	{
		var p = slots[name];
		var s = StyleSlot.clone();
		s.setView(this);
		s.setName(name);
		s.setStyleName(p.name || name);
		s.setValue(p.value);
		if (p.transformation)
		{
			var proto = window[p.transformation.name.asCapitalized() + "Transformation"];
			if (proto)
			{
				s.setTransformation(proto.clone().setSlots(p.transformation));
			}
		}
		s.addToView();
	}
	return this;
}).newStyleSlots({
	x: { name: "left", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	y: { name: "top", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	width: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	height: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	backgroundColor: { value: Color.Transparent, transformation: { name: "color" } },
	visibility: { value: "visible" },
	zIndex: { value: 0 }
});

View.setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		this.setStyleSlots(this.styleSlots().copy());
		this.createElement();
		this.initElement();
		this.setSubviews(this.subviews().copy());
	},

	createElement: function()
	{
		var e = document.createElement(this.elementName());
		e.style.position = "absolute";
		e.style.overflow = "hidden";
		this.setElement(e);
	},

	initElement: function()
	{
		var self = this;
		this.styleSlots().forEach(function(ss){
			self.perform("set" + ss.name().asCapitalized(), self.perform(ss.name()));
		});
	},
	
	setHidden: function(hidden)
	{
		this.setVisibility(hidden ? "hidden" : "visible");
		this.subviews().forEachPerform("setVisibility", this.visibility());
	},
	
	hidden: function()
	{
		return this.visibility() == "hidden";
	},
	
	show: function()
	{
		this.setHidden(false);
		return this;
	},
	
	hide: function()
	{
		this.setHidden(true);
		return this;
	},
	
	addEventListener: function(name, fn)
	{
		var e = this.element();
		if (e.addEventListener)
		{
			e.addEventListener(name, fn, false);
		}
		else
		{
			e.attachEvent(name, fn);
		}
	},
	
	preventDefault: function(evt)
	{
		if(evt.preventDefault)
		{
			evt.preventDefault();
		}
		else if(evt.returnValue)
		{
			evt.returnValue = false;
		}
	},
	
	removeAllSubviews: function()
	{
		var self = this;
		this.subviews().copy().forEach(function(sv){
			self.removeSubview(sv);
		});
	},

	removeSubview: function(subview)
	{
		if (!subview)
		{
			return this;
		}
		if (subview.superview() != this)
		{
			throw "view is not a subview";
		}
		this.subviews().remove(subview);
		subview.setSuperview(null);
		this.element().removeChild(subview.element());
	},

	addSubview: function(subview)
	{
		var oldSuperview = subview.superview();
		if (oldSuperview)
		{
			oldSuperview.removeSubview(subview);
		}
		subview.setSuperview(this);
		this.subviews().append(subview);
		this.element().appendChild(subview.element());
		
		//subview.conditionallyPerform("didAddToSuperview");
	},
	
	addSubviews: function()
	{
		var self = this;
		Arguments_asArray(arguments).forEach(function(view){
			self.addSubview(view);
		});
	},
	
	rightEdge: function()
	{
		return this.x() + this.width();
	},
	
	bottomEdge: function()
	{
		return this.y() + this.height();
	},
	
	moveRightOf: function(view, margin)
	{
		this.setX(view.rightEdge() + margin);
	},
	
	moveBelow: function(view, margin)
	{
		this.setY(view.bottomEdge() + margin);
	},
	
	alignTopTo: function(view)
	{
		this.setY(view.y());
	},
	
	alignMiddleTo: function(view)
	{
		this.setY(view.y() + .5*view.height() - .5*this.height());
	},
	
	alignBottomTo: function(view)
	{
		this.setY(view.bottomEdge() - this.height() - 1);
	},
	
	alignRightTo: function(view)
	{
		this.setX(view.rightEdge() - this.width() - 1);
	},
	
	center: function()
	{
		this.centerHorizontally();
		this.centerVertically();
		return this;
	},
	
	centerHorizontally: function()
	{
		var s = this.superview();
		if (s)
		{
			this.setX((s.width() - this.width())/2);
		}
	},
	
	centerVertically: function()
	{
		var s = this.superview();
		if (s)
		{
			this.setY((s.height() - this.height())/2);
		}
	},
	
	_setWidth: View.setWidth,
	
	setWidth: function(newWidth)
	{
		var lastWidth = this.width();
		this._setWidth(newWidth);
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
		var currentSuperWidth = this.superview().width();
		var myLastWidth = this.width();
		
		if (this.resizesLeft())
		{
			if (this.resizesRight())
			{
				if(this.resizesWidth())
				{
					this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
				}
				
				this.setX(this.x() * (currentSuperWidth - this.width()) / (lastSuperWidth - myLastWidth));
			}
			else
			{
				if(this.resizesWidth())
				{
					this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
				}
				
				this.setX(this.x() + myLastWidth + currentSuperWidth - this.width() - lastSuperWidth);
			}
		}
		else if (this.resizesRight())
		{
			if(this.resizesWidth())
			{
				this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
			}
		}
		else if (this.resizesWidth())
		{
			this.setWidth(currentSuperWidth - (lastSuperWidth - myLastWidth));
		}
	},
	
	_setHeight: View.setHeight,
	
	setHeight: function(newHeight)
	{
		var lastHeight = this.height();
		this._setHeight(newHeight);
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
	},
	
	autoResizeHeight: function(lastSuperHeight)
	{
		var currentSuperHeight = this.superview().height();
		var myLastHeight = this.height();
		
		if (this.resizesTop())
		{
			if (this.resizesBottom())
			{
				if(this.resizesHeight())
				{
					this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
				}
				
				this.setY(this.y() * (currentSuperHeight - this.height()) / (lastSuperHeight - myLastHeight));
			}
			else
			{
				if(this.resizesHeight())
				{
					this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
				}
				
				this.setY(this.y() + myLastHeight + currentSuperHeight - this.height() - lastSuperHeight);
			}
		}
		else if (this.resizesBottom())
		{
			if(this.resizesHeight())
			{
				this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
			}
		}
		else if (this.resizesHeight())
		{
			this.setHeight(currentSuperHeight - (lastSuperHeight - myLastHeight));
		}
	},
	
	autoResize: function(width, height)
	{
		this.autoResizeWidth(width);
		this.autoResizeHeight(height);
	},
	
	resizeCentered: function()
	{
		this.resizeCenteredHorizontally(true);
		this.resizeCenteredVertically(true);
	},
	
	resizeCenteredHorizontally: function()
	{
		this.setResizesLeft(true);
		this.setResizesRight(true);
	},
	
	resizeCenteredVertically: function()
	{
		this.setResizesTop(true);
		this.setResizesBottom(true);
	},
	
	resizeToFill: function()
	{
		this.setResizesWidth(true);
		this.setResizesHeight(true);
	},
	
	scaleToFitSuperview: function()
	{
		var superview = this.superview();
		var aspectRatio = this.width() / this.height();

		if(aspectRatio > superview.width()/superview.height())
		{
			this.setWidth(superview.width());
			this.setHeight(superview.width() / aspectRatio);
		}
		else
		{
			this.setWidth(superview.height() * aspectRatio);
			this.setHeight(superview.height());
		}
	},
	
	sizingElement: function()
	{
		var e = this.element().cloneNode(true);
		var s = e.style;
		s.position = "fixed";
		s.width = "";
		s.height = "";
		s.top = screen.height + "px";
		document.body.appendChild(e);
		
		return e;
	},
	
	sizeWidthToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		this.setWidth(e.clientWidth);
		document.body.removeChild(e);
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.clientHeight);
		document.body.removeChild(e);
	},
	
	sizeToFit: function()
	{
		this.sizeWidthToFit();
		this.sizeHeightToFit();
	},
	
	moveToBack: function()
	{
		this.setZIndex(this.superview().subviews().mapPerform("zIndex").min() - 1);
	}
});
