dm.TableView = dm.View.clone().newSlots({
	type: "dm.TableView",
	rows: [],
	vMargin: 8,
	hMargin: 10,
	colAlignments: [],
	rowAlignments: [],
	sectionName: null,
	lastSectionName: null
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
		var sectionName = this.sectionName();
		if (sectionName && (sectionName != this.lastSectionName()))
		{	
			var sectionView = dm.View.clone().performSets({
				width: this.width(),
				height: 64,
				resizesWidth: true
			}).addToView(this);
			
			var sectionLabel = dm.Label.clone().performSets({
				text: sectionName,
				fontSize: 18,
				y: 16
			}).sizeToFit().addToView(sectionView);
			
			var sectionDivider = dm.View.clone().performSets({
				height: 1,
				width: sectionView.width(),
				resizesWidth: true,
				backgroundColor: dm.Color.LightGray
			}).addToView(sectionView).moveBelow(sectionLabel, 8);
			
			view._sectionView = sectionView;
			
			this.setLastSectionName(sectionName);
		}
		
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
		this.setSectionName(null);
		this.setLastSectionName(null);
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
		
		var colWidths = self.colCount().map(function(c){ return self.colWidth(c) });
		
		var rows = this.rows();
		var topEdge = this.vMargin();
		for (var r = 0; r < this.rowCount(); r ++)
		{
			var row = rows[r];
			var rowAlignment = this.rowAlignment(r);
			var nextTopEdge = topEdge;
			for (var c = 0; c < this.colCount(); c ++)
			{
				var colAlignment = this.colAlignment(c);
				
				var v = this.viewAtRowCol(r, c);
				if (v)
				{
					var leftEdge = this.hMargin() + c*this.hMargin() + c.map(function(c){ return colWidths[c] }).sum();
					
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
					
					var sectionView = v._sectionView;
					
					if (sectionView)
					{
						sectionView.setY(topEdge);
						topEdge = sectionView.bottomEdge();
					}
					
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
					
					nextTopEdge = Math.max(nextTopEdge, v.bottomEdge() + this.vMargin());
				}
			}
			
			topEdge = nextTopEdge;
		}
		
		this.setWidth(colWidths.sum() + this.hMargin() * (colWidths.length + 1));
		this.setHeight(topEdge);
				
		return this;
	}
});

dm.TableView.newSlots({
	defaultColAlignment: dm.TableView.ColAlignmentCenter,
	defaultRowAlignment: dm.TableView.RowAlignmentMiddle
});