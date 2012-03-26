dm.HttpRequest = dm.Delegator.clone().newSlots({
	type: "dm.HttpRequest",
	method: "GET",
	body: null,
	url: null,
	xmlHttpRequest: null,
	response: null,
	headers: null
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		this.setXmlHttpRequest(new XMLHttpRequest());
		this.setHeaders({});
	},
	
	start: function()
	{
		var self = this;
		var xhr = this.xmlHttpRequest();
		xhr.open(this.method(), this.url(), true);
		dm.Object_eachSlot(this.headers(), function(k, v){
			xhr.setRequestHeader(k, v);
		});
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
	
	atPutHeader: function(name, value)
	{
		this.headers()[name] = value;
		return this;
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
