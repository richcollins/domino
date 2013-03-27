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
	},
	
	pathExtension: function()
	{
		var parts = this.split("?").first().split("#").first().split("/").last().split(".");
		if (parts.length > 1)
		{
			return parts.at(-1);
		}
		else
		{
			return null;
		}
	}
});
