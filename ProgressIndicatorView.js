dm.ProgressIndicatorView = dm.View.clone().newSlots({
	type: "dm.ProgressIndicatorView",
	progress: 0,
	progressView: null
}).setSlots({
	init: function()
	{
		this.setBackgroundColor(dm.Color.withRGBA(0, 0, 0, 0.75));
		
		var progressView = dm.View.clone();
		this.setProgressView(progressView);
		progressView.performSets({
			width: 0,
			height: this.height(),
			resizesHeight: true,
			resizesRight: true,
			backgroundColor: dm.Color.withRGBA(1, 1, 1, 0.25)
		});
		this.addSubview(progressView);
	},
	
	setProgress: function(progress)
	{
		this._progress = progress;
		this.progressView().setWidth(this.width()*progress);
		
		return this;
	}
});