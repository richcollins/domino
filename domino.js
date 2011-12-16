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
	
		for(slotName in slotsMap)
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
	}
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
	basePath: null
})
.setSlots(
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
			
			document.write('<script src="' + path + '"></script>');
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

	pushIfAbsent: function()
	{
		console.log("pushIfAbsent is deprecated.  Use appendIfAbsent instead.");
		return this.appendIfAbsent.apply(this, arguments);
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

	sortByCalling: function(functionName)
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

	mapByCalling: function()
	{
		console.log("mapByCalling is deprecated.  Use mapByPerforming instead.");
		return this.mapByPerforming.apply(this, arguments);
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

	detectByCalling: function()
	{
		console.log("detectByCalling is deprecated.  Use detectByPerforming instead.");
		return this.detectByPerforming.apply(this, arguments);
	},

	detectByPerforming: function(functionName)
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

	filterByPerforming: function(messageName)
	{
		var args = this.argsAsArray(arguments).slice(1);
		args.push(0);
		return this.filter(function(e, i)
		{
			args[args.length - 1] = i;
			return e[messageName].apply(e, args);
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

	elementWith: function(accessorFunctionName, value)
	{
		var e = this[this.mapPerform(accessorFunctionName).indexOf(value)];
		return e === undefined ? null : e;
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
		//console.log("index = " + i + " " + this[i] )
		if(this[i] != undefined) { return this[i]; }
		return null;
	},

	itemBefore: function(v)
	{
		var i = this.indexOf(v);
		if(i == -1) return null;
		i = i - 1;
		if(i < 0) return null;
		//console.log("index = " + i + " " + this[i] )
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
		if(index == -1) return this;
		return this.slice(0, index); 
	},

	after: function(aString)
	{
		var index = this.indexOf(aString);
		if(index == -1) return this;
		return this.slice(index+1);
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
	}
});
Color = Proto.clone().newSlots({
	red: 0,
	green: 0,
	blue: 0,
	alpha: 1
}).setSlots({
	withRGB: function(r, g, b)
	{
		var c = this.clone();
		c.setRed(r);
		c.setGreen(g);
		c.setBlue(b);
		return c;
	}
});

Color.setSlots({
	Transparent: Color.clone().setAlpha(0),
	White: Color.clone().setRed(255).setGreen(255).setBlue(255),
	LightGray: Color.clone().setRed(212).setGreen(212).setBlue(212),
	//DarkGray: Color.clone().setRed(168).setGreen(168).setBlue(168),
	Gray: Color.clone().setRed(127).setGreen(127).setBlue(127),
	DimGray: Color.clone().setRed(105).setGreen(105).setBlue(105),
	Black: Color.clone(),
});
Delegator = Proto.clone().newSlots({
	type: "Delegator",
	delegate: null,
	messagesDelegate: true
}).setSlots({
	delegatePerform: function(message)
	{
		if (this.messagesDelegate())
		{
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
		}
		view["_" + name] = value;
		
		view.styleSlots().append(this);
	}
});
ColorTransformation = Proto.clone().setSlots({
	apply: function(color)
	{
		return "rgba(" + [color.red(), color.green(), color.blue(), color.alpha()].join(",") + ")";
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
	resizesLeft: false,
	resizesRight: false,
	resizesWidth: false,
	resizesTop: false,
	resizesBottom: false,
	resizesHeight: false,
	styleSlots: []
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
	width: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	height: { value: 0, transformation: { name: "roundedSuffix", suffix: "px" } },
	backgroundColor: { value: Color.Transparent, transformation: { name: "color" } },
	visibility: "visible"
});

View.setSlots({
	init: function()
	{
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

	initElement: function()
	{
		var self = this;
		this.styleSlots().forEach(function(ss){
			self.perform("set" + ss.name().asCapitalized(), self.perform(ss.name()));
		});
	},
	
	setHidden: function(hidden)
	{
		this.setVisibility(hidden ? "hidden" : "visible");
	},
	
	hidden: function()
	{
		return this.visibility() == "hidden";
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
	
	removeAllSubviews: function()
	{
		var self = this;
		this.subviews().copy().forEach(function(sv){
			self.removeSubview(sv);
		});
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
		this.setX(view.rightEdge() + margin);
	},
	
	moveBelow: function(view, margin)
	{
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
	
	_setWidth: View.setWidth,
	
	setWidth: function(newWidth)
	{
		var lastWidth = this.width();
		this._setWidth(newWidth);
		this.subviews().forEachPerform("autoResizeWidth", lastWidth);
	},
	
	autoResizeWidth: function(lastSuperWidth)
	{
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
	
	_setHeight: View.setHeight,
	
	setHeight: function(newHeight)
	{
		var lastHeight = this.height();
		this._setHeight(newHeight);
		this.subviews().forEachPerform("autoResizeHeight", lastHeight);
	},
	
	autoResizeHeight: function(lastSuperHeight)
	{
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
		this.resizeCenteredHorizontally(true);
		this.resizeCenteredVertically(true);
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
		this.setWidth(e.clientWidth);
		document.body.removeChild(e);
	},
	
	sizeHeightToFit: function()
	{
		var e = this.sizingElement();
		var s = e.style;
		s.width = this.width() + "px";
		this.setHeight(e.clientHeight);
		document.body.removeChild(e);
	},
	
	sizeToFit: function()
	{
		this.sizeWidthToFit();
		this.sizeHeightToFit();
	}
});
Window = View.clone().newSlots({
	type: "Window",
	lastResizeWidth: null,
	lastResizeHeight: null
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
		return this.element().clientWidth;
	},
	
	height: function()
	{
		return this.element().clientHeight;
	},
	
	autoResize: function()
	{
		this.subviews().forEachPerform("autoResize", this.lastResizeWidth(), this.lastResizeHeight());
		this.setLastResizeWidth(this.width());
		this.setLastResizeHeight(this.height());
	}
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
	whiteSpace: { value: "pre" }
}).setSlots({
	setText: function(text)
	{
		this._text = text;
		this.element().innerText = text;
	}
});
TextField = Label.clone().newSlots({
	type: "TextField"
}).setSlots({
	initElement: function()
	{
		View.initElement.call(this);
		
		var e = this.element();
		e.contentEditable = true;
		e.style.outline = "none";
		
		var self = this;
		e.onkeydown = function(evt)
		{
			if (evt.keyCode == 13)
			{
				self.preventDefault(evt);
				
				self.element().blur();
			}
		}
		
		e.onblur = function(evt)
		{
			if (!(self.delegate() && self.delegate().canPerform("textFieldShouldEndEditing")) || self.delegatePerform("textFieldShouldEndEditing"))
			{
				self.delegatePerform("textFieldEditingEnded", self);
			}
			else
			{
				setTimeout(function(){
					self.focus();
					self.selectAll();
				});
			}
		}
	},
	
	text: function()
	{
		return this.element().innerText;
	},
	
	sizingElement: function()
	{
		var e = Label.sizingElement.call(this);
		e.contentEditable = false;
		return e;
	},
	
	selectAll: function()
	{
		var range = document.createRange();
		range.selectNodeContents(this.element());
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
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
		
		var self = this;
		var e = this.element();
		e.onclick = function()
		{
			self.delegate().conditionallyPerform("buttonClicked", self);
		}
		e.style.cursor = "pointer";
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
			this.delegatePerform("checkBoxChanged");
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
			self.delegate() && self.delegate().conditionallyPerform("dropDownChanged", self);
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
	vMargin: 7,
	hMargin: 7,
	colAlignments: [],
	rowAlignments: [],
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
		return this.rows()[row].map(function(view){ return (view || View.clone()).height() }).max();
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
		return this.rowAlignments()[rowNum] || TableView.RowAlignmentBottom;
	},
	
	colAlignment: function(colNum)
	{
		return this.colAlignments()[colNum] || TableView.ColAlignmentCenter;
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
					
					var topEdge = this.vMargin() + r*this.vMargin() + r.map(function(c){ return self.rowHeight(r) }).sum();
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
VerticalListContentView = View.clone().newSlots({
	type: "VerticalListContentView",
	items: [],
	selectedItemIndex: null,
	itemHMargin: 15,
	itemVMargin: 15
}).setSlots({
	init: function()
	{
		View.init.call(this);
		
		this.setItems(this.items().copy());
	},
	
	addItemWithText: function(text)
	{
		var hMargin = VerticalListContentView.itemHMargin();
		var vMargin = VerticalListContentView.itemVMargin();
		
		var l = Label.clone();
		l.setColor(Color.Gray);
		l.setText(text);
		l.setWidth(this.width() - 2*hMargin);
		l.sizeHeightToFit();
		l.setX(hMargin);
		
		var b = Button.clone();
		b.newSlot("label", l);
		b.setDelegate(this);
		b.setWidth(this.width());
		b.setHeight(l.height() + hMargin);
		b.addSubview(l);
		
		l.centerVertically();
		
		this.addItem(b);
	},
	
	addItem: function(itemView)
	{
		itemView.newSlot("itemIndex", this.items().length);
		itemView.setY(itemView.itemIndex() * itemView.height());
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
	
	buttonClicked: function(button)
	{
		if (this.selectedItemIndex() !== null)
		{
			var l = this.items()[this.selectedItemIndex()].label();
			l.setColor(Color.Gray);
			l.setFontWeight("normal");
		}

		var l = button.label();
		l.setColor(Color.Black);
		l.setFontWeight("bold");
		this.setSelectedItemIndex(button.itemIndex());

		this.delegatePerform("vlcvSelectedItem", button);
	},
	
	selectItem: function(item)
	{
		this.buttonClicked(item);
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
		
		var addButton = Button.clone();
		addButton.setFontWeight("bold");
		addButton.setText("+");
		//addButton.setColor(Color.withRGB(56, 117, 215));
		addButton.setColor(Color.DimGray);
		addButton.sizeToFit();
		addButton.setX(addButton.fontSize());
		addButton.setY(addButton.fontSize()/2);
		addButton.setDelegate(this);
		this.setAddButton(addButton);
		
		var selfWidth = Math.max(addButton.width() + 2*addButton.fontSize(), this.titleBar().width());
		
		var contentView = VerticalListContentView.clone();
		contentView.setWidth(selfWidth);
		contentView.setResizesWidth(true);
		contentView.setDelegate(this);
		
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
	},
	
	buttonClicked: function()
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
	
	textFieldShouldEndEditing: function(textField)
	{
		return !(this.delegate() && this.delegate().canPerform("vlvShouldAddItemWithText")) || this.delegatePerform("vlvShouldAddItemWithText", textField.text());
	},
	
	textFieldEditingEnded: function(textField)
	{
		var cv = this.scrollView().contentView();
		cv.removeLastItem();
		cv.addItemWithText(textField.text());
		cv.buttonClicked(cv.items().last());
		this.scrollView().scrollToBottom();
	},
	
	shouldDockButton: function()
	{
		return (this.scrollView().contentView().height() + this.addButton().height()) > this.scrollView().height()
	},
	
	vlcvSelectedItem: function(contentView, item)
	{
		if (this.shouldDockButton())
		{
			this.addButton().setY(this.scrollView().height() + this.controlsView().height()/2 - this.addButton().height()/2 - 2);
			this.addButton().setResizesTop(true);
			this.addButton().setResizesBottom(false);
		}
		else
		{
			this.addButton().setY(this.scrollView().contentView().height());
			this.addButton().setResizesTop(false);
			this.addButton().setResizesBottom(true);
		}
		
		this.addButton().setHidden(false);
		this.delegatePerform("vlvSelectedItem", item);
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
	}
});
Editable = Proto.clone().newSlots({
	type: "Editable",
	watchesSlots: true,
	editableSlotDescriptions: {},
	editableSlots: null
}).setSlots({
	init: function()
	{
		this.setEditableSlotDescriptions(Object_clone(this.editableSlotDescriptions()));
	},
	
	newEditableSlot: function(name, value)
	{
		this.newSlot(name, value);

		this["set" + name.asCapitalized()] = function(newValue)
		{
			var oldValue = this["_" + name];
			if (oldValue != newValue)
			{
				this["_" + name] = newValue;
				if (this.watchesSlots())
				{
					this.conditionallyPerform("slotChanged", name, oldValue, newValue);
				}
			}

			return this;
		}
	},
	
	editableSlots: function()
	{
		if (!this._editableSlots)
		{
			this._editableSlots = [];
			for (var name in this.editableSlotDescriptions())
			{
				var description = this.editableSlotDescriptions()[name];
				var editableSlot = window["Editable" + description.control.type.asCapitalized() + "Slot"].clone();
				var control = Object_shallowCopy(description.control);
				delete control.type;
				editableSlot.performSets(control);
				editableSlot.setName(name);
				editableSlot.setObject(this);
				this.editableSlots().append(editableSlot);
			}
		}
		
		return this._editableSlots;
	},
	
	newEditableSlots: function(descriptions)
	{
		this.setEditableSlotDescriptions(descriptions);
		for (var name in this.editableSlotDescriptions())
		{
			var description = this.editableSlotDescriptions()[name];
			this.newEditableSlot(name, description.value);
		}
		
		return this;
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
EditableSlot = Proto.clone().newSlots({
	type: "EditableSlot",
	object: null,
	name: null,
	label: null,
	control: null,
	slotEditorView: null,
	controlProto: TextField
}).setSlots({
	label: function()
	{
		if (!this._label)
		{
			var l = Label.clone();
			l.setText(this.name());
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
	
	textFieldEditingEnded: function(tf)
	{
		this.updateValue();
	},
	
	updateValue: function(v)
	{
		this.object().perform("set" + this.name().asCapitalized(), this.control().value());
	},
	
	addTo: function(slotEditorView)
	{
		var row = this.object().editableSlots().indexOf(this);
		slotEditorView.addAtRowCol(this.label(), row, 0);
		this.control().setValue(this.object().perform(this.name()));
		this.control().sizeToFit();
		slotEditorView.addAtRowCol(this.control(), row, 1);
	}
});
SlotEditorView = TableView.clone().newSlots({
	type: "PropertyEditorView",
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
		this._object = object;
		
		var rows = this.rows();
		this.empty();
		
		var self = this;
		object.editableSlots().forEach(function(editableSlot){
			editableSlot.addTo(self);
		});
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
