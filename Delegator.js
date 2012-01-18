Delegator = Proto.clone().newSlots({
	type: "Delegator",
	delegate: null,
	delegatePrefix: null,
	messagesDelegate: true
}).setSlots({
	init: function()
	{
		this.setDelegatePrefix(this.type().asUncapitalized());
	},
	
	delegateWith: function(slots)
	{
		return this.setDelegate(Proto.clone().setSlots(slots));
	},
	
	delegateMessageName: function(messageName)
	{
		var prefix = this.delegatePrefix();
		if (prefix && !messageName.beginsWith(prefix))
		{
			return this.delegatePrefix() + messageName.asCapitalized();
		}
		else
		{
			return messageName;
		}
	},
	
	delegatePerform: function(messageName)
	{
		if (this.messagesDelegate())
		{
			var args = Arguments_asArray(arguments).slice(1);
			args.unshift(this);

			var d = this.delegate();

			messageName = this.delegateMessageName(messageName)

			if (d && d.canPerform(messageName))
			{
				return d.performWithArgList(messageName, args);
			}
		}
	}
});
