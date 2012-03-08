dm = {};

dm.Object_clone = function(obj)
{
	dm.Proto_constructor.prototype = obj;
	return new dm.Proto_constructor;
}

dm.Object_shallowCopy = function(obj)
{
	var newObj = {};
	for (var name in obj)
	{
		if (obj.hasOwnProperty(name))
		{
			newObj[name] = obj[name];
		}
	}
	
	return newObj;
}

dm.Object_eachSlot = function(obj, fn)
{
	for (var name in obj)
	{
		if (obj.hasOwnProperty(name))
		{
			fn(name, obj[name]);
		}
	}
}

dm.Object_withLowerCaseKeys = function(obj)
{
	var lowered = {};
	
	dm.Object_eachSlot(obj, function(k, v){
		lowered[k.toLowerCase()] = v;
	})
	
	return lowered;
}

dm.Arguments_asArray = function(args)
{
	return Array.prototype.slice.call(args);
}

dm.Object_lookupPath = function(obj, path)
{
	path = path.split(".");
	var pc;
	while (obj && (pc = path.shift()))
	{
		obj = obj[pc];
	}
	return obj;
}

if (!Array.prototype.forEach)
{
	Array.prototype.forEach = function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this)
				fun.call(thisp, this[i], i, this);
		}
	};
}

String.prototype.asCapitalized = function()
{
	return this.replace(/\b[a-z]/g, function(match){
		return match.toUpperCase();
	});
};

dm.Proto = new Object;

dm.Proto.setSlot = function(name, value)
{
	this[name] = value;

	return this;
};

dm.Proto.uniqueIdCounter = 0;

dm.Proto.setSlots = function(slots)
{
	for(name in slots)
	{
		if(slots.hasOwnProperty(name))
		{
			var v = slots[name];
			if(typeof(v) == "function") 
			{ 
				var info = { protoName: this._type, methodName: name};
				v.functionInfo = info; 
				v.name = this._type + "." + name; 
			}
			this.setSlot(name, v);
		}
	}
	if(slots.hasOwnProperty("toString"))
		this.toString = slots.toString;
	return this;
};

dm.Proto_constructor = new Function;

dm.Proto.setSlots(
{
	constructor: new Function,

	clone: function()
	{
		dm.Proto_constructor.prototype = this;
	
		var obj = new dm.Proto_constructor;
		obj._proto = this;
		obj._uniqueId = ++ dm.Proto.uniqueIdCounter;
		obj._applySuperMap = {};
		if(obj.init)
			obj.init();
		return obj;
	},
	
	_applySuperMap: {},
	
	applySuper: function(messageName, args)
	{
		var applySuperMap = this._applySuperMap;
		lookupProto = applySuperMap[messageName] || this;
		
		if (!lookupProto._proto)
		{
			return undefined;
		}
		
		var proto = lookupProto._proto;
		
		var myFn = lookupProto[messageName];
		while(proto && (myFn == proto[messageName]))
		{
			proto = proto._proto;
		}
		
		var fn = proto[messageName];
		if (proto && fn && typeof(fn) == "function")
		{
			applySuperMap[messageName] = proto;
			try
			{
				return proto[messageName].apply(this, args); 
			}
			catch (e)
			{
				throw e;
			}
			finally
			{
				delete applySuperMap[messageName];
			}
		}
	},

	uniqueId: function()
	{
		return this._uniqueId;
	},

	proto: function()
	{
		return this._proto;
	},

	removeSlots: function()
	{
		this.argsAsArray(arguments).forEach(function(slotName)
		{
			delete this["_" + name];
			delete this[name];
			delete this["set" + name.asCapitalized()];
		});
	
		return this;
	},

	setSlotsIfAbsent: function(slots)
	{
		for(name in slots)
		{
			if(!this[name] && slots.hasOwnProperty(name))
				this.setSlot(name, slots[name]);
		}
		if(slots.hasOwnProperty("toString"))
			this.toString = slots.toString;
		return this;
	},

	printSlotCalls: function()
	{
		var calls = [];
		for(var name in SlotCalls)
		{
		  var o = {};
		  o.name = name;
		  o.count = SlotCalls[name];
		  calls.push(o);
		}
		calls.sort(function(x, y){ return x.count - y.count });
		for(var i = 0; i < calls.length; i ++)
		{
		  Logger.log(calls[i].name + ":" + calls[i].count);
		}
	},

	newSlot: function(name, initialValue)
	{
		if(typeof(name) != "string") throw "name must be a string";

		if(initialValue === undefined) { initialValue = null };
	
		this["_" + name] = initialValue;
		this[name] = function()
		{
			return this["_" + name];
		}
	
		this["set" + name.asCapitalized()] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
		}
		return this;
	},
	
	newLazySlot: function(name, initialValue)
	{
		this[name] = function()
		{
			if (this["_" + name] === undefined)
			{
				this["_" + name] = initialValue;
			}
			
			return this["_" + name];
		}
		
		this["set" + name.asCapitalized()] = function(newValue)
		{
			this["_" + name] = newValue;
			return this;
		}
		return this;
	},
	
	newLazySlots: function()
	{
		var args = this.argsAsArray(arguments);

		var slotsMap = {};
	
		if(args.length > 1 || typeof(args[0]) == "string")
		{
			args.forEach(function(slotName)
			{
				slotsMap[slotName] = null;
			})
		}
		else
		{
			slotsMap = args[0];
		}
	
		for(var slotName in slotsMap)
		{
			this.newLazySlot(slotName, slotsMap[slotName]);
		}
		return this;
	},

	aliasSlot: function(slotName, aliasName)
	{
		this[aliasName] = this[slotName];
		this["set" + aliasName.asCapitalized()] = this["set" + slotName.asCapitalized()];
		return this;
	},

	argsAsArray: function(args)
	{
		return Array.prototype.slice.call(args);
	},

	newSlots: function()
	{
		var args = this.argsAsArray(arguments);

		var slotsMap = {};
	
		if(args.length > 1 || typeof(args[0]) == "string")
		{
			args.forEach(function(slotName)
			{
				slotsMap[slotName] = null;
			})
		}
		else
		{
			slotsMap = args[0];
		}
	
		for(var slotName in slotsMap)
		{
			this.newSlot(slotName, slotsMap[slotName]);
		}
		return this;
	},

	newNumberSlot: function(name, initialValue)
	{
		this.newSlot(name, initialValue || 0);
		this["inc" + name.asCapitalized() + "By"] = function(amount)
		{
			this["_" + name] += amount;
		}
		this["inc" + name.asCapitalized()] = function()
		{
			this["_" + name] ++;
		}
		this["dec" + name.asCapitalized() + "By"] = function(amount)
		{
			this["_" + name] -= amount;
		}
		this["dec" + name.asCapitalized()] = function()
		{
			this["_" + name] --;
		}
		return this;
	},

	newNumberSlots: function()
	{
		this.argsAsArray(arguments).forEach(function(slotName)
		{
			this.newNumberSlot(slotName);
		}, this);
		return this;
	},

	forEachSlot: function(callback)
	{
		for(var slotName in this)
		{
			if(this.hasOwnProperty(slotName))
			{
				callback(this[slotName], slotName);
			}
		}
		return this;
	},
	
	canPerform: function(message)
	{
		return this[message] && typeof(this[message]) == "function";
	},

	performWithArgList: function(message, argList)
	{
		return this[message].apply(this, argList);
	},

	perform: function(message)
	{
		return this[message].apply(this, this.argsAsArray(arguments).slice(1));
	},

	conditionallyPerform: function(message)
	{
		if (this[message] && this[message].call)
		{
			return this.perform.apply(this, arguments);
		}
		else
		{
			return null;
		}
	},
	
	performSets: function(slots)
	{
		for (var name in slots)
		{
			if (slots.hasOwnProperty(name))
			{
				this.conditionallyPerform("set" + name.asCapitalized(), slots[name]);
			}
		}
		
		return this;
	},
	
	slotsObject: function()
	{
		var o = {};
		for (var name in this)
		{
			if (name.beginsWith("_"))
			{
				o[name.after("_")] = this[name];
			}
		}
		
		delete o.proto;
		delete o.sender;
		delete o.type;
		delete o.uniqueId;
		
		return o;
	}
});

dm.Proto.newSlot("type", "dm.Proto");
dm.Proto.newSlot("sender", null);
dm.Proto.removeSlot = dm.Proto.removeSlots;