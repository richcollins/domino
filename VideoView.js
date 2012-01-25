VideoView = View.clone().newSlots({
	type: "VideoView",
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
		View.initElement.call(this);
		
		var self = this;
		var e = this.element();
		
		this.addEventListener("canplay", function(){
			self.setCanPlay(true);
			self.delegatePerform("canPlay");
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
		this.element().src = url
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
		//this.setInline(this.inline());
		this.element().load();
	},
	
	play: function()
	{
		//this.setInline(this.inline()); //hack - o.w. it doesn't always play inline on mobile :-/
		this.element().play();
	},
	
	pause: function()
	{
		this.element().pause();
	},
	
	mute: function()
	{
		this.element().muted = true;
	}
});