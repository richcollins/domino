HttpRequest = Delegator.clone().newSlots({
	type: "HttpRequest",
	method: "GET",
	body: null,
	url: null,
	xmlHttpRequest: null,
	response: null
}).setSlots({
	init: function()
	{
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
				var response = HttpResponse.clone();
				response.setBody(xhr.responseText);
				response.setStatusCode(xhr.status);
				self.setResponse(response);
				
				self.delegatePerform("httpRequestCompleted");
			}
		}
		xhr.send(this.body());
	}
});
