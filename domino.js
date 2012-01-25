Object_clone = function(obj)
{
	Proto_constructor.prototype = obj;
	return new Proto_constructor;
}

Object_shallowCopy = function(obj)
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

Arguments_asArray = function(args)
{
	return Array.prototype.slice.call(args);
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

Proto = new Object;

Proto.setSlot = function(name, value)
{
	this[name] = value;

	return this;
};

Proto.uniqueIdCounter = 0;

Proto.setSlots = function(slots)
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

Proto_constructor = new Function;

Proto.setSlots(
{
	constructor: new Function,

	clone: function()
	{
		Proto_constructor.prototype = this;
	
		var obj = new Proto_constructor;
		obj._proto = this;
		obj._uniqueId = ++ Proto.uniqueIdCounter;
		if(obj.init)
			obj.init();
		return obj;
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
	
	/* figure this out later
	superPerform: function(messageName)
	{
		if (!this._proto)
		{
			return undefined;
		}
		
		var proto = this._proto;
		
		var myFn = this[messageName];
		while(proto && (myFn == proto[messageName]))
		{
			proto = proto._proto;
		}
		
		var fn = proto[messageName];
		if (proto && fn && typeof(fn) == "function")
		{
			if (!window.logged)
			{
				logged = true;
				console.log(this[messageName]);
				console.log(proto[messageName]);
			}
			var args = Arguments_asArray(arguments);
			args.removeFirst();
			return proto[messageName].apply(this, args); 
		}
		else
		{
			return undefined;
		}
	}
	*/
});

Proto.newSlot("type", "Proto");
Proto.newSlot("sender", null);
Proto.removeSlot = Proto.removeSlots;
Browser = Proto.clone().setSlots(
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

(function(){
	for(var slotName in Proto)
	{
		[Array, String, Number, Date].forEach(function(contructorFunction)
		{
			if(contructorFunction == Array && slotName == "clone" && Browser.isInternetExplorer())
			{
				contructorFunction.prototype[slotName] = function(){ throw new Error("You can't clone an Array proto in IE yet.") };
			}
			else
			{
				contructorFunction.prototype[slotName] = Proto[slotName];
			}
			contructorFunction.clone = function()
			{
				return new contructorFunction;
			}
		});
	}
})();

Importer = Proto.clone().setType("Importer").newSlots({
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
		this.splice(i, 1, obj);
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

	last: function()
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

Number.prototype.setSlots(
{
	cssString: function() 
	{
		return this.toString();
	},

	milliseconds: function()
	{
		return this;
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
Color = Proto.clone().newSlots({
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
	}
});

Color.setSlots({
	Transparent: Color.clone().setAlpha(0),
	White: Color.clone().setRed(1).setGreen(1).setBlue(1),
	LightGray: Color.clone().setRed(212/255).setGreen(212/255).setBlue(212/255),
	Gray: Color.clone().setRed(127/255).setGreen(127/255).setBlue(127/255),
	DimGray: Color.clone().setRed(105/255).setGreen(105/255).setBlue(105/255),
	Black: Color.clone(),
});

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
//console.log(messageName);
			if (d && d.canPerform(messageName))
			{
				return d.performWithArgList(messageName, args);
			}
		}
	}
});

StyleSlot = Proto.clone().newSlots({
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

ColorTransformation = Proto.clone().setSlots({
	apply: function(color)
	{
		return "rgba(" + [color.red()*255, color.green()*255, color.blue()*255, color.alpha()].join(",") + ")";
	}
});

SuffixTransformation = Proto.clone().setSlots({
	apply: function(value)
	{
		return value + this.suffix;
	}
});

RoundedSuffixTransformation = Proto.clone().setSlots({
	apply: function(value)
	{
		return Math.round(value) + this.suffix;
	}
});

View = Delegator.clone().newSlots({
	type: "View",
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
		var s = StyleSlot.clone();
		s.setView(this);
		s.setName(name);
		s.setStyleName(p.name || name);
		s.setValue(p.value);
		if (p.transformation)
		{
			var proto = window[p.transformation.name.asCapitalized() + "Transformation"];
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
	cssWidth: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	cssHeight: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	backgroundColor: { value: Color.Transparent, transformation: { name: "color" } },
	visibility: { value: "visible" },
	zIndex: { value: 0 }
});

View.setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		this.setEventListeners({});
		this.setStyleSlots(this.styleSlots().copy());
		this.createElement();
		this.initElement();
		this.setSubviews(this.subviews().copy());
	},

	createElement: function()
	{
		var e = document.createElement(this.elementName());
		e.style.position = "absolute";
		e.style.overflow = "hidden";
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
				
				self.delegatePerform("mouseEntered", Window.viewWithElement(e.fromElement));
			}
			e.onmouseout = function(e)
			{
				if ((self.element() == e.toElement) || self.detectAncestorView(function(v){ return v.element() == e.toElement }))
				{
					return;
				}

				self.delegatePerform("mouseExited", Window.viewWithElement(e.toElement));
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
		return this.cssWidth();
	},
	
	setWidth: function(w)
	{
		var lastWidth = this.width();
		this.setCssWidth(w);
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
		
		return this;
	},
	
	height: function()
	{
		return this.cssHeight();
	},
	
	setHeight: function(h)
	{
		var lastHeight = this.height();
		this.setCssHeight(h);
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
		
		return this;
	},
	
	isLandscape: function()
	{
		return this.width() > this.height();
	},
	
	setHidden: function(hidden)
	{
		this.setVisibility(hidden ? "hidden" : "visible");
		this.subviews().forEachPerform("setVisibility", this.visibility());
	},
	
	hidden: function()
	{
		return this.visibility() == "hidden";
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
	},
	
	addSubviews: function()
	{
		var self = this;
		Arguments_asArray(arguments).forEach(function(view){
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
	
	alignRightTo: function(view)
	{
		this.setX(view.rightEdge() - this.width() - 1);
	},
	
	centerXOver: function(view)
	{
		this.setX(view.x() + (view.width() - this.width())/2);
	},
	
	centerYOver: function(view)
	{
		this.setY(view.y() + (view.height() - this.height())/2);
	},
	
	centerOver: function(view)
	{
		this.centerXOver(view);
		this.centerYOver(view);
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
		var s = this.superview();
		if (s)
		{
			this.setY((s.height() - this.height())/2);
		}
	},
	
	moveToBottom: function(margin)
	{
		margin = margin || 0;
		
		this.setY(this.superview().height() - this.height() - margin);
	},
	
	moveDown: function(y)
	{
		return this.setY(this.y() + y);
	},
	
	moveUp: function(y)
	{
		return this.setY(this.y() - y);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
		if (!this.autoResizes())
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
		if (!this.autoResizes())
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
	},
	
	scaleToFitSuperview: function()
	{
		var superview = this.superview();
		var aspectRatio = this.width() / this.height();

		if(aspectRatio > superview.width()/superview.height())
		{
			this.setWidth(superview.width());
			this.setHeight(superview.width() / aspectRatio);
		}
		else
		{
			this.setWidth(superview.height() * aspectRatio);
			this.setHeight(superview.height());
		}
	},
	
	sizingElement: function()
	{
		var e = this.element().cloneNode(true);
		var s = e.style;
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
		this.setWidth(e.offsetWidth);
		document.body.removeChild(e);
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.offsetHeight);
		document.body.removeChild(e);
	},
	
	sizeToFit: function()
	{
		this.sizeWidthToFit();
		this.sizeHeightToFit();
	},
	
	moveToBack: function()
	{
		this.setZIndex(this.superview().subviews().mapPerform("zIndex").min() - 1);
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
				clearInterval(interval);
				self.hide();
				self.element().style.opacity = initialOpacity;
			}
		}, 1000/60);
	}
});

Window = View.clone().newSlots({
	type: "Window",
	lastResizeWidth: null,
	lastResizeHeight: null,
	inited: false
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		document.body.innerHTML = "";
		
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
		
		window.onresize = function()
		{
			Window.autoResize();
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
		var self = this;
		this._resizeTimer = setInterval(function(){
			if (self.width() != self.lastResizeWidth() || self.height() != self.lastResizeHeight())
			{
				self.autoResize();
			}
		}, 200);
	},
	
	createElement: function()
	{
		this.setElement(document.body);
	},

	initElement: function()
	{
	},
	
	width: function()
	{
		return window.innerWidth; //document.body isn't reliable on mobile
		//return this.element().clientWidth;
	},
	
	height: function()
	{
		return window.innerHeight; //document.body isn't reliable on mobile
		//return this.element().clientHeight;
	},
	
	autoResize: function()
	{
		this.subviews().forEachPerform("autoResize", this.lastResizeWidth(), this.lastResizeHeight());
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
	}
});

window.addEventListener("load", function(){
	Window.init();
});

Label = View.clone().newSlots({
	type: "Label",
	text: null
}).newStyleSlots({
	fontFamily: { value: "Helvetica, Arial, sans-serif" },
	fontSize: { value: 15, transformation: { name: "suffix", suffix: "px" } },
	fontWeight: { value: "normal" },
	textDecoration: { value: "none" },
	color: { value: Color.Black, transformation: { name: "color" } },
	textOverflow: { value: "ellipsis" },
	whiteSpace: { value: "pre" },
	textAlign: { value: "left" },
	lineHeight: { value: "" }
}).setSlots({
	setText: function(text)
	{
		this._text = text;
		this.element().innerText = text;
	}
});

TextField = Label.clone().newSlots({
	type: "TextField",
	elementName: "input",
	placeholderText: "Enter Text",
	placeholderTextColor: Color.Gray,
	growsToFit: true
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var e = this.element();
		
		e.style.margin = "";
		e.style.padding = "";
		
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
		//e.style = window.getComputedStyle(this.element());
		var myStyle = window.getComputedStyle(this.element());
		for (var i = myStyle.length - 1; i > -1; i --)
		{
		    var name = myStyle[i];
		    e.style.setProperty(name, myStyle.getPropertyValue(name));
		}

		e.style.position = "fixed";
		e.style.width = "";
		e.style.height = "";
		e.style.top = screen.height + "px";
		if (this.text() == "")
		{
			e.innerText = this.placeholderText();
		}
		else
		{
			e.innerText = this.text()
		}
		document.body.appendChild(e);
		return e;
	},
	
	sizeWidthToFit: function()
	{
		View.sizeWidthToFit.call(this);
		this.setWidth(this.width() + 2);
		return this;
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
				self.delegatePerform("changed");
			}
		});
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

TextArea = Label.clone().newSlots({
	type: "TextArea",
	elementName: "textarea"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
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

Button = Label.clone().newSlots({
	type: "Button"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		this.setTextAlign("center");
		
		var self = this;
		var e = this.element();
		e.onclick = function()
		{
			self.delegatePerform("clicked");
		}
		e.style.cursor = "pointer";
	},
	
	simulateClick: function()
	{
		var clickEvent = document.createEvent("MouseEvents");
		clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		this.element().dispatchEvent(clickEvent);
	}
});

CheckBox = View.clone().newSlots({
	type: "CheckBox",
	elementName: "input",
	checked: false
}).setSlots({
	init: function()
	{
		View.init.call(this);
		this.sizeToFit();
	},
	
	initElement: function()
	{
		View.initElement.call(this);
		
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
	
	sizeToFit: function()
	{
		View.sizeToFit.call(this);
		this.setWidth(this.width() + 2);
		this.setHeight(this.height() + 2);
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

DropDown = View.clone().newSlots({
	type: "DropDown",
	elementName: "select",
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
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

ScrollView = View.clone().newSlots({
	type: "ScrollView",
	contentView: null
}).setSlots({
	init: function()
	{
		View.init.call(this);
		this.setContentView(View.clone());
	},
	
	initElement: function()
	{
		View.initElement.call(this);
		
		this.element().style.overflow = "auto";
	},
	
	setContentView: function(contentView)
	{
		this.removeSubview(this._contentView);
		this.addSubview(contentView);
		this._contentView = contentView;
		return this;
	},
	
	scrollToBottom: function()
	{
		this.element().scrollTop = this.contentView().height() - this.height();
	}
});

TitledView = View.clone().newSlots({
	type: "TitledView",
	title: "",
	titleBar: null,
	contentView: null
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		if (Window.inited())
		{
			var l = Label.clone();
			l.setText("Title Bar");
			l.sizeToFit();
			l.resizeCentered();

			var tb = View.clone();
			tb.setBackgroundColor(Color.LightGray);
			tb.setWidth(l.width() + l.fontSize());
			tb.setHeight(l.height() + l.fontSize());
			tb.setResizesWidth(true);
			tb.addSubview(l);
			tb.newSlot("label", l);

			l.center();
			this.setTitleBar(tb);

			var cv = View.clone();
			cv.setWidth(tb.width());
			cv.setHeight(1);
			cv.setY(tb.height());
			cv.setResizesWidth(true);
			cv.setResizesHeight(true);
			this.setContentView(cv);

			this.setWidth(tb.width());
			this.setHeight(tb.height() + cv.height());

			var tbDivider = View.clone();
			tbDivider.setBackgroundColor(Color.Gray);
			tbDivider.setY(tb.height());
			tbDivider.setWidth(tb.width());
			tbDivider.setHeight(1);
			tbDivider.setResizesWidth(true);

			var rightDivider = View.clone();
			rightDivider.setBackgroundColor(Color.Gray);
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

TableView = View.clone().newSlots({
	type: "TableView",
	rows: [],
	vMargin: 8,
	hMargin: 10,
	colAlignments: [],
	rowAlignments: []
}).setSlots({
	init: function()
	{
		View.init.call(this);
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
		return this.rows().map(function(r){ return (r && r.length) || 0 }).max();
	},
	
	colWidth: function(col)
	{
		return this.rows().map(function(r){ return (r[col] || View.clone()).width() }).max();
	},
	
	rowCount: function()
	{
		return this.rows().length;
	},
	
	rowHeight: function(row)
	{
		var h = this.rows()[row].map(function(view){ return (view || View.clone()).height() }).max();
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
					
					if (colAlignment == TableView.ColAlignmentLeft)
					{
						v.setX(leftEdge);
					}
					else if(colAlignment == TableView.ColAlignmentCenter)
					{
						v.setX(leftEdge + (this.colWidth(c) - v.width())/2);
					}
					else
					{
						v.setX(leftEdge + this.colWidth(c) - v.width());
					}
					
					var topEdge = this.vMargin() + r*this.vMargin() + r.map(function(r){ return self.rowHeight(r) }).sum();
					if (rowAlignment == TableView.RowAlignmentTop)
					{
						v.setY(topEdge);
					}
					else if(rowAlignment == TableView.RowAlignmentMiddle)
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
	}
});

TableView.newSlots({
	defaultColAlignment: TableView.ColAlignmentCenter,
	defaultRowAlignment: TableView.RowAlignmentMiddle
});
VerticalListContentView = View.clone().newSlots({
	type: "VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15,
	confirmsRemove: true,
	closeButton: null,
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		this.setItems(this.items().copy());
		
		if(Window.inited())
		{
			var closeButton = ImageButton.clone().newSlot("itemView", null);
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
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		
		var itemView = Button.clone().newSlots({
			type: "ItemView",
			label: null
		}).clone();
		itemView.setTracksMouse(true);
		itemView.setDelegate(this);
		itemView.setWidth(this.width());
		itemView.setResizesWidth(true);
		
		var label = Label.clone();
		itemView.setLabel(label);
		label.setColor(Color.Gray);
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
				l.setColor(Color.Gray);
				l.setFontWeight("normal");
			}
		}

		var l = button.label();
		l.setColor(Color.Black);
		l.setFontWeight("bold");
		
		this.setSelectedItemIndex(this.items().indexOf(button));

		this.delegatePerform("selectedItem", button);
	},
	
	addItem: function(itemView)
	{
		var hMargin = VerticalListContentView.itemHMargin();
		
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

VerticalListView = TitledView.clone().newSlots({
	type: "VerticalListView",
	scrollView: null,
	controlsView: null,
	addButton: null,
	defaultItemText: "New Item"
}).setSlots({
	init: function()
	{
		TitledView.init.call(this);
		
		if (Window.inited())
		{
			var addButton = Button.clone();
			addButton.setFontWeight("bold");
			addButton.setText("+");
			addButton.setColor(Color.DimGray);
			addButton.sizeToFit();
			addButton.setX(addButton.fontSize());
			addButton.setY(addButton.fontSize()/2);
			addButton.setDelegate(this, "addButton").setDelegatePrefix("addButton");
			this.setAddButton(addButton);
		
			var selfWidth = Math.max(addButton.width() + addButton.fontSize(), this.titleBar().width());
		
			var contentView = VerticalListContentView.clone();
			contentView.setWidth(selfWidth);
			contentView.setResizesWidth(true);
			contentView.setDelegate(this);
			contentView.setDelegatePrefix("vlcv");
		
			var scrollView = ScrollView.clone();
			scrollView.setWidth(selfWidth);
			scrollView.setHeight(1);
			scrollView.setResizesHeight(true);
			scrollView.setResizesWidth(true);
			scrollView.setContentView(contentView);
			this.setScrollView(scrollView);
		
			var controlsView = View.clone();
			controlsView.setBackgroundColor(Color.LightGray);
			controlsView.setY(scrollView.height());
			controlsView.setWidth(selfWidth);
			controlsView.setHeight(addButton.height() + 0.5*addButton.fontSize());
			controlsView.setResizesWidth(true);
			controlsView.setResizesTop(true);
		
			this.setControlsView(controlsView);
		
			var controlsDivider = View.clone();
			controlsDivider.setBackgroundColor(Color.Gray);
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
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		var textField = TextField.clone();
		textField.setText(this.defaultItemText());
		textField.setWidth(this.width() - 2*hMargin);
		textField.sizeHeightToFit();
		textField.setX(hMargin);
		textField.setDelegate(this);
		
		var itemView = View.clone();
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
		TitledView.setHeight.call(this, h);
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
	}
});

ImageView = View.clone().newSlots({
	type: "ImageView",
	url: null,
	elementName: "img"
}).setSlots({
	setUrl: function(url)
	{
		this._url = url;
		this.element().src = url;
		return this;
	}
});
BorderedButton = Button.clone().newSlots({
	type: "BorderedButton",
	borderImageUrl: null,
	leftBorderWidth: 0,
	rightBorderWidth: 0,
	topBorderWidth: 0,
	bottomBorderWidth: 0
}).setSlots({
	setBorderImageUrl: function(borderImageUrl)
	{
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
		Button.sizeWidthToFit.call(this);
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
ImageButton = Button.clone().newSlots({
	type: "ImageButton",
	imageUrl: null,
	imageView: null
}).setSlots({
	init: function()
	{
		Button.init.call(this);
		
		this.setWidth(3);
		this.setHeight(3);
		
		var iv = ImageView.clone();
		iv.setWidth(3);
		iv.setHeight(3);
		iv.resizeToFill();
		this.setImageView(iv);
		this.addSubview(iv);
	},
	
	setImageUrl: function(imageUrl)
	{
		this.imageView().setUrl(imageUrl);
	}
});
VideoView = View.clone().newSlots({
	type: "VideoView",
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
		View.initElement.call(this);
		
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
		//this.setInline(this.inline());
		this.element().load();
	},
	
	play: function()
	{
		//this.setInline(this.inline()); //hack - o.w. it doesn't always play inline on mobile :-/
		this.element().play();
	},
	
	pause: function()
	{
		this.element().pause();
	},
	
	mute: function()
	{
		this.element().muted = true;
	}
});
Editable = Delegator.clone().newSlots({
	type: "Editable",
	watchesSlots: true,
	editableSlotDescriptions: [],
	editableSlots: null
}).setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		this.setEditableSlotDescriptions(this.editableSlotDescriptions().copy());
	},
	
	newEditableSlots: function()
	{
		var self = this;
		Arguments_asArray(arguments).forEach(function(description){
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
						this.conditionallyPerform("slotChanged", description.name, oldValue, newValue);
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
				var editableSlot = window["Editable" + description.control.type.asCapitalized() + "Slot"].clone();
				var control = Object_shallowCopy(description.control);
				delete control.type;
				editableSlot.control().performSets(control);
				editableSlot.setName(description.name);
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

EditableSlot = Proto.clone().newSlots({
	type: "EditableSlot",
	object: null,
	name: null,
	label: null,
	labelText: null,
	control: null,
	slotEditorView: null,
	controlProto: null
}).setSlots({
	label: function()
	{
		if (!this._label)
		{
			var l = Label.clone();
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
	
	updateValue: function(v)
	{
		this.object().perform("set" + this.name().asCapitalized(), this.control().value());
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
		this.control().sizeToFit();
		slotEditorView.addAtRowCol(this.control(), row, 1);
		this.setSlotEditorView(slotEditorView);
	}
});

EditableCheckBoxSlot = EditableSlot.clone().newSlots({
	type: "EditableCheckBoxSlot",
	controlProto: CheckBox
}).setSlots({
	checkBoxChanged: function(dd)
	{
		this.updateValue();
	}
});

EditableDropDownSlot = EditableSlot.clone().newSlots({
	type: "EditableDropDownSlot",
	controlProto: DropDown
}).setSlots({
	dropDownChanged: function(dd)
	{
		this.updateValue();
	}
});

EditableTextFieldSlot = EditableSlot.clone().newSlots({
	type: "EditableTextFieldSlot",
	controlProto: TextField
}).setSlots({
	textFieldChanged: function(tf)
	{
		this.slotEditorView().applyLayout();
	},
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	}
});

EditableTextAreaSlot = EditableSlot.clone().newSlots({
	type: "EditableTextAreaSlot",
	controlProto: TextArea
}).setSlots({
	textAreaEditingEnded: function(tf)
	{
		this.updateValue();
	}
});

SlotEditorView = TableView.clone().newSlots({
	type: "SlotEditorView",
	object: null
}).setSlots({
	init: function()
	{
		TableView.init.call(this);
		
		this.alignCol(0, TableView.ColAlignmentRight);
		this.alignCol(1, TableView.ColAlignmentLeft);
	},
	
	setObject: function(object)
	{
		if (!object)
		{
			this.empty();
		}
		else
		{
			this._object = object;

			this.empty();

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

HttpResponse = Proto.clone().newSlots({
	type: "HttpResponse",
	body: null,
	statusCode: null
}).setSlots({
	isSuccess: function()
	{
		var sc = this.statusCode();
		return sc >= 200 && sc < 300;
	}
});

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
		Delegator.init.call(this);
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
				
				self.delegatePerform("completed");
			}
		}
		xhr.send(this.body());
	}
});

App = Delegator.clone().newSlots({
	type: "App"
}).setSlots({
	init: function()
	{
		Delegator.init.call(this);
		
		Window.setDelegate(this);
	},
	
	windowInited: function()
	{
		this.start();
		this.delegatePerform("started");
	}
});