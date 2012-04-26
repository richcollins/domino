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
			{
				this[name] = slots[name];
			}
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
dm.Browser = dm.Proto.clone().setSlots(
{
	userAgent: function()
	{
		if(typeof window != "undefined" && typeof window.navigator != "undefined")
		{
			return window.navigator.userAgent;
		}
		else
		{
			return "";
		}
	},

	isInternetExplorer: function()
	{
		return navigator.appName.indexOf("Internet Explorer") > -1;
	},

	isIE8: function()
	{
		return this.userAgent().indexOf("MSIE 8.0") != -1;
	},

	isIE6: function()
	{
		return this.isInternetExplorer() && !window.XMLHttpRequest;
	},

	isGecko: function()
	{
		return this.userAgent().indexOf("Gecko") != -1;
	},

	isSafari: function()
	{
		return this.userAgent().indexOf("Safari") != -1;
	},

	version: function()
	{
		if(this.isGecko())
		{
			var index = this.userAgent().indexOf("Firefox");
			return (index == -1) ? 2.0 : parseFloat(this.userAgent().substring(index + "Firefox".length + 1));
		}
		else
		{
			return null;
		}
	},

	locationAsUri: function()
	{
		return Uri.withString(window.location.href);
	}
});

Array.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
Array.prototype.argsAsArray = dm.Proto.argsAsArray;
Array.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
String.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
Number.prototype.setSlotsIfAbsent = dm.Proto.setSlotsIfAbsent;
/*
(function(){
	for(var slotName in dm.Proto)
	{
		[Array, String, Number, Date].forEach(function(contructorFunction)
		{
			if(contructorFunction == Array && slotName == "clone" && dm.Browser.isInternetExplorer())
			{
				contructorFunction.prototype[slotName] = function(){ throw new Error("You can't clone an Array proto in IE yet.") };
			}
			else
			{
				contructorFunction.prototype[slotName] = dm.Proto[slotName];
			}
			contructorFunction.clone = function()
			{
				return new contructorFunction;
			}
		});
	}
})();
*/
dm.Importer = dm.Proto.clone().setType("dm.Importer").newSlots({
	basePath: null,
	addsTimestamp: false
}).setSlots(
{
	importPaths: function(paths)
	{
		for (var i = 0; i < paths.length; i ++)
		{
			if (this.basePath())
			{
				var path = this.basePath() + "/" + paths[i];
			}
			else
			{
				var path = paths[i];
			}
			
			path = path + ".js";
			
			var script = '<script type="text/javascript" src="' + path + (this.addsTimestamp() ? ("?" + new Date().getTime()) : "") + '"><\/script>';
			document.write(script);
		}
		return this;
	},
	
	extendBasePath: function(pathComponent)
	{
		this.setBasePath(this.basePath() + "/" + pathComponent);
		return this;
	},
	
	useSiblingPath: function(pathComponent)
	{
		this.setBasePath(this.basePath().siblingPath(pathComponent));
		return this;
	}
});

Array.prototype.setSlotsIfAbsent(
{
	init: function()
	{
		var args = [0, this.length];
		args.concatInPlace(this.slice());
		this.splice.apply(this, args);
	},

	empty: function()
	{
		this.splice(0, this.length);
		return this;
	},

	isEmpty: function()
	{
		return this.length == 0;
	},

	concatInPlace: function(anArray)
	{
		this.push.apply(this, anArray);
	},

	at: function(index)
	{
		if(index > 0)
		{
			return this[index];
		}
		else
		{
			return this[this.length + index];
		}
	},

	removeElements: function(elements)
	{
		elements.forEach(function(e){ this.remove(e) }, this);
		return this;
	},

	append: function(e)
	{
		this.push(e);
		return this;
	},

	appendAll: function(anArray)
	{
		var self = this;
		anArray.forEach(function(v) { self.push(v); });
		return this;
	},

	prepend: function(e)
	{
		this.unshift(e);
		return this;
	},

	remove: function(e)
	{
		var i = this.indexOf(e);
		if(i > -1)
		{
			this.removeAt(i);
		}
		return this;
	},

	removeAt: function(i)
	{
		this.splice(i, 1);
		return this;
	},
	
	insertAt: function(i, obj)
	{
		this.splice(i, 0, obj);
		return this;
	},
	
	replace: function(obj, withObj)
	{
		var i = this.indexOf(obj);
		if (i > -1)
		{
			this.removeAt(i);
			this.insertAt(i, withObj);
		}
		return this;
	},
	
	replaceElements: function(array)
	{
		this.empty().splice.apply(this, array.copy().prepend(0).prepend(array.length));
		return this;
	},

	copy: function()
	{
		return this.slice();
	},

	first: function()
	{
		return this[0];
	},

	rest: function()
	{
		var a = this.copy();
		a.removeFirst();
		return a;
	},

	last: function(count)
	{
		return this[this.length - 1];
	},

	appendIfAbsent: function()
	{
		var self = this;
		this.argsAsArray(arguments).forEach(function(value)
		{
			if(self.indexOf(value) == -1)
			{
				self.push(value);
			}
		})

		return this;
	},

	split: function(subArrayCount)
	{
		var subArrays = [];

		var subArraySize = Math.ceil(this.length / subArrayCount);
		for(var i = 0; i < this.length; i += subArraySize)
		{
			var subArray = this.slice(i, i + subArraySize);
			if(subArray.length < subArraySize)
			{
				var lastSubArray = subArrays.pop();
				if(lastSubArray)
				{
					subArray = lastSubArray.concat(subArray);
				}
			}
			subArrays.push(subArray);
		}

		return subArrays;
	},

	map: function(fun /*, thisp*/)
	{
		var len = this.length;
		if(typeof fun != "function")
			throw new TypeError();

		var res = new Array(len);
		var thisp = arguments[1];
		for(var i = 0; i < len; i++)
		{
			if (i in this)
				res[i] = fun.call(thisp, this[i], i, this);
		}

		return res;
	},

	shuffle: function()
	{
		var i = this.length;
		if(i == 0) return false;
		while (-- i)
		{
			var j = Math.floor(Math.random() * ( i + 1 ));
			var tempi = this[i];
			var tempj = this[j];
			this[i] = tempj;
			this[j] = tempi;
		}
	},

	forEachCall: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		this.forEach(function(e, i)
		{
			args[args.length - 1] = i;
			e[functionName].apply(e, args);
		});
		return this;
	},

	forEachPerform: function()
	{
		return this.forEachCall.apply(this, arguments);
	},

	sortPerform: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		return this.sort(function(x, y)
		{
			var xRes = x[functionName].apply(x, args);
			var yRes = y[functionName].apply(y, args);
			if(xRes < yRes)
			{
				return -1;
			}
			else if(yRes < xRes)
			{
				return 1;
			}
			else
			{
				return 0;
			}
		});
	},

	mapPerform: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.map(function(e, i)
		{
			args[args.length - 1] = i;
			return e[messageName].apply(e, args);
		});
	},

	detectPerform: function(functionName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		return this.detect(function(e, i)
		{
			return e[functionName].apply(e, args);
		});
	},

	reduce: function(fun /*, initial*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1)
			throw new TypeError();

		var i = 0;
		if (arguments.length >= 2)
		{
			var rv = arguments[1];
		}
		else
		{
			do
			{
				if (i in this)
				{
					rv = this[i++];
					break;
				}

				// if array contains no values, no initial value to return
				if (++i >= len)
					throw new TypeError();
				}
			while (true);
		}

		for (; i < len; i++)
		{
			if (i in this)
				rv = fun.call(null, rv, this[i], i, this);
		}

		return rv;
	},

	filter: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var res = new Array();
		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
	    {
			if (i in this)
			{
				var val = this[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, this))
					res.push(val);
			}
		}

		return res;
	},

	filterPerform: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.filter(function(e, i)
		{
			args[args.length - 1] = i;
			return e[messageName].apply(e, args);
		});
	},
	
	rejectPerform: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.filter(function(e, i)
		{
			args[args.length - 1] = i;
			return !e[messageName].apply(e, args);
		});
	},

	detect: function(callback)
	{
		for(var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return this[i];
			}
		}

		return null;
	},
	
	detectSlot: function(slotName, slotValue)
	{
		for(var i = 0; i < this.length; i++)
		{
			if (this[i].conditionallyPerform(slotName) == slotValue)
			{
				return this[i];
			}
		}

		return null;
	},
	
	detectProperty: function(slotName, slotValue)
	{
		for(var i = 0; i < this.length; i++)
		{
			if (this[i][slotName] == slotValue)
			{
				return this[i];
			}
		}

		return null;
	},

	detectIndex: function(callback)
	{
		for(var i = 0; i < this.length; i++)
		{
			if(callback(this[i]))
			{
				return i;
			}
		}

		return null;
	},

	max: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	maxIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v > m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	min: function(callback)
	{
		var m = undefined;
		var mObject = undefined;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				mObject = this[i];
			}
		}

		return mObject;
	},

	minIndex: function(callback)
	{
		var m = undefined;
		var index = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			if(m == undefined || v < m)
			{
				m = v;
				index = i;
			}
		}

		return index;
	},

	sum: function(callback)
	{
		var m = undefined;
		var sum = 0;
		var length = this.length;

		for(var i = 0; i < length; i++)
		{
			var v = this[i];
			if(callback) v = callback(v);

			sum = sum + v;
		}

		return sum;
	},

	some: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this && fun.call(thisp, this[i], i, this))
				return true;
		}

		return false;
	},

	every: function(fun /*, thisp*/)
	{
		var len = this.length;
		if (typeof fun != "function")
			throw new TypeError();

		var thisp = arguments[1];
		for (var i = 0; i < len; i++)
		{
			if (i in this && !fun.call(thisp, this[i], i, this))
				return false;
		}

		return true;
	},

	allRespondTrue: function(message)
	{
		return this.every(function(e){ return e.perform(message) });
	},

	firstRespondingTrue: function(message)
	{
		return this.detect(function(e){ return e.perform(message) });
	},

	indexOf: function(elt /*, from*/)
	{
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			? Math.ceil(from)
			: Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++)
		{
			if (from in this &&
				this[from] === elt)
			return from;
		}
		return -1;
	},

	contains: function(element)
	{
		return this.indexOf(element) > -1;
	},

	removeFirst: function ()
	{
		return this.shift();
	},

	removeLast: function()
	{
		return this.pop();
	},

	hasPrefix: function(otherArray)
	{
		if(this.length < otherArray.length) { return false; }

		for(var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	toString: function()
	{
		var s = "[";

		for(var i = 0; i < this.length; i ++)
		{
			var value = this[i];

			if (i != 0) s = s + ","

			if(typeof(value) == "string")
			{
				s = s + "\"" + value + "\"";
			}
			else
			{
				s = s + value;
			}
		}

		return s + "]";
	},

	isEqual: function(otherArray)
	{
		if(this.length != otherArray.length) { return false; }

		for(var i = 0; i < this.length; i ++)
		{
			if(this[i] != otherArray[i]) return false;
		}

		return true;
	},

	atInsert: function(i, e)
	{
		this.splice(i, 0, e);
	},

	size: function()
	{
		return this.length;
	},

	itemAfter: function(v)
	{
		var i = this.indexOf(v);
		if(i == -1) return null;
		i = i + 1;
		if(i > this.length - 1) return null;
		if(this[i] != undefined) { return this[i]; }
		return null;
	},

	itemBefore: function(v)
	{
		var i = this.indexOf(v);
		if(i == -1) return null;
		i = i - 1;
		if(i < 0) return null;
		if(this[i]) { return this[i]; }
		return null;
	}
});

Number.prototype.setSlotsIfAbsent(
{
	cssString: function() 
	{
		return this.toString();
	},

	milliseconds: function()
	{
		return this;
	},
	
	seconds: function()
	{
		return Number(this) * 1000;
	},
	
	minutes: function()
	{
		return this.seconds() * 60;
	},
	
	hours: function()
	{
		return this.minutes() * 60;
	},
	
	days: function()
	{
		return this.hours() * 24;
	},
	
	years: function()
	{
		return this.days() * 365;
	},

	repeat: function(callback)
	{
		for(var i = 0; i < this; i++)
		{
			callback(i);
		}
		return this;
	},

	map: function()
	{
		var a = [];
		for(var i = 0; i < this; i ++)
		{
			a.push(i);
		}
		return Array.prototype.map.apply(a, arguments);
	},

	isEven: function()
	{
		return this % 2 == 0;
	}
});

String.prototype.setSlotsIfAbsent(
{
	cssString: function() 
	{ 
		return this;
	},

	replaceSeq: function(a, b)
	{
		var s = this;
		var newString;

		if(b.contains(a)) throw "substring contains replace string";

		while(true)
		{
			var newString = s.replace(a, b)
			if(newString == s) return newString;;
			s = newString;
		}

		return this;
	},

	repeated: function(times)
	{
		var result = "";
		var aString = this;
		times.repeat(function(){ result += aString });
		return result
	},

	isEmpty: function()
	{
		return this.length == 0;
	},

	beginsWith: function(prefix)
	{
		if(!prefix) return false;
		return this.indexOf(prefix) == 0;
	},

	removePrefix: function(prefix)
	{
		return this.substring(this.beginsWith(prefix) ? prefix.length : 0);
	},

	endsWith: function(suffix)
	{
		var index = this.lastIndexOf(suffix);
		return (index > -1) && (this.lastIndexOf(suffix) == this.length - suffix.length);
	},

	removeSuffix: function(suffix)
	{
		if(this.endsWith(suffix))
		{
			return this.substr(0, this.length - suffix.length);
		}
		else
		{
			return this;
		}
	},

	trim: function()
	{
		return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},

	hostName: function()
	{
		var result = this.removePrefix("http://");
		return result.slice(0, result.indexOf("/"));
	},

	contains: function(aString)
	{
		return this.indexOf(aString) > -1;
	},

	before: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1)
		{
			return null;
		}
		else
		{
			return this.slice(0, index);
		}
	},

	after: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1)
		{
			return null;
		}
		else
		{
			return this.slice(index + aString.length);
		}
	},
	
	between: function(prefix, suffix)
	{
		var after = this.after(prefix);
		if (after != null)
		{
			var before = after.before(suffix);
			if (before != null)
			{
				return before;
			}
			else
			{
				return null;
			}
		}
		else
		{
			return null;
		}
	},

	asUncapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match) {
			return match.toLowerCase();
		});
	},

	asCapitalized: function()
	{
		return this.replace(/\b[A-Z]/g, function(match) {
			return match.toUpperCase();
		});
	},

	containsCapitals: function()
	{
		return this.search(/[A-Z]/g) > -1;
	},

	charAt: function(i)
	{
		return this.slice(i, i + 1);
	},

	first: function()
	{
		return this.slice(0, 1);
	},

	asNumber: function()
	{
		return Number(this);
	},

	stringCount: function(str)
	{
		return this.split(str).length - 1;
	},

	lineCount: function()
	{
		return this.stringCount("\n");
	},

	pathComponents: function()
	{
		return this.split("/");
	},

	sansLastPathComponent: function()
	{
		var c = this.pathComponents()
		c.removeLast();
		return c.join("/");
	},
	
	siblingPath: function(pathComponent)
	{
		return this.sansLastPathComponent() + "/" + pathComponent;
	},

	lastPathComponent: function()
	{
		return this.pathComponents().last();
	},

	strip: function() {
    	return this.replace(/^\s+/, '').replace(/\s+$/, '');
  	},

	fileNameSuffix: function()
	{
		var suffix = this.split(".").last();
		return suffix;
	},
	
	humanized: function() //someMethodName -> Some Method Name
	{
		var words = [];
		var start = -1;
		var capitalized = this.asCapitalized();
		for (var i = 0; i < capitalized.length; i ++)
		{
			if (capitalized.slice(i, i + 1).match(/[A-Z]/))
			{
				var word = capitalized.slice(start, i);
				if (word)
				{
					words.append(word);
				}
				start = i;
			}
		}
		words.append(capitalized.slice(start, i));
		return words.join(" ");
	},
	
	titleized: function()
	{
		return this.split(/\s+/).map("asCapitalized").join(" ");
	},
	
	base64Encoded: function()
	{
		return btoa(this);
	},
	
	base64UrlEncoded: function()
	{
		return this.base64Encoded().replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ',');
	},
	
	base64Decoded: function()
	{
		return atob(this);
	},
	
	base64UrlDecoded: function()
	{
		return this.replace(/-/g, '+').replace(/_/g, '/').replace(/,/g, '=').base64Decoded();
	}
});

String.prototype.asMD5Hex = function()
{
	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for more info.
	 */

	/*
	 * Configurable variables. You may need to tweak these to be compatible with
	 * the server-side, but the defaults work in most cases.
	 */
	var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = "";  /* base-64 pad character. "=" for strict RFC compliance   */

	/*
	 * These are the functions you'll usually want to call
	 * They take string arguments and return either hex or base-64 encoded strings
	 */
	function hex_md5(s)    { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
	function b64_md5(s)    { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
	function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
	function hex_hmac_md5(k, d)
	  { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function b64_hmac_md5(k, d)
	  { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
	function any_hmac_md5(k, d, e)
	  { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

	/*
	 * Perform a simple self-test to see if the VM is working
	 */
	function md5_vm_test()
	{
	  return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
	}

	/*
	 * Calculate the MD5 of a raw string
	 */
	function rstr_md5(s)
	{
	  return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
	}

	/*
	 * Calculate the HMAC-MD5, of a key and some data (raw strings)
	 */
	function rstr_hmac_md5(key, data)
	{
	  var bkey = rstr2binl(key);
	  if(bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

	  var ipad = Array(16), opad = Array(16);
	  for(var i = 0; i < 16; i++)
	  {
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }

	  var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
	  return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
	}

	/*
	 * Convert a raw string to a hex string
	 */
	function rstr2hex(input)
	{
	  try { hexcase } catch(e) { hexcase=0; }
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var output = "";
	  var x;
	  for(var i = 0; i < input.length; i++)
	  {
	    x = input.charCodeAt(i);
	    output += hex_tab.charAt((x >>> 4) & 0x0F)
	           +  hex_tab.charAt( x        & 0x0F);
	  }
	  return output;
	}

	/*
	 * Convert a raw string to a base-64 string
	 */
	function rstr2b64(input)
	{
	  try { b64pad } catch(e) { b64pad=''; }
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var output = "";
	  var len = input.length;
	  for(var i = 0; i < len; i += 3)
	  {
	    var triplet = (input.charCodeAt(i) << 16)
	                | (i + 1 < len ? input.charCodeAt(i+1) << 8 : 0)
	                | (i + 2 < len ? input.charCodeAt(i+2)      : 0);
	    for(var j = 0; j < 4; j++)
	    {
	      if(i * 8 + j * 6 > input.length * 8) output += b64pad;
	      else output += tab.charAt((triplet >>> 6*(3-j)) & 0x3F);
	    }
	  }
	  return output;
	}

	/*
	 * Convert a raw string to an arbitrary string encoding
	 */
	function rstr2any(input, encoding)
	{
	  var divisor = encoding.length;
	  var i, j, q, x, quotient;

	  /* Convert to an array of 16-bit big-endian values, forming the dividend */
	  var dividend = Array(Math.ceil(input.length / 2));
	  for(i = 0; i < dividend.length; i++)
	  {
	    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
	  }

	  /*
	   * Repeatedly perform a long division. The binary array forms the dividend,
	   * the length of the encoding is the divisor. Once computed, the quotient
	   * forms the dividend for the next step. All remainders are stored for later
	   * use.
	   */
	  var full_length = Math.ceil(input.length * 8 /
	                                    (Math.log(encoding.length) / Math.log(2)));
	  var remainders = Array(full_length);
	  for(j = 0; j < full_length; j++)
	  {
	    quotient = Array();
	    x = 0;
	    for(i = 0; i < dividend.length; i++)
	    {
	      x = (x << 16) + dividend[i];
	      q = Math.floor(x / divisor);
	      x -= q * divisor;
	      if(quotient.length > 0 || q > 0)
	        quotient[quotient.length] = q;
	    }
	    remainders[j] = x;
	    dividend = quotient;
	  }

	  /* Convert the remainders to the output string */
	  var output = "";
	  for(i = remainders.length - 1; i >= 0; i--)
	    output += encoding.charAt(remainders[i]);

	  return output;
	}

	/*
	 * Encode a string as utf-8.
	 * For efficiency, this assumes the input is valid utf-16.
	 */
	function str2rstr_utf8(input)
	{
	  var output = "";
	  var i = -1;
	  var x, y;

	  while(++i < input.length)
	  {
	    /* Decode utf-16 surrogate pairs */
	    x = input.charCodeAt(i);
	    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
	    if(0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF)
	    {
	      x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
	      i++;
	    }

	    /* Encode output as utf-8 */
	    if(x <= 0x7F)
	      output += String.fromCharCode(x);
	    else if(x <= 0x7FF)
	      output += String.fromCharCode(0xC0 | ((x >>> 6 ) & 0x1F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0xFFFF)
	      output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	    else if(x <= 0x1FFFFF)
	      output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
	                                    0x80 | ((x >>> 12) & 0x3F),
	                                    0x80 | ((x >>> 6 ) & 0x3F),
	                                    0x80 | ( x         & 0x3F));
	  }
	  return output;
	}

	/*
	 * Encode a string as utf-16
	 */
	function str2rstr_utf16le(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode( input.charCodeAt(i)        & 0xFF,
	                                  (input.charCodeAt(i) >>> 8) & 0xFF);
	  return output;
	}

	function str2rstr_utf16be(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length; i++)
	    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
	                                   input.charCodeAt(i)        & 0xFF);
	  return output;
	}

	/*
	 * Convert a raw string to an array of little-endian words
	 * Characters >255 have their high-byte silently ignored.
	 */
	function rstr2binl(input)
	{
	  var output = Array(input.length >> 2);
	  for(var i = 0; i < output.length; i++)
	    output[i] = 0;
	  for(var i = 0; i < input.length * 8; i += 8)
	    output[i>>5] |= (input.charCodeAt(i / 8) & 0xFF) << (i%32);
	  return output;
	}

	/*
	 * Convert an array of little-endian words to a string
	 */
	function binl2rstr(input)
	{
	  var output = "";
	  for(var i = 0; i < input.length * 32; i += 8)
	    output += String.fromCharCode((input[i>>5] >>> (i % 32)) & 0xFF);
	  return output;
	}

	/*
	 * Calculate the MD5 of an array of little-endian words, and a bit length.
	 */
	function binl_md5(x, len)
	{
	  /* append padding */
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;

	    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
	    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

	    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

	    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

	    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

	    a = safe_add(a, olda);
	    b = safe_add(b, oldb);
	    c = safe_add(c, oldc);
	    d = safe_add(d, oldd);
	  }
	  return Array(a, b, c, d);
	}

	/*
	 * These functions implement the four basic operations the algorithm uses.
	 */
	function md5_cmn(q, a, b, x, s, t)
	{
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}
	function md5_ff(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}
	function md5_gg(a, b, c, d, x, s, t)
	{
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}
	function md5_hh(a, b, c, d, x, s, t)
	{
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}
	function md5_ii(a, b, c, d, x, s, t)
	{
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y)
	{
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}

	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function bit_rol(num, cnt)
	{
	  return (num << cnt) | (num >>> (32 - cnt));
	}
	
	return hex_md5(this);
}
dm.NodeWrapper = dm.Proto.clone().newSlots({
	type: "dm.NodeWrapper",
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
				nodes.push(dm.NodeWrapper.clone().setNode(n));
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
dm.Cookie = dm.Proto.clone().newSlots({
	type: "dm.Cookie",
	name: null,
	value: null,
	expirationDate: null,
	path: "/"
}).setSlots({
	cookieMap: function()
	{
		var map = {};
		
		document.cookie.split("; ").forEach(function(pair){
			var name = pair.before("=");
			var value = pair.after("=");
			map[name] = dm.Cookie.clone().setName(name).setValue(value);
		});
		
		return map;
	},
	
	at: function(name)
	{
		return this.cookieMap()[name];
	},
	
	remove: function()
	{
		return this.setExpirationDate(new Date(0)).save();
	},
	
	renewOneYear: function()
	{
		return this.setExpirationDate(new Date(new Date().getTime() + (1).years())).save();
	},
	
	toString: function()
	{
		var expires = this.expirationDate() ? this.expirationDate().toGMTString() : "";
		return this.name() + "=" + this.value() + "; expires=" + expires + "; path=" + this.path();
	},
	
	save: function()
	{
		document.cookie = this.toString();
		
		return this;
	}
});
dm.Color = dm.Proto.clone().newSlots({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1
}).setSlots({
	withRGBA: function(r, g, b, a)
	{
		var c = this.clone();
		c.setRed(r);
		c.setGreen(g);
		c.setBlue(b);
		c.setAlpha(a);
		return c;
	},
	
	withRGB: function(r, g, b)
	{
		return this.withRGBA(r, g, b, 1);
	},
	
	withHex: function(hex)
	{
		return dm.Color.withRGB(
			parseInt(hex.substring(0, 2), 16)/255,
			parseInt(hex.substring(2, 4), 16)/255,
			parseInt(hex.substring(4, 6), 16)/255
		)
	}
});

dm.Color.setSlots({
	Transparent: dm.Color.clone().setAlpha(0),
	White: dm.Color.clone().setRed(1).setGreen(1).setBlue(1),
	LightGray: dm.Color.clone().setRed(212/255).setGreen(212/255).setBlue(212/255),
	Gray: dm.Color.clone().setRed(127/255).setGreen(127/255).setBlue(127/255),
	DimGray: dm.Color.clone().setRed(105/255).setGreen(105/255).setBlue(105/255),
	Black: dm.Color.clone(),
	Red: dm.Color.clone().setRed(1.0),
	Green: dm.Color.clone().setGreen(1.0),
	DarkGreen: dm.Color.clone().setGreen(100/255),
	Yellow: dm.Color.withRGB(1.0, 1.0, 0)
});

dm.Delegator = dm.Proto.clone().newSlots({
	type: "dm.Delegator",
	delegate: null,
	delegatePrefix: null,
	messagesDelegate: true
}).setSlots({
	init: function()
	{
		this.setDelegatePrefix(this.type().split(".").last().asUncapitalized());
	},
	
	delegateWith: function(slots)
	{
		return this.setDelegate(dm.Proto.clone().setSlots(slots));
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
			var args = dm.Arguments_asArray(arguments).slice(1);
			args.unshift(this);

			var d = this.delegate();

			messageName = this.delegateMessageName(messageName)
//console.log(messageName);
			if (d && d.canPerform(messageName))
			{
				return d.performWithArgList(messageName, args);
			}
		}
	}
});

dm.StyleSlot = dm.Proto.clone().newSlots({
	type: "dm.StyleSlot",
	view: null,
	name: null,
	styleName: null,
	value: null,
	transformation: null
}).setSlots({
	addToView: function()
	{
		var view = this.view();
		var name = this.name();
		var styleName = this.styleName();
		var value = this.value();
		var transformation = this.transformation();
	
		view[name] = function(){ return this["_" + name] }
		view["set" + name.asCapitalized()] = function(v)
		{
			this["_" + name] = v;
			if (transformation)
			{
				this.element().style[styleName] = transformation.apply(v);
			}
			else
			{
				this.element().style[styleName] = v;
			}
			
			return this;
		}
		view["_" + name] = value;
		
		view.styleSlots().append(this);
	}
});

dm.ColorTransformation = dm.Proto.clone().setSlots({
	apply: function(color)
	{
		return "rgba(" + [color.red()*255, color.green()*255, color.blue()*255, color.alpha()].join(",") + ")";
	}
});

dm.SuffixTransformation = dm.Proto.clone().setSlots({
	apply: function(value)
	{
		return value + this.suffix;
	}
});

dm.RoundedSuffixTransformation = dm.Proto.clone().setSlots({
	apply: function(value)
	{
		return Math.round(value) + this.suffix;
	}
});

dm.Point = dm.Proto.clone().newSlots({
	type: "dm.Point",
	x: 0,
	y: 0
}).setSlots({
	scaleToFitPoint: function(point)
	{
		var aspectRatio = this.aspectRatio();

		if(aspectRatio > point.x()/point.y())
		{
			this.setX(point.x());
			this.setY(point.x() / aspectRatio);
		}
		else
		{
			this.setX(point.y() * aspectRatio);
			this.setY(point.y());
		}
		return this;
	},
	
	aspectRatio: function()
	{
		return this.x()/this.y();
	},
	
	withXY: function(x, y)
	{
		return this.clone().setX(x).setY(y);
	},
	
	isPortrait: function()
	{
		return this.aspectRatio() <= 1;
	},
	
	isLandscape: function()
	{
		return this.aspectRatio() > 1;
	},
	
	translateY: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	asLandscape: function()
	{
		return this.isLandscape() ? this : this.transposed();
	},
	
	asPortrait: function()
	{
		return this.isPortrait() ? this : this.transposed();
	},
	
	transposed: function()
	{
		return this.clone().setX(this.y()).setY(this.x());
	}
})
dm.View = dm.Delegator.clone().newSlots({
	type: "dm.View",
	superview: null,
	subviews: [],
	element: null,
	elementName: "div",
	eventListeners: null,
	resizesLeft: false,
	resizesRight: false,
	resizesWidth: false,
	resizesTop: false,
	resizesBottom: false,
	resizesHeight: false,
	styleSlots: [],
	autoResizes: true,
	tracksMouse: false
}).setSlot("newStyleSlots", function(slots){
	for (var name in slots)
	{
		var p = slots[name];
		var s = dm.StyleSlot.clone();
		s.setView(this);
		s.setName(name);
		s.setStyleName(p.name || name);
		s.setValue(p.value);
		if (p.transformation)
		{
			var proto = dm.Object_lookupPath(window, "dm." + p.transformation.name.asCapitalized() + "Transformation");
			if (proto)
			{
				s.setTransformation(proto.clone().setSlots(p.transformation));
			}
		}
		s.addToView();
	}
	return this;
}).newStyleSlots({
	x: { name: "left", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	y: { name: "top", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	cssWidth: { name: "width", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	cssHeight: { name: "height", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	leftBorderThickness: { name: "borderLeftWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	rightBorderThickness: { name: "borderRightWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	topBorderThickness: { name: "borderTopWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	bottomBorderThickness: { name: "borderBottomWidth", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	leftPaddingThickness: { name: "paddingLeft", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	rightPaddingThickness: { name: "paddingRight", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	topPaddingThickness: { name: "paddingTop", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	bottomPaddingThickness: { name: "paddingBottom", value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	borderRadius: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	borderColor: { value: dm.Color.Black, transformation: { name: "color" } },
	backgroundColor: { value: dm.Color.Transparent, transformation: { name: "color" } },
	display: { value: "block" },
	zIndex: { value: 0 }
});

dm.View.setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		this.setEventListeners({});
		this.setStyleSlots(this.styleSlots().copy());
		this.createElement();
		this.initElement();
		this.setSubviews(this.subviews().copy());
	},
	
	domReady: function()
	{
		return dm.Window.inited();
	},

	createElement: function()
	{
		var e = document.createElement(this.elementName());
		e.style.position = "absolute";
		e.style.overflow = "hidden";
		e._dmView = this;
		this.setElement(e);
	},
	
	elementId: function()
	{
		return this.type() + "." + this.uniqueId();
	},

	initElement: function()
	{
		var self = this;
		this.element().id = this.elementId();
		this.styleSlots().forEach(function(ss){
			self.perform("set" + ss.name().asCapitalized(), self.perform(ss.name()));
		});
		this.element().style.borderStyle = "solid";
	},
	
	setBorderThickness: function(t)
	{
		return this.performSets({
			leftBorderThickness: t,
			rightBorderThickness: t,
			topBorderThickness: t,
			bottomBorderThickness: t
		});
	},
	
	setPaddingThickness: function(t)
	{
		return this.performSets({
			verticalPaddingThickness: t,
			horizontalPaddingThickness: t
		});
	},
	
	setVerticalPaddingThickness: function(t)
	{
		return this.performSets({
			topPaddingThickness: t/2,
			bottomPaddingThickness: t/2
		})
	},
	
	setHorizontalPaddingThickness: function(t)
	{
		return this.performSets({
			leftPaddingThickness: t/2,
			rightPaddingThickness: t/2
		});
	},
	
	setTracksMouse: function(tracksMouse)
	{
		this._tracksMouse = tracksMouse;
		var e = this.element();
		
		if (tracksMouse)
		{
			var self = this;
			e.onmouseover = function(e)
			{
				if ((self.element() == e.fromElement) || self.detectAncestorView(function(v){ return v.element() == e.fromElement }))
				{
					return;
				}
				
				self.delegatePerform("mouseEntered", dm.Window.viewWithElement(e.fromElement));
			}
			e.onmouseout = function(e)
			{
				if ((self.element() == e.toElement) || self.detectAncestorView(function(v){ return v.element() == e.toElement }))
				{
					return;
				}

				self.delegatePerform("mouseExited", dm.Window.viewWithElement(e.toElement));
			}
		}
		else
		{
			delete e.onmouseover;
			delete e.onmouseout;
		}
	},
	
	viewWithElement: function(e)
	{
		return this.detectAncestorView(function(v){ return v.element() == e });
	},
	
	contains: function(sv)
	{
		return (sv == this) || this.detectAncestorView(function(v){ return v == sv });
	},
	
	detectAncestorView: function(fn)
	{
		for (var i = 0; i < this.subviews().length; i ++)
		{
			var sv = this.subviews()[i];
			if(fn(sv))
			{
				return sv;
			}
			else
			{
				var av = sv.detectAncestorView(fn);
				if (av)
				{
					return av;
				}
			}
		}
		
		return null;
	},
	
	width: function()
	{
		return this.cssWidth() + this.leftBorderThickness() + this.rightBorderThickness() + this.leftPaddingThickness() + this.rightPaddingThickness();
	},
	
	setWidth: function(w)
	{
		var lastWidth = this.width();
		this.setCssWidth(w - this.leftBorderThickness() - this.rightBorderThickness() - this.leftPaddingThickness() - this.rightPaddingThickness());
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
		
		return this;
	},
	
	height: function()
	{
		return this.cssHeight() + this.topBorderThickness() + this.bottomBorderThickness() + this.topPaddingThickness() + this.bottomPaddingThickness();
	},
	
	setHeight: function(h)
	{
		var lastHeight = this.height();
		this.setCssHeight(h - this.topBorderThickness() - this.bottomBorderThickness() - this.topPaddingThickness() - this.bottomPaddingThickness());
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
		if  (lastHeight != h)
		{
			if (this.superview() && this.superview().canPerform("heightChanged"))
			{
				this.superview().subviewHeightChanged(this);
			}
			this.delegatePerform("heightChanged");
		}
		return this;
	},
	
	size: function()
	{
		return dm.Point.withXY(this.width(), this.height());
	},
	
	setSize: function(size)
	{
		return this.performSets({
			width: size.x(),
			height: size.y()
		});
	},
	
	isLandscape: function()
	{
		return this.size().isLandscape();
	},
	
	aspectRatio: function()
	{
		return this.size().aspectRatio();
	},
	
	setHidden: function(hidden)
	{
		this._hidden = hidden;
		this.setDisplay(hidden ? "none" : "block");
	},
	
	hidden: function()
	{
		return this.display() == "none";
	},
	
	show: function()
	{
		this.setHidden(false);
		return this;
	},
	
	hide: function()
	{
		this.setHidden(true);
		return this;
	},
	
	addEventListener: function(name, fn)
	{
		if (!this._eventListeners[name])
		{
			this._eventListeners[name] = [];
		}
		this._eventListeners[name].append(fn);
		
		var e = this.element();
		if (e.addEventListener)
		{
			e.addEventListener(name, fn, false);
		}
		else
		{
			e.attachEvent(name, fn);
		}
	},
	
	removeEventListener: function(name, fn)
	{
		var e = this.element();
		if (e.removeEventListener)
		{
			e.removeEventListener(name, fn);
		}
		else
		{
			e.detachEvent(name, fn);
		}
	},
	
	removeEventListeners: function(name)
	{
		var listeners = this._eventListeners[name];
		if (listeners)
		{
			var self = this;
			listeners.forEach(function(listener){
				self.removeEventListener(name, listener);
			});
		}
	},
	
	preventDefault: function(evt)
	{
		if(evt.preventDefault)
		{
			evt.preventDefault();
		}
		else if(evt.returnValue)
		{
			evt.returnValue = false;
		}
	},

	removeSubview: function(subview)
	{
		if (!subview)
		{
			return this;
		}
		if (subview.superview() != this)
		{
			throw "view is not a subview";
		}
		this.subviews().remove(subview);
		subview.setSuperview(null);
		this.element().removeChild(subview.element());
	},
	
	removeAllSubviews: function()
	{
		var self = this;
		this.subviews().copy().forEach(function(sv){
			self.removeSubview(sv);
		});
	},
	
	removeFromSuperview: function()
	{
		if (this.superview())
		{
			this.superview().removeSubview(this);
		}
		return this;
	},

	addSubview: function(subview)
	{
		var oldSuperview = subview.superview();
		if (oldSuperview)
		{
			oldSuperview.removeSubview(subview);
		}
		subview.setSuperview(this);
		this.subviews().append(subview);
		this.element().appendChild(subview.element());
		
		subview.conditionallyPerform("superviewChanged");
		
		return this;
	},
	
	addToView: function(v)
	{
		v.addSubview(this);
		return this;
	},
	
	addSubviews: function()
	{
		var self = this;
		dm.Arguments_asArray(arguments).forEach(function(view){
			self.addSubview(view);
		});
	},
	
	rightEdge: function()
	{
		return this.x() + this.width();
	},
	
	bottomEdge: function()
	{
		return this.y() + this.height();
	},
	
	moveRightOf: function(view, margin)
	{
		margin = margin || 0;
		this.setX(view.rightEdge() + margin);
		return this;
	},
	
	moveAbove: function(view, margin)
	{
		margin = margin || 0;
		this.setY(view.y() - this.height() - margin);
	},
	
	moveBelow: function(view, margin)
	{
		margin = margin || 0;
		this.setY(view.bottomEdge() + margin);
		return this;
	},
	
	alignTopTo: function(view)
	{
		this.setY(view.y());
	},
	
	alignMiddleTo: function(view)
	{
		this.setY(view.y() + .5*view.height() - .5*this.height());
	},
	
	alignBottomTo: function(view)
	{
		this.setY(view.bottomEdge() - this.height() - 1);
	},
	
	alignLeftTo: function(view)
	{
		this.setX(view.x());
	},
	
	alignRightTo: function(view)
	{
		this.setX(view.rightEdge() - this.width() - 1);
	},
	
	centerXOver: function(view)
	{
		this.setX(view.x() + (view.width() - this.width())/2);
		return this;
	},
	
	centerYOver: function(view)
	{
		return this.setY(view.y() + (view.height() - this.height())/2);
	},
	
	centerOver: function(view)
	{
		this.centerXOver(view);
		this.centerYOver(view);
		return this;
	},
	
	center: function()
	{
		this.centerHorizontally();
		this.centerVertically();
		return this;
	},
	
	centerHorizontally: function()
	{
		var s = this.superview();
		if (s)
		{
			this.setX((s.width() - this.width())/2);
		}
	},
	
	centerVertically: function()
	{
		this.centerVerticallyInView(this.superview());
	},
	
	centerVerticallyInView: function(v)
	{
		if (v)
		{
			this.setY((v.height() - this.height())/2);
		}
	},
	
	moveToBottom: function(margin)
	{
		if (this.superview())
		{
			margin = margin || 0;

			this.setY(this.superview().height() - this.height() - margin);
		}
	},
	
	moveToRight: function(margin)
	{
		if (this.superview())
		{
			margin = margin || 0;

			this.setX(this.superview().width() - this.width() - margin);
		}
		return this;
	},
	
	moveLeft: function(x)
	{
		return this.setX(this.x() - x);
	},
	
	moveRight: function(x)
	{
		return this.setX(this.x() + x);
	},
	
	moveDown: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	moveUp: function(y)
	{
		return this.setY(this.y() - y);
	},
	
	growWidth: function(width)
	{
		return this.setWidth(this.width() + width);
	},
	
	growHeight: function(height)
	{
		return this.setHeight(this.height() + height);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
		if (!this.autoResizes() || !this.superview())
		{
			return;
		}
		var currentSuperWidth = this.superview().width();
		var myLastWidth = this.width();
		
		if (this.resizesLeft())
		{
			if (this.resizesRight())
			{
				if(this.resizesWidth())
				{
					this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
				}
				
				this.setX(this.x() * (currentSuperWidth - this.width()) / (lastSuperWidth - myLastWidth));
			}
			else
			{
				if(this.resizesWidth())
				{
					this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
				}
				
				this.setX(this.x() + myLastWidth + currentSuperWidth - this.width() - lastSuperWidth);
			}
		}
		else if (this.resizesRight())
		{
			if(this.resizesWidth())
			{
				this.setWidth(myLastWidth*currentSuperWidth/lastSuperWidth);
			}
		}
		else if (this.resizesWidth())
		{
			this.setWidth(currentSuperWidth - (lastSuperWidth - myLastWidth));
		}
	},
	
	autoResizeHeight: function(lastSuperHeight)
	{
		if (!this.autoResizes() || !this.superview())
		{
			return;
		}
		var currentSuperHeight = this.superview().height();
		var myLastHeight = this.height();
		
		if (this.resizesTop())
		{
			if (this.resizesBottom())
			{
				if(this.resizesHeight())
				{
					this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
				}
				
				this.setY(this.y() * (currentSuperHeight - this.height()) / (lastSuperHeight - myLastHeight));
			}
			else
			{
				if(this.resizesHeight())
				{
					this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
				}
				
				this.setY(this.y() + myLastHeight + currentSuperHeight - this.height() - lastSuperHeight);
			}
		}
		else if (this.resizesBottom())
		{
			if(this.resizesHeight())
			{
				this.setHeight(myLastHeight*currentSuperHeight/lastSuperHeight);
			}
		}
		else if (this.resizesHeight())
		{
			this.setHeight(currentSuperHeight - (lastSuperHeight - myLastHeight));
		}
	},
	
	autoResize: function(width, height)
	{
		this.autoResizeWidth(width);
		this.autoResizeHeight(height);
	},
	
	resizeCentered: function()
	{
		this.resizeCenteredHorizontally();
		this.resizeCenteredVertically();
		return this;
	},
	
	resizeCenteredHorizontally: function()
	{
		this.setResizesLeft(true);
		this.setResizesRight(true);
	},
	
	resizeCenteredVertically: function()
	{
		this.setResizesTop(true);
		this.setResizesBottom(true);
	},
	
	resizeToFill: function()
	{
		this.setResizesWidth(true);
		this.setResizesHeight(true);
		return this;
	},
	
	scaleToFitSuperview: function()
	{
		var superview = this.superview();
		if (superview)
		{
			this.scaleToFitSize(superview.size());
		}
	},
	
	scaleToFitSize: function(size)
	{
		this.setSize(this.size().scaleToFitPoint(size));
		return this;
	},
	
	sizingElement: function()
	{
		var e = this.element().cloneNode(true);
		var s = e.style;
		s.display = "block";
		s.position = "fixed";
		s.width = "";
		s.height = "";
		s.top = screen.height + "px";
		document.body.appendChild(e);
		
		return e;
	},
	
	sizeWidthToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		this.setWidth(e.offsetWidth + (this.width() - this.cssWidth()));
		document.body.removeChild(e);
		return this;
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.offsetHeight + (this.height() - this.cssHeight()));
		document.body.removeChild(e);
		return this;
	},
	
	sizeToFit: function()
	{
		this.sizeWidthToFit();
		this.sizeHeightToFit();
		return this;
	},
	
	sizeWidthToFitSubviews: function()
	{
		return this.setWidth(this.subviews().mapPerform("rightEdge").max() + 1);
	},
	
	sizeHeightToFitSubviews: function()
	{
		return this.setHeight(this.subviews().mapPerform("bottomEdge").max() + 1);
	},
	
	sizeToFitSubviews: function()
	{
		this.sizeWidthToFitSubviews();
		this.sizeHeightToFitSubviews();
		
		return this;
	},
	
	stackSubviewsHorizontally: function(margin)
	{
		margin = margin || 0;
		var x = margin;
		this.subviews().forEach(function(sv){;
			sv.setX(x);
			x = sv.rightEdge() + margin;
		});
	},
	
	stackSubviewsVertically: function(margin)
	{
		margin = margin || 0;
		var y = margin;
		this.subviews().forEach(function(sv){;
			sv.setY(y);
			y = sv.bottomEdge() + margin;
		});
	},
	
	moveToBack: function()
	{
		if (this.superview())
		{
			this.setZIndex(this.superview().subviews().mapPerform("zIndex").min() - 1);
		}
	},
	
	//animations
	fadeOut: function(duration)
	{
		duration = duration || 1000;
		
		var start = new Date();
		var self = this;
		var initialOpacity  = this.element().style.opacity;
		var interval = setInterval(function(){
			var elapsed = new Date().getTime() - start.getTime();
			self.element().style.opacity = 1 - (elapsed/duration);
			if (elapsed >= duration)
			{
				self.delegatePerform("fadedOut");
				clearInterval(interval);
				self.hide();
				self.element().style.opacity = initialOpacity;
			}
		}, 1000/60);
	}
});

dm.Window = dm.View.clone().newSlots({
	type: "dm.Window",
	lastResizeWidth: null,
	lastResizeHeight: null,
	inited: false,
	containerElement: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		
		this.element().innerHTML = "";
		
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
		
		window.onresize = function()
		{
			dm.Window.autoResize();
		}
		
		var self = this;
		window.onmessage = function(e)
		{
			self.delegatePerform("messagedFrom", e.data, e.origin);
		}
		
		/* Doesn't work for some reason.  Add it to html for now
		var meta = document.createElement("meta");
		meta.httpEquiv = "Content-Type";
		meta.content = "text/html;charset=utf-8";
		
		document.head.appendChild(meta);
		*/
		
		this.setInited(true);
		this.delegatePerform("inited");
	},
	
	startResizeInterval: function() //window.onresize doesn't always work on mobile webkit.
	{
		if (!this._resizeTimer)
		{
			var self = this;
			this._resizeTimer = setInterval(function(){
				if (self.width() != self.lastResizeWidth() || self.height() != self.lastResizeHeight())
				{
					self.autoResize();
				}
			}, 200);
		}
	},
	
	createElement: function()
	{
		if (this.containerElement())
		{
			this.setElement(this.containerElement());
		}
		else
		{
			this.setElement(document.body);
		}
	},

	initElement: function()
	{
		//this.element().style.zIndex = 
	},
	
	width: function()
	{
		if (this.element() == document.body)
		{
			return window.innerWidth; //document.body isn't reliable on mobile
		}
		else
		{
			return this.element().clientWidth;
		}
	},
	
	height: function()
	{
		if (this.element() == document.body)
		{
			return window.innerHeight; //document.body isn't reliable on mobile
		}
		else
		{
			return this.element().clientHeight;
		}
	},
	
	autoResize: function()
	{
		this.subviews().forEachPerform("autoResize", this.lastResizeWidth(), this.lastResizeHeight());
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
	},
	
	windowLoaded: function()
	{
		dm.Window.init();
		/*
		try
		{
			dm.Window.init();
		}
		catch (e)
		{
			alert(e);
		}
		*/
	}
});

window.addEventListener("load", dm.Window.windowLoaded);
dm.Label = dm.View.clone().newSlots({
	type: "dm.Label",
	text: null
}).newStyleSlots({
	fontFamily: { value: "Helvetica, Arial, sans-serif" },
	fontSize: { value: 15, transformation: { name: "suffix", suffix: "px" } },
	fontWeight: { value: "normal" },
	textDecoration: { value: "none" },
	color: { value: dm.Color.Black, transformation: { name: "color" } },
	textOverflow: { value: "ellipsis" },
	whiteSpace: { value: "pre" },
	textAlign: { value: "left" },
	lineHeight: { value: "" }
}).setSlots({
	setText: function(text)
	{
		this._text = text;
		this.element().innerText = text;
		
		return this;
	}
});

dm.NativeControl = dm.View.clone().newSlots({
	type: "dm.NativeControl"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var e = this.element();
		e.style.border = "";
		e.style.margin = "";
		e.style.padding = "";
	}
});
dm.TextField = dm.Label.clone().newSlots({
	type: "dm.TextField",
	elementName: "input",
	placeholderText: "Enter Text",
	placeholderTextColor: dm.Color.Gray,
	growsToFit: false
}).setSlots({
	initElement: function()
	{
		dm.NativeControl.initElement.call(this); //hack since TextField clones Label
		
		var e = this.element();
		
		e.type = "text";
		
		var self = this;
		e.onkeydown = function(evt)
		{
			if (evt.keyCode == 13)
			{
				self.preventDefault(evt);
				
				self.element().blur();
			}
			self.checkChanged();
		}
		
		e.onpaste = function(evt)
		{
			self.checkChanged();
		}
		
		e.onmouseup = function(evt)
		{
			self.checkChanged();
		}
		
		e.onfocus = function(evt)
		{
			if (self._originalColor)
			{
				self.setColor(self._originalColor);
			}
			setTimeout(function(){
				self.selectAll();
			});
		}
		
		e.onblur = function(evt)
		{
			self.setText(self.text()); //placeholder color
			
			if (!(self.delegate() && self.delegate().canPerform(self.delegateMessageName("shouldEndEditing"))) || self.delegatePerform("shouldEndEditing"))
			{
				self.delegatePerform("editingEnded", self);
			}
			else
			{
				setTimeout(function(){
					self.focus();
					self.selectAll();
				});
			}
		}
		
		this.setText(this.text());
	},
	
	sizingElement: function()
	{
		var e = document.createElement("div");

		var clonedElement = this.element().cloneNode(true);
		document.body.appendChild(clonedElement);
		var myStyle = window.getComputedStyle(clonedElement);
		for (var i = myStyle.length - 1; i > -1; i --)
		{
		    var name = myStyle[i];
		    e.style.setProperty(name, myStyle.getPropertyValue(name));
		}
		document.body.removeChild(clonedElement);

		e.style.display = "block";
		e.style.position = "fixed";
		e.style.width = "";
		e.style.height = "";
		e.style.top = screen.height + "px";
		if (this.text() == "")
		{
			e.innerText = this.placeholderText() || " ";
		}
		else
		{
			e.innerText = this.text();
		}
		document.body.appendChild(e);
		return e;
	},
	
	width: function()
	{
		var style = window.getComputedStyle(this.element());
		return this.cssWidth() +
			parseFloat(style.getPropertyValue("padding-left") || 0) +
			parseFloat(style.getPropertyValue("padding-right") || 0) +
			parseFloat(style.getPropertyValue("border-left-width") || 0) +
			parseFloat(style.getPropertyValue("border-right-width") || 0) + 2;
	},
	
	height: function()
	{
		var style = window.getComputedStyle(this.element());
		return this.cssHeight() + parseFloat(style.getPropertyValue("padding-top") || 0) + parseFloat(style.getPropertyValue("padding-bottom") || 0) + parseFloat(style.getPropertyValue("border-top-width") || 0) + parseFloat(style.getPropertyValue("border-bottom-width") || 0);
	},
	
	checkChanged: function()
	{
		var self = this;
		setTimeout(function(){
			if (self.text() != self._lastText)
			{
				self._lastText = self.text();
				if (self.growsToFit())
				{
					self.sizeToFit();
				}
				
				self.changed();
			}
		});
	},
	
	changed: function()
	{
		this.delegatePerform("changed");
	},
	
	setText: function(text)
	{
		if (text.strip() == "")
		{
			this._originalColor = this.color();
			this.setColor(this.placeholderTextColor());
			this.element().value = this.placeholderText();
		}
		else
		{
			if (this._originalColor)
			{
				this.setColor(this._originalColor);
				delete this._originalColor;
			}
			this.element().value = text;
		}
		
		this.checkChanged();
		
		return this;
	},
	
	text: function()
	{
		var text = this.element().value;
		if (text == this.placeholderText())
		{
			return "";
		}
		else
		{
			return text;
		}
	},
	
	setPlaceholderText: function(placeholderText)
	{
		var text = this.text();
		this._placeholderText = placeholderText;
		this.setText(text);
		return this;
	},
	
	selectAll: function()
	{
		this.element().select();
	},
	
	focus: function()
	{
		this.element().focus();
	},
	
	value: function()
	{
		return this.text();
	},
	
	setValue: function(value)
	{
		this.setText(value);
	}
});

dm.TextArea = dm.NativeControl.clone().newSlots({
	type: "dm.TextArea",
	elementName: "textarea"
}).setSlots({
	initElement: function()
	{
		dm.NativeControl.initElement.call(this);
		
		var e = this.element();
		
		e.style.margin = "";
		e.style.padding = "";
		
		var self = this;
		e.onblur = function(evt)
		{
			self.delegatePerform("editingEnded", self);
		}
	},
	
	setText: function(text)
	{
		this.element().value = text;
		return this;
	},
	
	text: function()
	{
		return this.element().value;
	},
	
	selectAll: function()
	{
		this.element().select();
	},
	
	focus: function()
	{
		this.element().focus();
	},
	
	value: function()
	{
		return this.text();
	},
	
	setValue: function(value)
	{
		this.setText(value);
	}
});

dm.Button = dm.Label.clone().newSlots({
	type: "dm.Button"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		this.setTextAlign("center");
		
		var self = this;
		var e = this.element();
		e.onclick = function(e)
		{
			self.delegatePerform("clicked", e);
		}
		e.style.cursor = "pointer";
	},
	
	disable: function()
	{
		this.setColor(this.color().setAlpha(.5));
		this.setMessagesDelegate(false);
	},
	
	enable: function()
	{
		this.setColor(this.color().setAlpha(1.0));
		this.setMessagesDelegate(true);
	},
	
	simulateClick: function()
	{
		var clickEvent = document.createEvent("MouseEvents");
		clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		this.element().dispatchEvent(clickEvent);
	}
});

dm.CheckBox = dm.NativeControl.clone().newSlots({
	type: "dm.CheckBox",
	elementName: "input",
	checked: false
}).setSlots({
	init: function()
	{
		dm.NativeControl.init.call(this);
		this.sizeToFit();
	},
	
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var self = this;
		
		var e = this.element();
		e.type = "checkbox";
		
		e.onclick = function(evt)
		{
			self.setChecked(self.element().checked);
		}
	},
	
	setChecked: function(checked)
	{
		if (this.checked() != checked)
		{
			this._checked = checked;
			this.element().checked = checked;
			this.delegatePerform("changed");
		}
	},
	
	toggleChecked: function()
	{
		this.setChecked(!this.checked());
	},
	
	sizeWidthToFit: function()
	{
		dm.View.sizeWidthToFit.call(this);
		this.setWidth(this.width() + 2);
		return this;
	},
	
	sizeHeightToFit: function()
	{
		dm.View.sizeHeightToFit.call(this);
		this.setHeight(this.height() + 2);
		return this;
	},
	
	value: function()
	{
		return this.checked();
	},

	setValue: function(value)
	{
		this.setChecked(value);
	}
});

dm.DropDown = dm.NativeControl.clone().newSlots({
	type: "dm.DropDown",
	elementName: "select",
}).setSlots({
	initElement: function()
	{
		dm.NativeControl.initElement.call(this);
		
		var self = this;
		
		var e = this.element();
		e.onchange = function(evt)
		{
			self.delegatePerform("changed");
		}
	},
	
	setOptions: function(options)
	{
		var e = this.element();
		e.innerHTML = "";
		
		options.forEach(function(option){
			var optionElement = document.createElement("option");
			optionElement.value = option;
			optionElement.innerText = option;
			select = e;
			e.appendChild(optionElement);
		});
	},
	
	selectedOption: function()
	{
		var optionElement = Array.prototype.slice.call(this.element().options).detect(function(option){ return option.selected });
		return optionElement && optionElement.value;
	},
	
	setSelectedOption: function(selectedOption)
	{
		Array.prototype.slice.call(this.element().options).forEach(function(option){
			option.selected = option.value == selectedOption ? "selected" : "";
		});
	},
	
	value: function()
	{
		return this.selectedOption();
	},
	
	setValue: function(value)
	{
		this.setSelectedOption(value);
	}
});

dm.ScrollView = dm.View.clone().newSlots({
	type: "dm.ScrollView",
	contentView: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		this.setContentView(dm.View.clone());
	},
	
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		this.element().style.overflow = "auto";
	},
	
	setContentView: function(contentView)
	{
		if (this._contentView)
		{
			this._contentView.removeFromSuperview();
		}
		this.addSubview(contentView);
		this._contentView = contentView;
		return this;
	},
	
	scrollToBottom: function()
	{
		this.element().scrollTop = this.contentView().height() - this.height();
	},
	
	scrollToTop: function()
	{
		this.element().scrollTop = 0;
	}
});

dm.TitledView = dm.View.clone().newSlots({
	type: "dm.TitledView",
	title: "",
	titleBar: null,
	contentView: null
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		
		if (dm.Window.inited())
		{
			var l = dm.Label.clone();
			l.setText("Title Bar");
			l.sizeToFit();
			l.resizeCentered();

			var tb = dm.View.clone();
			tb.setBackgroundColor(dm.Color.LightGray);
			tb.setWidth(l.width() + l.fontSize());
			tb.setHeight(l.height() + l.fontSize());
			tb.setResizesWidth(true);
			tb.addSubview(l);
			tb.newSlot("label", l);

			l.center();
			this.setTitleBar(tb);

			var cv = dm.View.clone();
			cv.setWidth(tb.width());
			cv.setHeight(1);
			cv.setY(tb.height());
			cv.setResizesWidth(true);
			cv.setResizesHeight(true);
			this.setContentView(cv);

			this.setWidth(tb.width());
			this.setHeight(tb.height() + cv.height());

			var tbDivider = dm.View.clone();
			tbDivider.setBackgroundColor(dm.Color.Gray);
			tbDivider.setY(tb.height());
			tbDivider.setWidth(tb.width());
			tbDivider.setHeight(1);
			tbDivider.setResizesWidth(true);

			var rightDivider = dm.View.clone();
			rightDivider.setBackgroundColor(dm.Color.Gray);
			rightDivider.setX(this.width() - 1);
			rightDivider.setWidth(1);
			rightDivider.setHeight(this.height());
			rightDivider.setResizesLeft(true);
			rightDivider.setResizesHeight(true);

			this.addSubview(tb);
			this.addSubview(tbDivider);
			this.addSubview(cv);
			this.addSubview(rightDivider);
		}
	},
	
	setTitle: function(title)
	{
		var l = this.titleBar().label();
		l.setText(title);
		l.sizeToFit();
		l.center();
		this._title = title;
	}
});

dm.TableView = dm.View.clone().newSlots({
	type: "dm.TableView",
	rows: [],
	vMargin: 8,
	hMargin: 10,
	colAlignments: [],
	rowAlignments: []
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		this.setRows(this.rows().copy());
		this.setRowAlignments(this.rowAlignments().copy());
		this.setColAlignments(this.colAlignments().copy());
	},
	
	ColAlignmentLeft: "left",
	ColAlignmentCenter: "center",
	ColAlignmentRight: "right",
	
	RowAlignmentTop: "top",
	RowAlignmentMiddle: "middle",
	RowAlignmentBottom: "bottom",
	
	row: function(rowNum)
	{
		var row = this.rows()[rowNum];
		if (!row)
		{
			row = [];
			this.rows()[rowNum] = row;
		}
		return row;
	},
	
	addAtRowCol: function(view, rowNum, colNum)
	{
		var rows = this.rows();
		
		var row = this.row(rowNum);
		
		var existingView = row[colNum];
		if (existingView)
		{
			this.removeAtRowCol(rowNum, colNum);
		}
		row[colNum] = view;
		this.addSubview(view);
		this.applyLayout();
	},
	
	removeAtRowCol: function(rowNum, colNum)
	{
		var row = this.row(rowNum);
		var view = row[colNum];
		
		if (view)
		{
			this.removeSubview(view);
			row[rowNum][colNum] = null;
		}
		this.applyLayout();
	},
	
	empty: function()
	{
		this.setRows([]);
		this.removeAllSubviews();
	},
	
	viewAtRowCol: function(rowNum, colNum)
	{
		return this.row(rowNum)[colNum];
	},
	
	colCount: function()
	{
		return this.rows().map(function(r){ return (r && r.length) || 0 }).max() || 0;
	},
	
	colWidth: function(col)
	{
		return this.rows().map(function(r){ return (r[col] || dm.View.clone()).width() }).max() || 0;
	},
	
	rowCount: function()
	{
		return this.rows().length;
	},
	
	rowHeight: function(row)
	{
		var h = this.rows()[row].map(function(view){ return (view || dm.View.clone()).height() }).max();
		return h;
	},
	
	alignRow: function(rowNum, alignment)
	{
		this.rowAlignments()[rowNum] = alignment;
	},
	
	alignCol: function(colNum, alignment)
	{
		this.colAlignments()[colNum] = alignment;
	},
	
	rowAlignment: function(rowNum)
	{
		return this.rowAlignments()[rowNum] || this.defaultRowAlignment();
	},
	
	colAlignment: function(colNum)
	{
		return this.colAlignments()[colNum] || this.defaultColAlignment();
	},
	
	applyLayout: function()
	{
		var self = this;
		this.setWidth(this.colCount().map(function(colNum){ return self.colWidth(colNum) }).sum() + this.hMargin() * (this.colCount() + 1));
		this.setHeight(this.rowCount().map(function(rowNum){ return self.rowHeight(rowNum) }).sum() + this.vMargin() * (this.rowCount() + 1));
		
		var rows = this.rows();
		for (var r = 0; r < this.rowCount(); r ++)
		{
			var row = rows[r];
			var rowAlignment = this.rowAlignment(r);
			
			for (var c = 0; c < this.colCount(); c ++)
			{
				var colAlignment = this.colAlignment(c);
				
				var v = this.viewAtRowCol(r, c);
				if (v)
				{
					var leftEdge = this.hMargin() + c*this.hMargin() + c.map(function(c){ return self.colWidth(c) }).sum();
					
					if (colAlignment == dm.TableView.ColAlignmentLeft)
					{
						v.setX(leftEdge);
					}
					else if(colAlignment == dm.TableView.ColAlignmentCenter)
					{
						v.setX(leftEdge + (this.colWidth(c) - v.width())/2);
					}
					else
					{
						v.setX(leftEdge + this.colWidth(c) - v.width());
					}
					
					var topEdge = this.vMargin() + r*this.vMargin() + r.map(function(r){ return self.rowHeight(r) }).sum();
					if (rowAlignment == dm.TableView.RowAlignmentTop)
					{
						v.setY(topEdge);
					}
					else if(rowAlignment == dm.TableView.RowAlignmentMiddle)
					{
						v.setY(topEdge + (this.rowHeight(r) - v.height())/2);
					}
					else
					{
						v.setY(topEdge + this.rowHeight(r) - v.height());
					}
				}
			}
		}
		return this;
	}
});

dm.TableView.newSlots({
	defaultColAlignment: dm.TableView.ColAlignmentCenter,
	defaultRowAlignment: dm.TableView.RowAlignmentMiddle
});
dm.VerticalListContentView = dm.View.clone().newSlots({
	type: "dm.VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15,
	confirmsRemove: true,
	closeButton: null,
}).setSlots({
	init: function()
	{
		dm.View.init.call(this);
		
		this.setItems(this.items().copy());
		
		if(dm.Window.inited())
		{
			var closeButton = dm.ImageButton.clone().newSlot("itemView", null);
			this.setCloseButton(closeButton);
			closeButton.setDelegate(this);
			closeButton.setDelegatePrefix("closeButton");
			closeButton.setImageUrl("http://f.cl.ly/items/3P3Y2Z2B31222w0l1K0E/gray-close.png");
			closeButton.setWidth(12);
			closeButton.setHeight(12);
			closeButton.setX(this.width() - closeButton.width() - closeButton.width()/2);
			closeButton.setResizesLeft(true);
			closeButton.setZIndex(1);
			closeButton.hide();
			this.addSubview(closeButton);
		}
	},
	
	addItemWithText: function(text)
	{
		var hMargin = dm.VerticalListContentView.itemHMargin();
		var vMargin = dm.VerticalListContentView.itemVMargin();
		
		
		var itemView = dm.Button.clone().newSlots({
			type: "dm.ItemView",
			label: null
		}).clone();
		itemView.setTracksMouse(true);
		itemView.setDelegate(this);
		itemView.setWidth(this.width());
		itemView.setResizesWidth(true);
		
		var label = dm.Label.clone();
		itemView.setLabel(label);
		label.setColor(dm.Color.Gray);
		label.setText(text);
		label.setWidth(this.width() - hMargin - 2*this.closeButton().width());
		label.sizeHeightToFit();
		label.setX(hMargin);
		itemView.setHeight(label.height() + hMargin);
		itemView.addSubview(label);
		
		itemView.addSubview(label);
		label.centerVertically();
		
		this.addItem(itemView);
	},
	
	itemViewMouseEntered: function(itemView, previousView)
	{
		if (!this.closeButton().contains(previousView))
		{
			var closeButton = this.closeButton();
			closeButton.centerYOver(itemView);
			closeButton.moveDown(1);
			closeButton.show();
			closeButton.setItemView(itemView);
		}
	},
	
	itemViewMouseExited: function(itemView, nextView)
	{
		if (!this.closeButton().contains(nextView))
		{
			var closeButton = this.closeButton();
			closeButton.hide();
			closeButton.setItemView(null);
		}
	},
	
	itemViewClicked: function(button)
	{
		if (this.selectedItemIndex() !== null)
		{
			var selectedItem = this.selectedItem();
			if (selectedItem)
			{
				var l = selectedItem.label();
				l.setColor(dm.Color.Gray);
				l.setFontWeight("normal");
			}
		}

		var l = button.label();
		l.setColor(dm.Color.Black);
		l.setFontWeight("bold");
		
		this.setSelectedItemIndex(this.items().indexOf(button));

		this.delegatePerform("selectedItem", button);
	},
	
	addItem: function(itemView)
	{
		var hMargin = dm.VerticalListContentView.itemHMargin();
		
		itemView.setY(this.items().length * itemView.height());
		this.setHeight(itemView.bottomEdge());
		this.addSubview(itemView);
		this.items().append(itemView);
	},
	
	removeLastItem: function()
	{
		var item = this.items().pop();
		
		this.removeSubview(item);
		this.setHeight(this.height() - item.height());
	},
	
	selectItem: function(item)
	{
		this.itemViewClicked(item);
	},
	
	removeItem: function(item)
	{
		if (this.confirmsRemove())
		{
			if (!confirm("Remove " + item.label().text() + "?"))
			{
				return;
			}
		}
		
		var selectedItem = this.selectedItem();
		
		var itemIndex = this.items().indexOf(item);
		this.items().remove(item);
		this.items().slice(itemIndex).forEach(function(itemToMove){
			itemToMove.setY(itemToMove.y() - item.height());
		});
		this.removeSubview(item);
		this.setHeight(this.height() - item.height());
		if (selectedItem == item)
		{
			var itemToSelect = this.items()[itemIndex] || this.items().last();
			if (itemToSelect)
			{
				this.selectItem(itemToSelect);
			}
		}
		var newItemAtIndex = this.items()[itemIndex];
		if (newItemAtIndex)
		{
			this.itemViewMouseEntered(newItemAtIndex, null);
		}
		
		this.delegatePerform("removedItem", item);
	},
	
	closeButtonClicked: function(closeButton)
	{
		this.removeItem(closeButton.itemView());
	},
	
	selectedItem: function()
	{
		return this.items()[this.selectedItemIndex()];
	},
	
	removeSelectedItem: function()
	{
		this.removeItem(this.selectedItem());
	}
});

dm.VerticalListView = dm.TitledView.clone().newSlots({
	type: "dm.VerticalListView",
	scrollView: null,
	controlsView: null,
	addButton: null,
	defaultItemText: "New Item",
	allowsItemEditing: false
}).setSlots({
	init: function()
	{
		dm.TitledView.init.call(this);
		
		if (dm.Window.inited())
		{
			var addButton = dm.Button.clone();
			addButton.setFontWeight("bold");
			addButton.setText("+");
			addButton.setColor(dm.Color.DimGray);
			addButton.sizeToFit();
			addButton.setX(addButton.fontSize());
			addButton.setY(addButton.fontSize()/2);
			addButton.setDelegate(this, "addButton").setDelegatePrefix("addButton");
			this.setAddButton(addButton);
		
			var selfWidth = Math.max(addButton.width() + addButton.fontSize(), this.titleBar().width());
		
			var contentView = dm.VerticalListContentView.clone();
			contentView.setWidth(selfWidth);
			contentView.setResizesWidth(true);
			contentView.setDelegate(this);
			contentView.setDelegatePrefix("vlcv");
		
			var scrollView = dm.ScrollView.clone();
			scrollView.setWidth(selfWidth);
			scrollView.setHeight(1);
			scrollView.setResizesHeight(true);
			scrollView.setResizesWidth(true);
			scrollView.setContentView(contentView);
			this.setScrollView(scrollView);
		
			var controlsView = dm.View.clone();
			controlsView.setBackgroundColor(dm.Color.LightGray);
			controlsView.setY(scrollView.height());
			controlsView.setWidth(selfWidth);
			controlsView.setHeight(addButton.height() + 0.5*addButton.fontSize());
			controlsView.setResizesWidth(true);
			controlsView.setResizesTop(true);
		
			this.setControlsView(controlsView);
		
			var controlsDivider = dm.View.clone();
			controlsDivider.setBackgroundColor(dm.Color.Gray);
			controlsDivider.setY(controlsView.y() - 1);
			controlsDivider.setWidth(selfWidth);
			controlsDivider.setHeight(1);
			controlsDivider.setResizesTop(true);
			controlsDivider.setResizesWidth(true);
		
			this.setWidth(selfWidth);
			this.setHeight(this.titleBar().height() + scrollView.height() + controlsView.height());
		
			var cv = this.contentView();
			cv.addSubview(scrollView);
			cv.addSubview(controlsView);
			cv.addSubview(controlsDivider);
			cv.addSubview(addButton);
			
			this.updateButtons();
		}
	},
	
	addButtonClicked: function()
	{
		if (this.allowsItemEditing())
		{
			var hMargin = dm.VerticalListContentView.itemHMargin();
			var vMargin = dm.VerticalListContentView.itemVMargin();

			var textField = dm.TextField.clone();
			textField.setText(this.defaultItemText());
			textField.setWidth(this.width() - 2*hMargin);
			textField.sizeHeightToFit();
			textField.setX(hMargin);
			textField.setDelegate(this);

			var itemView = dm.View.clone();
			itemView.setWidth(this.width());
			itemView.setHeight(textField.height() + vMargin);

			itemView.addSubview(textField);
			textField.centerVertically();

			var sv = this.scrollView();
			var cv = sv.contentView();
			cv.addItem(itemView);
			this.scrollView().scrollToBottom();

			textField.focus();
			textField.selectAll();

			if (!this.shouldDockButton())
			{
				this.addButton().setHidden(true);
			}
		}
		else
		{
			this.vlcv().addItemWithText(this.defaultItemText());
			this.selectLastItem();
		}
	},
	
	vlcv: function()
	{
		return this.scrollView().contentView();
	},
	
	textFieldShouldEndEditing: function(textField)
	{
		return !(this.delegate() && this.delegate().canPerform(this.delegateMessageName("shouldAddItemWithText"))) || this.delegatePerform("shouldAddItemWithText", textField.text());
	},
	
	textFieldEditingEnded: function(textField)
	{
		var cv = this.scrollView().contentView();
		cv.removeLastItem();
		cv.addItemWithText(textField.text());
		cv.itemViewClicked(cv.items().last());
		this.scrollView().scrollToBottom();
	},
	
	shouldDockButton: function()
	{
		return (this.scrollView().contentView().height() + this.addButton().height()) > this.scrollView().height()
	},
	
	updateButtons: function()
	{
		if (this.shouldDockButton())
		{
			this.addButton().setY(this.scrollView().height() + this.controlsView().height()/2 - this.addButton().height()/2 - 2);
			this.addButton().setResizesTop(true);
			this.addButton().setResizesBottom(false);
		}
		else
		{
			var y = this.scrollView().contentView().height();
			if (y == 0)
			{
				y = 8;
			}
			
			this.addButton().setY(y);
			this.addButton().setResizesTop(false);
			this.addButton().setResizesBottom(true);
		}
		
		this.addButton().setHidden(false);
	},
	
	setHeight: function(h)
	{
		dm.TitledView.setHeight.call(this, h);
		if (this.scrollView())
		{
			this.updateButtons();
		}
		
		return this;
	},
	
	vlcvSelectedItem: function(contentView, item)
	{
		this.updateButtons();
		this.delegatePerform("vlvSelectedItem", item);
	},
	
	vlcvRemovedItem: function(contentView, item)
	{
		this.updateButtons();
		this.delegatePerform("removedItem", item);
	},
	
	selectFirstItem: function()
	{
		var vlcv = this.scrollView().contentView();
		var item = vlcv.items().first();
		if (item)
		{
			vlcv.selectItem(item);
		}
	},
	
	selectLastItem: function()
	{
		var vlcv = this.vlcv();
		vlcv.selectItem(vlcv.items().last());
		this.scrollView().scrollToBottom();
	},
	
	selectItemWithTitle: function(title)
	{
		var vlcv = this.scrollView().contentView();
		var item = vlcv.items().detect(function(item){ return item.label().text() == title });
		if (item)
		{
			vlcv.selectItem(item);
		}
	},
	
	cancelAdd: function()
	{
		this.addButton().setHidden(false);
		this.scrollView().contentView().removeLastItem();
	},
	
	isEmpty: function()
	{
		return this.vlcv().items().length == 0;
	},
	
	empty: function()
	{
		this.vlcv().removeAllSubviews();
		this.vlcv().setWidth(0);
		this.vlcv().setHeight(0);
		this.scrollView().scrollToTop();
	}
});

dm.ImageView = dm.View.clone().newSlots({
	type: "vx.ImageView",
	loadState: "init",
	url: null,
	elementName: "img"
}).setSlots({
	initElement: function()
	{
		dm.View.initElement.call(this);
		
		var e = this.element();
		var self = this;
		e.onload = function()
		{
			self.loaded();
		}
	},
	
	setUrl: function(url)
	{
		this._url = url;
		this.element().src = url;
		return this;
	},
	
	loaded: function()
	{
		this.setLoadState("load");
		this.delegatePerform("loaded");
	},

	hasLoaded: function()
	{
		return this.loadState() == "load";
	},
	
	sizeToFit: function()
	{
		return this.setWidth(this.naturalWidth()).setHeight(this.naturalHeight());
	},
	
	naturalWidth: function()
	{
		return this.element().naturalWidth;
	},
	
	naturalHeight: function()
	{
		return this.element().naturalHeight;
	},
	
	naturalSize: function()
	{
		return dm.Point.withXY(this.naturalWidth(), this.naturalHeight());
	}
});
dm.BorderedButton = dm.Button.clone().newSlots({
	type: "dm.BorderedButton",
	borderImageUrl: null,
	borderImage: null,
	leftBorderWidth: 0,
	rightBorderWidth: 0,
	topBorderWidth: 0,
	bottomBorderWidth: 0,
}).setSlots({
	setBorderImageUrl: function(borderImageUrl)
	{
		var borderImage = new Image();
		borderImage.src = borderImageUrl; //start loading it
		this.setBorderImage(borderImage);
		
		this._borderImageUrl = borderImageUrl;
		this.updateStyle();
		return this;
	},
	
	setLeftBorderWidth: function(w)
	{
		this._leftBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setRightBorderWidth: function(w)
	{
		this._rightBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setTopBorderWidth: function(w)
	{
		this._topBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setBottomBorderWidth: function(w)
	{
		this._bottomBorderWidth = w;
		this.updateStyle();
		return this;
	},
	
	setWidth: function(w)
	{
		this.setCssWidth(w);
		this.updateStyle();
		return this;
	},
	
	setHeight: function(h)
	{
		this.setCssHeight(h);
		this.updateStyle();
		return this;
	},
	
	sizeWidthToFit: function()
	{
		dm.Button.sizeWidthToFit.call(this);
		w = this.width() + Math.max(this.leftBorderWidth() + this.rightBorderWidth(), 2*this.fontSize());
		this.setWidth(w);
	},
	
	updateStyle: function()
	{
		var style = this.element().style;
		var widths = [this.topBorderWidth(), this.rightBorderWidth(), this.bottomBorderWidth(), this.leftBorderWidth()];
		style.webkitBorderImage = "url(" + this.borderImageUrl() + ") " + widths.join(" ");
		widths = widths.map(function(w){ return w + "px"  });
		style.borderWidth = widths.join(" ");
		style.width = (this.width() - this.leftBorderWidth() - this.rightBorderWidth()) + "px";
		var h = (this.height() - this.topBorderWidth() - this.bottomBorderWidth());
		style.height = h + "px";
		style.lineHeight = h + "px";
	}
});
dm.ImageButton = dm.Button.clone().newSlots({
	type: "dm.ImageButton",
	imageUrl: null,
	imageView: null
}).setSlots({
	init: function()
	{
		dm.Button.init.call(this);
		
		this.setWidth(3);
		this.setHeight(3);
		
		var iv = dm.ImageView.clone();
		iv.setDelegate(this);
		iv.setDelegatePrefix("imageView");
		iv.setWidth(3);
		iv.setHeight(3);
		iv.resizeToFill();
		this.setImageView(iv);
		this.addSubview(iv);
	},
	
	setImageUrl: function(imageUrl)
	{
		this.imageView().setUrl(imageUrl);
	},
	
	imageViewLoaded: function()
	{
		this.delegatePerform("loaded");
	},
	
	sizeToFit: function()
	{
		this.setSize(this.imageView().naturalSize());
		this.imageView().setSize(this.imageView().naturalSize());
		return this;
	}
});
dm.VideoView = dm.View.clone().newSlots({
	type: "dm.VideoView",
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
		dm.View.initElement.call(this);
		
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
		this.element().load();
	},
	
	play: function()
	{
		this.element().play();
	},
	
	pause: function()
	{
		this.element().pause();
	},
	
	mute: function()
	{
		this.element().muted = true;
	},
	
	scaling: function()
	{
		return this.width() / this.nativeWidth();
	}
});
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
dm.Editable = dm.Delegator.clone().newSlots({
	type: "dm.Editable",
	watchesSlots: true,
	editableSlotDescriptions: [],
	editableSlots: null
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		this.setEditableSlotDescriptions(this.editableSlotDescriptions().copy());
	},
	
	newEditableSlots: function()
	{
		var self = this;
		dm.Arguments_asArray(arguments).forEach(function(description){
			self.editableSlotDescriptions().append(description);
			
			self.newSlot(description.name, description.value);
			
			self["set" + description.name.asCapitalized()] = function(newValue)
			{
				var oldValue = this["_" + description.name];
				if (oldValue != newValue)
				{
					this["_" + description.name] = newValue;
					if (this.watchesSlots())
					{
						this.delegatePerform("slotChanged", description.name, oldValue, newValue);
					}
				}

				return this;
			}
		});
		
		return this;
	},
	
	editableSlots: function()
	{
		if (!this._editableSlots)
		{
			this._editableSlots = [];
			var self = this;
			this.editableSlotDescriptions().forEach(function(description){
				var editableSlot = dm.Object_lookupPath(window, "dm.Editable" + description.control.type.asCapitalized() + "Slot").clone();
				var control = dm.Object_shallowCopy(description.control);
				delete control.type;
				editableSlot.control().performSets(control);
				editableSlot.setName(description.name);
				editableSlot.setNormalizer(description.normalizer);
				editableSlot.setObject(self);
				if (description.label)
				{
					editableSlot.label().performSets(description.label).sizeToFit();
				}
				self._editableSlots.append(editableSlot);
			});
		}
		
		return this._editableSlots;
	},
	
	asObject: function()
	{
		var obj = {};
		this.editableSlots().forEach(function(s){
			obj[s.name()] = s.value();
		});
		return obj;
	},
	
	asJson: function()
	{
		return JSON.stringify(this.asObject());
	}
});

dm.EditableSlot = dm.Proto.clone().newSlots({
	type: "dm.EditableSlot",
	object: null,
	name: null,
	normalizer: null,
	label: null,
	labelText: null,
	control: null,
	slotEditorView: null,
	controlProto: null,
	controlWidth: 200
}).setSlots({
	label: function()
	{
		if (!this._label)
		{
			var l = dm.Label.clone();
			l.setText(this.name().humanized());
			l.sizeToFit();
			this._label = l;
		}
		return this._label;
	},
	
	control: function()
	{
		if (!this._control)
		{
			var c = this.controlProto().clone();
			c.setDelegate(this);
			this._control = c;
		}
		return this._control;
	},
	
	updateValue: function()
	{
		var v = this.control().value();
		var normalizer = this.normalizer() || function(v){ return v };
		try
		{
			v = normalizer(v);
		}
		catch (e)
		{
			console.log(e);
		}
		
		this.object().perform("set" + this.name().asCapitalized(), v)
	},
	
	value: function()
	{
		return this.object().perform(this.name())
	},
	
	addTo: function(slotEditorView)
	{
		var row = this.object().editableSlots().indexOf(this);
		slotEditorView.addAtRowCol(this.label(), row, 0);
		this.control().setValue(this.value());
		if (this.controlWidth())
		{
			this.control().setWidth(this.controlWidth());
		}
		else
		{
			this.control().sizeWidthToFit();
		}
		this.control().sizeHeightToFit();
		
		slotEditorView.addAtRowCol(this.control(), row, 1);
		this.setSlotEditorView(slotEditorView);
	}
});

dm.EditableCheckBoxSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableCheckBoxSlot",
	controlProto: dm.CheckBox,
	controlWidth: 0 //sizeToFit
}).setSlots({
	checkBoxChanged: function(dd)
	{
		this.updateValue();
	}
});

dm.EditableDropDownSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableDropDownSlot",
	controlProto: dm.DropDown
}).setSlots({
	dropDownChanged: function(dd)
	{
		this.updateValue();
	}
});

dm.EditableTextFieldSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableTextFieldSlot",
	controlProto: dm.TextField
}).setSlots({
	textFieldChanged: function(tf)
	{
		if (this.slotEditorView())
		{
			this.slotEditorView().applyLayout();
		}
	},
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	}
});

dm.EditableTextAreaSlot = dm.EditableSlot.clone().newSlots({
	type: "dm.EditableTextAreaSlot",
	controlProto: dm.TextArea
}).setSlots({
	textAreaEditingEnded: function(tf)
	{
		this.updateValue();
	}
});

dm.SlotEditorView = dm.TableView.clone().newSlots({
	type: "dm.SlotEditorView",
	object: null
}).setSlots({
	init: function()
	{
		dm.TableView.init.call(this);
		
		this.alignCol(0, dm.TableView.ColAlignmentRight);
		this.alignCol(1, dm.TableView.ColAlignmentLeft);
	},
	
	setObject: function(object)
	{
		this.empty();
		if (object)
		{
			this._object = object;

			var self = this;
			object.editableSlots().forEach(function(editableSlot){
				editableSlot.addTo(self);
			});
		}
	},
	
	midX: function()
	{
		return this.colWidth(0) + this.hMargin() + this.hMargin()/2;
	}
});

dm.HttpResponse = dm.Proto.clone().newSlots({
	type: "dm.HttpResponse",
	body: null,
	statusCode: null
}).setSlots({
	isSuccess: function()
	{
		var sc = this.statusCode();
		return sc >= 200 && sc < 300;
	}
});

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

dm.App = dm.Delegator.clone().newSlots({
	type: "dm.App"
}).setSlots({
	init: function()
	{
		dm.Delegator.init.call(this);
		
		dm.Window.setDelegate(this);
	},
	
	windowInited: function()
	{
		this.start();
		this.delegatePerform("started");
	}
});