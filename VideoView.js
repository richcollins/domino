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
		
		this.addEventListener("canplay", function(){
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
			self.setNativeWidth(e.videoWidth);
			self.setNativeHeight(e.videoHeight);
			self.setDuration(e.duration);
			self.delegatePerform("loadedMetaData");
		});
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
		this.element().src = this.url();
		this.setCanPlay(false);
		this.element().load();
	},
	
	play: function()
	{
		this.element().play();
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
	}
});