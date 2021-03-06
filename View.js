dm.View = dm.Delegator.clone().newSlots({
	type: "dm.View",
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
	tracksMouse: false,
	postsStyleChanges: false
}).setSlot("newStyleSlots", function(slots){
	for (var name in slots)
	{
		var p = slots[name];
		var s = dm.StyleSlot.clone();
		s.setView(this);
		s.setName(name);
		s.setStyleName(p.name || name);
		s.setValue(p.value);
		if (p.transformation)
		{
			var proto = dm.Object_lookupPath(window, "dm." + p.transformation.name.asCapitalized() + "Transformation");
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
	cssWidth: { name: "width", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	cssHeight: { name: "height", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	leftBorderThickness: { name: "borderLeftWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	rightBorderThickness: { name: "borderRightWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	topBorderThickness: { name: "borderTopWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	bottomBorderThickness: { name: "borderBottomWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	leftPaddingThickness: { name: "paddingLeft", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	rightPaddingThickness: { name: "paddingRight", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	topPaddingThickness: { name: "paddingTop", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	bottomPaddingThickness: { name: "paddingBottom", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	borderRadius: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	borderColor: { value: dm.Color.Black, transformation: { name: "color" } },
	backgroundColor: { value: dm.Color.Transparent, transformation: { name: "color" } },
	display: { value: "block" },
	zIndex: { value: 0 }
});

dm.View.setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		this.setEventListeners({});
		this.setStyleSlots(this.styleSlots().copy());
		this.createElement();
		this.initElement();
		this.setSubviews(this.subviews().copy());
	},
	
	domReady: function()
	{
		return dm.Window.inited();
	},

	createElement: function()
	{
		var e = document.createElement(this.elementName());
		e.style.position = "absolute";
		e.style.overflow = "hidden";
		e._dmView = this;
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
		this.element().style.borderStyle = "solid";
	},
	
	setBorderThickness: function(t)
	{
		return this.performSets({
			leftBorderThickness: t,
			rightBorderThickness: t,
			topBorderThickness: t,
			bottomBorderThickness: t
		});
	},
	
	setPaddingThickness: function(t)
	{
		return this.performSets({
			verticalPaddingThickness: t,
			horizontalPaddingThickness: t
		});
	},
	
	setVerticalPaddingThickness: function(t)
	{
		return this.performSets({
			topPaddingThickness: t/2,
			bottomPaddingThickness: t/2
		})
	},
	
	setHorizontalPaddingThickness: function(t)
	{
		return this.performSets({
			leftPaddingThickness: t/2,
			rightPaddingThickness: t/2
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
				
				self.delegatePerform("mouseEntered", dm.Window.viewWithElement(e.fromElement));
			}
			e.onmouseout = function(e)
			{
				if ((self.element() == e.toElement) || self.detectAncestorView(function(v){ return v.element() == e.toElement }))
				{
					return;
				}

				self.delegatePerform("mouseExited", dm.Window.viewWithElement(e.toElement));
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
		return this.cssWidth() + this.leftBorderThickness() + this.rightBorderThickness() + this.leftPaddingThickness() + this.rightPaddingThickness();
	},
	
	setWidth: function(w)
	{
		var lastWidth = this.width();
		this.setCssWidth(w - this.leftBorderThickness() - this.rightBorderThickness() - this.leftPaddingThickness() - this.rightPaddingThickness());
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
		
		return this;
	},
	
	height: function()
	{
		return this.cssHeight() + this.topBorderThickness() + this.bottomBorderThickness() + this.topPaddingThickness() + this.bottomPaddingThickness();
	},
	
	setHeight: function(h)
	{
		var lastHeight = this.height();
		this.setCssHeight(h - this.topBorderThickness() - this.bottomBorderThickness() - this.topPaddingThickness() - this.bottomPaddingThickness());
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
		if  (lastHeight != h)
		{
			if (this.superview() && this.superview().canPerform("heightChanged"))
			{
				this.superview().subviewHeightChanged(this);
			}
			this.delegatePerform("heightChanged");
		}
		return this;
	},
	
	size: function()
	{
		return dm.Point.withXY(this.width(), this.height());
	},
	
	setSize: function(size)
	{
		return this.performSets({
			width: size.x(),
			height: size.y()
		});
	},
	
	isLandscape: function()
	{
		return this.size().isLandscape();
	},
	
	aspectRatio: function()
	{
		return this.size().aspectRatio();
	},
	
	setHidden: function(hidden)
	{
		this._hidden = hidden;
		this.setDisplay(hidden ? "none" : "block");
	},
	
	hidden: function()
	{
		return this.display() == "none";
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
		this.insertSubviewAt(subview, this.subviews().length);
		return this;
	},
	
	insertSubviewAt: function(subview, index)
	{
		var oldSuperview = subview.superview();
		if (oldSuperview)
		{
			oldSuperview.removeSubview(subview);
		}
		subview.setSuperview(this);
		var existingView = this.subviews()[index];
		if (existingView)
		{
			this.subviews().atInsert(index, subview);
			this.element().insertBefore(subview.element(), existingView.element());
		}
		else
		{
			this.subviews().append(subview);
			this.element().appendChild(subview.element());
		}
		
		subview.conditionallyPerform("superviewChanged");
	},
	
	addToView: function(v)
	{
		v.addSubview(this);
		return this;
	},
	
	addSubviews: function()
	{
		var self = this;
		dm.Arguments_asArray(arguments).forEach(function(view){
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
	
	moveLeftOf: function(view, margin)
	{
		margin = margin || 0;
		this.setX(view.x() - margin - this.width());
		return this;
	},
	
	moveRightOf: function(view, margin)
	{
		margin = margin || 0;
		this.setX(view.rightEdge() + margin);
		return this;
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
		return this;
	},
	
	alignTopTo: function(view)
	{
		this.setY(view.y());
	},
	
	alignMiddleTo: function(view)
	{
		this.setY(view.y() + .5*view.height() - .5*this.height());
		return this;
	},
	
	alignBottomTo: function(view)
	{
		this.setY(view.bottomEdge() - this.height() - 1);
	},
	
	alignLeftTo: function(view)
	{
		this.setX(view.x());
	},
	
	alignRightTo: function(view)
	{
		this.setX(view.rightEdge() - this.width() - 1);
	},
	
	centerXOver: function(view)
	{
		this.setX(view.x() + (view.width() - this.width())/2);
		return this;
	},
	
	centerYOver: function(view)
	{
		return this.setY(view.y() + (view.height() - this.height())/2);
	},
	
	centerOver: function(view)
	{
		this.centerXOver(view);
		this.centerYOver(view);
		return this;
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
		
		return this;
	},
	
	centerVertically: function()
	{
		this.centerVerticallyInView(this.superview());
	},
	
	centerVerticallyInView: function(v)
	{
		if (v)
		{
			this.setY((v.height() - this.height())/2);
		}
	},
	
	moveToBottom: function(margin)
	{
		if (this.superview())
		{
			margin = margin || 0;

			this.setY(this.superview().height() - this.height() - margin);
		}
	},
	
	moveToRight: function(margin)
	{
		if (this.superview())
		{
			margin = margin || 0;

			this.setX(this.superview().width() - this.width() - margin);
		}
		return this;
	},
	
	moveLeft: function(x)
	{
		return this.setX(this.x() - x);
	},
	
	moveRight: function(x)
	{
		return this.setX(this.x() + x);
	},
	
	moveDown: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	moveUp: function(y)
	{
		return this.setY(this.y() - y);
	},
	
	growWidth: function(width)
	{
		return this.setWidth(this.width() + width);
	},
	
	growHeight: function(height)
	{
		return this.setHeight(this.height() + height);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
		if (!this.autoResizes() || !this.superview())
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
		if (!this.autoResizes() || !this.superview())
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
		this.resizeCenteredHorizontally();
		this.resizeCenteredVertically();
		return this;
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
		return this;
	},
	
	scaleToFitSuperview: function()
	{
		var superview = this.superview();
		if (superview)
		{
			this.scaleToFitSize(superview.size());
		}
	},
	
	scaleToFitSize: function(size)
	{
		this.setSize(this.size().scaleToFitPoint(size));
		return this;
	},
	
	scaleFrameBy: function(scaleFactor)
	{
		this.setX(this.x()*scaleFactor);
		this.setY(this.y()*scaleFactor);
		this.setWidth(this.width()*scaleFactor);
		this.setHeight(this.height()*scaleFactor);
	},
	
	sizingElement: function()
	{
		var e = this.element().cloneNode(true);
		var s = e.style;
		s.display = "block";
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
		this.setWidth(e.offsetWidth + (this.width() - this.cssWidth()));
		document.body.removeChild(e);
		return this;
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.offsetHeight + (this.height() - this.cssHeight()));
		document.body.removeChild(e);
		return this;
	},
	
	sizeToFit: function()
	{
		this.sizeWidthToFit();
		this.sizeHeightToFit();
		return this;
	},
	
	sizeWidthToFitSubviews: function()
	{
		return this.setWidth(this.subviews().mapPerform("rightEdge").max() + 1);
	},
	
	sizeHeightToFitSubviews: function()
	{
		return this.setHeight(this.subviews().mapPerform("bottomEdge").max() + 1);
	},
	
	sizeToFitSubviews: function()
	{
		this.sizeWidthToFitSubviews();
		this.sizeHeightToFitSubviews();
		
		return this;
	},
	
	stackSubviewsHorizontally: function(margin)
	{
		margin = margin || 0;
		var x = margin;
		this.subviews().forEach(function(sv){;
			sv.setX(x);
			x = sv.rightEdge() + margin;
		});
	},
	
	stackSubviewsVertically: function(margin)
	{
		margin = margin || 0;
		var y = margin;
		this.subviews().forEach(function(sv){;
			sv.setY(y);
			y = sv.bottomEdge() + margin;
		});
	},
	
	moveSubviewsIntoView: function()
	{
		var dx = Math.min(this.subviews().mapPerform("x").min(), 0).abs();
		var dy = Math.min(this.subviews().mapPerform("y").min(), 0).abs();
		
		this.subviews().forEach(function(sv){
			sv.setX(sv.x() + dx);
			sv.setY(sv.y() + dy);
		})
		
		return this;
	},
	
	moveToBack: function()
	{
		if (this.superview())
		{
			this.setZIndex(this.superview().subviews().mapPerform("zIndex").min() - 1);
		}
	},
	
	setZIndexToMax: function()
	{
		this.setZIndex(2147483647);
		return this;
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
				self.delegatePerform("fadedOut");
				clearInterval(interval);
				self.hide();
				self.element().style.opacity = initialOpacity;
			}
		}, 1000/60);
	},
	
	setDraggable: function(draggable)
	{
		var self = this;
		this._draggable = draggable;
		
		if (draggable)
		{
			this.element().style.setProperty("pointer-events", "all");
			this._dragMouseDownListner = function(e)
			{
				self.beginDrag(e);
			}
			this.addEventListener("mousedown", this._dragMouseDownListner);
		}
		else
		{
			this.element().style.removeProperty("pointer-events");
			this.removeEventListener("mousedown", this._draggableListener);
			this.endDrag();
		}
		
		return this;
	},
	
	beginDrag: function(e)
	{
		if (!dm.View._dragView)
		{
			e.preventDefault();
			e.stopPropagation();
			
			this._lastDragEvent = e;
			//console.log(this.elementId(), "beginDrag", e);

			dm.View._dragView = this;
			var self = this;
			this._dragMouseMoveListener = function(e)
			{
				self.moveDrag(e);
			}
			this._dragMouseUpListener = function(e)
			{
				self.endDrag(e);
			}
			dm.Window.addEventListener("mousemove", this._dragMouseMoveListener);
			dm.Window.addEventListener("mouseup", this._dragMouseUpListener);
		}
	},
	
	moveDrag: function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		
		if (this._lastDragEvent)
		{
			this.setX(this.x() + e.screenX - this._lastDragEvent.screenX);
			this.setY(this.y() + e.screenY - this._lastDragEvent.screenY);
			this._lastDragEvent = e;
		}
		
		//console.log(this.elementId(), "moveDrag", e);
	},
	
	endDrag: function(e)
	{
		e.preventDefault();
		e.stopPropagation();
		
		//console.log(this.elementId(), "endDrag", e);
		delete dm.View._dragView;
		if (this._lastDragEvent)
		{
			this.setX(this.x() + e.screenX - this._lastDragEvent.screenX);
			this.setY(this.y() + e.screenY - this._lastDragEvent.screenY);
			this._lastDragEvent = e;
		}
		delete this._lastDragEvent;
		dm.Window.removeEventListener("mousemove", this._dragMouseMoveListener);
		dm.Window.removeEventListener("mouseup", this._dragMouseUpListener);
	},
	
	draggable: function()
	{
		return this._draggable;
	}/*,
	
	setUserResizable: function(userResizable)
	{
		this._userResizable = userResizable;
		if (userResizable)
		{
			this._userResizingControls = [];
			var self = this;
			var d = 20;
			[[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function(directions){
				var xDirection = directions.first();
				var yDirection = directions.last();
				
				var control = dm.Button.clone().performSets({
					x: xDirection*(self.width()/2 - d),
					y: yDirection*(self.height()/2 - d),
					width: d,
					height: d,
					delegate: self,
					delegatePrefix: "cornerPoint",
					resizesLeft: 
				})
			});
		}
		else if (this._userResizingControls)
		{
			this._userResizingControls.forEachPerform("removeFromSuperview");
			delete this._userResizingControls;
		}
	}*/
});
