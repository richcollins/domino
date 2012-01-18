View = Delegator.clone().newSlots({
	type: "View",
	superview: null,
	subviews: [],
	element: null,
	elementName: "div",
	eventListeners: null,
	resizesLeft: false,
	resizesRight: false,
	resizesWidth: false,
	resizesTop: false,
	resizesBottom: false,
	resizesHeight: false,
	styleSlots: [],
	autoResizes: true,
	tracksMouse: false
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
	cssWidth: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	cssHeight: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	backgroundColor: { value: Color.Transparent, transformation: { name: "color" } },
	visibility: { value: "visible" },
	zIndex: { value: 0 }
});

View.setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		this.setEventListeners({});
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
	
	elementId: function()
	{
		return this.type() + "." + this.uniqueId();
	},

	initElement: function()
	{
		var self = this;
		this.element().id = this.elementId();
		this.styleSlots().forEach(function(ss){
			self.perform("set" + ss.name().asCapitalized(), self.perform(ss.name()));
		});
	},
	
	setTracksMouse: function(tracksMouse)
	{
		this._tracksMouse = tracksMouse;
		var e = this.element();
		
		if (tracksMouse)
		{
			var self = this;
			e.onmouseover = function(e)
			{
				if ((self.element() == e.fromElement) || self.detectAncestorView(function(v){ return v.element() == e.fromElement }))
				{
					return;
				}
				
				self.delegatePerform("mouseEntered", Window.viewWithElement(e.fromElement));
			}
			e.onmouseout = function(e)
			{
				if ((self.element() == e.toElement) || self.detectAncestorView(function(v){ return v.element() == e.toElement }))
				{
					return;
				}

				self.delegatePerform("mouseExited", Window.viewWithElement(e.toElement));
			}
		}
		else
		{
			delete e.onmouseover;
			delete e.onmouseout;
		}
	},
	
	viewWithElement: function(e)
	{
		return this.detectAncestorView(function(v){ return v.element() == e });
	},
	
	contains: function(sv)
	{
		return (sv == this) || this.detectAncestorView(function(v){ return v == sv });
	},
	
	detectAncestorView: function(fn)
	{
		for (var i = 0; i < this.subviews().length; i ++)
		{
			var sv = this.subviews()[i];
			if(fn(sv))
			{
				return sv;
			}
			else
			{
				var av = sv.detectAncestorView(fn);
				if (av)
				{
					return av;
				}
			}
		}
		
		return null;
	},
	
	width: function()
	{
		return this.cssWidth();
	},
	
	setWidth: function(w)
	{
		var lastWidth = this.width();
		this.setCssWidth(w);
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
		
		return this;
	},
	
	height: function()
	{
		return this.cssHeight();
	},
	
	setHeight: function(h)
	{
		var lastHeight = this.height();
		this.setCssHeight(h);
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
		
		return this;
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
		if (!this._eventListeners[name])
		{
			this._eventListeners[name] = [];
		}
		this._eventListeners[name].append(fn);
		
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
	
	removeEventListener: function(name, fn)
	{
		var e = this.element();
		if (e.removeEventListener)
		{
			e.removeEventListener(name, fn);
		}
		else
		{
			e.detachEvent(name, fn);
		}
	},
	
	removeEventListeners: function(name)
	{
		var listeners = this._eventListeners[name];
		if (listeners)
		{
			var self = this;
			listeners.forEach(function(listener){
				self.removeEventListener(name, listener);
			});
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
	
	removeAllSubviews: function()
	{
		var self = this;
		this.subviews().copy().forEach(function(sv){
			self.removeSubview(sv);
		});
	},
	
	removeFromSuperview: function()
	{
		if (this.superview())
		{
			this.superview().removeSubview(this);
		}
		return this;
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
		
		subview.conditionallyPerform("superviewChanged");
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
		margin = margin || 0;
		this.setX(view.rightEdge() + margin);
	},
	
	moveAbove: function(view, margin)
	{
		margin = margin || 0;
		this.setY(view.y() - this.height() - margin);
	},
	
	moveBelow: function(view, margin)
	{
		margin = margin || 0;
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
	
	centerXOver: function(view)
	{
		this.setX(view.x() + (view.width() - this.width())/2);
	},
	
	centerYOver: function(view)
	{
		this.setY(view.y() + (view.height() - this.height())/2);
	},
	
	centerOver: function(view)
	{
		this.centerXOver(view);
		this.centerYOver(view);
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
	
	moveToBottom: function(margin)
	{
		margin = margin || 0;
		
		this.setY(this.superview().height() - this.height() - margin);
	},
	
	moveDown: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
		if (!this.autoResizes())
		{
			return;
		}
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
	
	autoResizeHeight: function(lastSuperHeight)
	{
		if (!this.autoResizes())
		{
			return;
		}
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
		this.setWidth(e.offsetWidth);
		document.body.removeChild(e);
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.offsetHeight);
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
	},
	
	//animations
	fadeOut: function(duration)
	{
		duration = duration || 1000;
		
		var start = new Date();
		var self = this;
		var initialOpacity  = this.element().style.opacity;
		var interval = setInterval(function(){
			var elapsed = new Date().getTime() - start.getTime();
			self.element().style.opacity = 1 - (elapsed/duration);
			if (elapsed >= duration)
			{
				clearInterval(interval);
				self.hide();
				self.element().style.opacity = initialOpacity;
			}
		}, 1000/60);
	}
});
