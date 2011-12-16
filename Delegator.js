Delegator = Proto.clone().newSlots({
	type: "Delegator",
	delegate: null,
	delegatePrefix: null,
	messagesDelegate: true
}).setSlots({
	delegatePerform: function(message)
	{
		if (this.messagesDelegate())
		{
			if (this.delegatePrefix())
			{
				message = this.delegatePrefix() + message.asCapitalized();
			}
			var args = Arguments_asArray(arguments).slice(1);
			args.unshift(this);

			var d = this.delegate();

			if (d && d.canPerform(message))
			{
				return d.performWithArgList(message, args);
			}
		}
	}
});
