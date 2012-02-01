AsyncQueue = Delegator.clone().newSlots({
	workers: null,
	timeout: null
}).setSlots({
	init: function()
	{
		Delegator.init.call(this);
		this.setWorkers([]);
	},
	
	addWorker: function(worker)
	{
		worker.performSets({
			delegate: this,
			delegatePrefix: "asyncWorker",
		});
		this.workers().append(worker);
	},
	
	start: function()
	{
		if (this.timeout())
		{
			var self = this;
			this._timeoutId = setTimeout(function(){
				self.fail();
			}, this.timeout());
		}
		this.workers().forEachPerform("asyncQueueStart");
	},
	
	asyncWorkerCompleted: function(worker)
	{
		this.workers().remove(worker);
		if (this.workers().isEmpty())
		{
			this.delegatePerform("succeeded");
			this.complete();
		}
	},
	
	asyncWorkerFailed: function(worker)
	{
		this.fail();
	},
	
	fail: function()
	{
		this.delegatePerform("failed");
		this.complete();
	},
	
	complete: function()
	{
		clearTimeout(this._timeoutId);
		this.delegatePerform("completed");
		this.setMessagesDelegate(false);
	}
});