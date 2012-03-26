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
