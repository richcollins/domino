dm.VideoView = dm.View.clone().newSlots({
	type: "dm.VideoView",
	url: null,
	nativeWidth: null,
	nativeHeight: null,
	duration: null,
	elementName: "video",
	inline: false,
	autoplay: false,
	canPlay: false
}).setSlots({
	/*
	createElement: function()
	{
		document.write('<video id="videoView" webkit-playsinline style="position:absolute;overflow:hidden"></video>');
		var e = document.getElementById("videoView");
		e.parentNode.removeChild(e);
		e.removeAttribute("id");
		this.setElement(e);
	},
	*/
	
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var self = this;
		var e = this.element();
		
		e.style.pointerEvents = "none";
		
		this.addEventListener("canplay", function(){;
			self.setCanPlay(true);
			self.delegatePerform("canPlay");
		});
		
		this.addEventListener("loadeddata", function(){
			self.delegatePerform("loadedData");
		});
		
		this.addEventListener("timeupdate", function(){
			self.delegatePerform("advanced");
		});
		
		this.addEventListener("pause", function(){
			self.delegatePerform("paused");
		});

		this.addEventListener("ended", function(){
			self.delegatePerform("ended");
		});
		
		this.addEventListener("loadedmetadata", function(){
			self.loadedMetaData();
		});
		
		this.addEventListener("error", function(e){
			self.delegatePerform("error");
		});
	},
	
	loadedMetaData: function()
	{
		var e = this.element();
		this.setNativeWidth(e.videoWidth);
		this.setNativeHeight(e.videoHeight);
		this.setDuration(e.duration);
		this.delegatePerform("loadedMetaData");
	},
	
	setUrl: function(url)
	{
		this._url = url;
		return this;
	},
	
	currentTime: function()
	{
		return this.element().currentTime;
	},
	
	setCurrentTime: function(currentTime)
	{
		return this.element().currentTime = currentTime;
	},
	
	setInline: function(inline)
	{
		this._inline = inline;
		if (inline)
		{
			this.element().setAttribute("webkit-playsinline", "");
		}
		else
		{
			this.element().removeAttribute("webkit-playsinline")
		}
		
		return this;
	},
	
	setAutoplay: function(autoplay)
	{
		this._autoplay = autoplay;
		if (autoplay)
		{
			this.element().setAttribute("autoplay", "");
		}
		else
		{
			this.element().removeAttribute("autoplay");
		}
	},
	
	load: function()
	{
		if (!this._didLoad)
		{
			this._didLoad = true;
			this.element().src = this.url();
			this.setCanPlay(false);
			this.element().load();
		}
	},
	
	play: function()
	{
		this.element().play();
	},
	
	isPaused: function()
	{
		return this.element().paused;
	},
	
	pause: function()
	{
		this.element().pause();
	},
	
	mute: function()
	{
		this.element().muted = true;
	},
	
	scaling: function()
	{
		return this.width() / this.nativeWidth();
	}/*,
	
	x: function() {
	  return this._x || 0;
	},
	
	setX: function(x) {
	  this._x = x;
	  this.applyTransform();
	  return this;
	},
	
	y: function() {
	  return this._y || 0;
	},
	
	setY: function(y) {
	  this._y = y;
	  this.applyTransform();
	  return this;
	},
	
	setX: function(x) {
	  this._x = x;
	  this.applyTransform();
	  return this;
	},
	
	width: function() {
	  return this._width || 0;
	},
	
	setWidth: function(width) {
	  this._width = width;
	  this.applyTransform();
	  return this;
	},
	
	height: function() {
	  return this._height || 0;
	},
	
	setHeight: function(height) {
	  this._height = height;
	  this.applyTransform();
	  return this;
	},
	
	applyTransform: function() {
	  var e = this.element();
	  console.log(this.width(), this.nativeWidth());
	  var scale = this.width()/this.nativeWidth();
	  var transform = "translate(" + this.x() + "px," + this.y() + "px) scale(" + scale + "," + scale + ")";
	  console.log(transform);
	  e.style.setProperty("-webkit-transform", transform);
		e.style.setProperty("-webkit-transform-origin", "0px 0px");
		e.style.left = "0px";
		e.style.top = "0px";
		e.style.width = this.nativeWidth() + "px";
		e.style.height = this.nativeHeight() + "px";
	}*/
});