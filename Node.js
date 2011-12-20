function Node_asObject(node, seen)
{

	var obj = {};
	if (!seen)
	{
		seen = [];
	}
	
	if (seen.indexOf(obj) > -1)
	{
		return obj;
	}
	
	seen.append(node);
	var allText = true;
	var text = [];
	for (var i = 0; i < node.childNodes.length; i ++)
	{
		var n = node.childNodes[i];
		if (n.nodeType == 3)
		{
			text.append(n.nodeValue);
		}
		else
		{
			allText = false;
			var v = obj[n.nodeName];
			if (v)
			{
				if (v instanceof Array)
				{
					v.append(Node_asObject(n, seen));
				}
				else
				{
					obj[n.nodeName] = [v].append(Node_asObject(n, seen));
				}
			}
			else
			{
				obj[n.nodeName] = Node_asObject(n, seen);
			}
		}
	}
	if (node.childNodes.length && allText)
	{
		return text.join("");
	}

	obj["@attributes"] = {};
	
	if (node.attributes)
	{
		for (var i = 0; i < node.attributes.length; i ++)
		{
			var a = node.attributes[i];
			obj["@attributes"][a.name] = a.value;
		}
	}
	
	return obj;
}