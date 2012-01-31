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

function Object_eachSlot(obj, fn)
{
	for (var name in obj)
	{
		if (obj.hasOwnProperty(name))
		{
			fn(name, obj[name]);
		}
	}
}

Arguments_asArray = function(args)
{
	return Array.prototype.slice.call(args);
}
