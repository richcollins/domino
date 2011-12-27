NodeWrapper = Proto.clone().newSlots({
	type: "NodeWrapper",
	node: null
}).setSlots({
	allAt: function(name)
	{
		var nodes = [];
		
		var node = this.node();
		for (var i = 0; i < node.childNodes.length; i ++)
		{
			var n = node.childNodes[i];
			if (n.nodeName == name)
			{
				nodes.push(NodeWrapper.clone().setNode(n));
			}
		}
		
		return nodes;
	},
	
	at: function(name)
	{
		return this.allAt(name).first();
	},
	
	atts: function()
	{
		var atts = {};
		
		var node = this.node();
		if (node.attributes)
		{
			for (var i = 0; i < node.attributes.length; i ++)
			{
				var a = node.attributes[i];
				atts[a.name] = a.value;
			}
		}
		
		return atts;
	},
	
	text: function()
	{
		return this.node().textContent;
	}
});