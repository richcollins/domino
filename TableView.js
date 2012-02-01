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
		return this;
	}
});

TableView.newSlots({
	defaultColAlignment: TableView.ColAlignmentCenter,
	defaultRowAlignment: TableView.RowAlignmentMiddle
});