dm.HttpRequest = dm.Delegator.clone().newSlots({
	type: "dm.HttpRequest",
	method: "GET",
	body: null,
	url: null,
	xmlHttpRequest: null,
	response: null
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		this.setXmlHttpRequest(new XMLHttpRequest());
	},
	
	start: function()
	{
		var self = this;
		var xhr = this.xmlHttpRequest();
		xhr.open(this.method(), this.url(), true);
		xhr.onreadystatechange = function()
		{
			if (xhr.readyState == 4)
			{
				var response = dm.HttpResponse.clone();
				response.setBody(xhr.responseText);
				response.setStatusCode(xhr.status);
				self.setResponse(response);
				
				self.delegatePerform("completed");
			}
		}
		xhr.send(this.body());
	},
	
	retry: function()
	{
		this.setResponse(null);
		this.xmlHttpRequest().onreadystatechange = null;
		this.setXmlHttpRequest(new XMLHttpRequest());
		this.start();
	},
	
	cancel: function()
	{
		this.setDelegate(null);
		this.xmlHttpRequest().onreadystatechange = null;
	}
});
