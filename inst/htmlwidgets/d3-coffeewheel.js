var initializeCoffeeWheel = function(data, el, width, height, mainTitle, fontSize, showLegend, legendColors, legendBreaks, legendText) {
    el.innerHTML = "";
    
    var legendWidth = 100;

    var orgWidth = width;
    if(showLegend) {
      width -= legendWidth;
    }

	  var minSize = Math.min(width, height);
    minSize -= minSize/20;

    var div = d3.select(el);
    if(mainTitle.length > 0) {
      var mainTitleEl = div.append("h1")
        .attr("id", "main")
        .style("text-align", "center")
        .text(mainTitle);

      minSize -= 50;
    } 

	  height = width = Math.max(minSize, 0);
	
    var radius = (width/2),
        x = d3.scale.linear().range([0, 2 * Math.PI]),
        y = d3.scale.pow().exponent(1.3).domain([0.3, 1]).range([0, radius*.99]),
        padding = 0,
        duration = 1000;

        var svg = div.append("svg")
        .attr("width", (showLegend ? orgWidth : width))
        .attr("height", height);

        var vis = svg.append("g").attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

    var partition = d3.layout.partition()
        .sort(null)
    ;

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, d.y ? y(d.y) : d.y); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)) - (d.depth == 1 ? radius/10 : 0); });


    function extractProperties(d) {
      var hideProperties = ["x", "y", "dx", "dy", "parent", "value", "colour", "depth", "children"];
      var keys = Object.keys(d);

      var content = "";
      for(var i=0; i < keys.length; i++) {
        var aKey = keys[i];

        var show = true;
        for(var j=0; j < hideProperties.length; j++) {
          if(hideProperties[j] == aKey) { 
            show = false;
            break;
          }
        }

        if(show) {
          content += "<b>" + aKey + "</b>: " + d[aKey] + "<br>";
        }
      }

      return content;
    }

    function isParentOf(p, c) {
      if (p === c) return true;
      if (p.children) {
        return p.children.some(function(d) {
          return isParentOf(d, c);
        });
      }
      return false;
    }

    function colour(d) {
      if (d.depth != 0 && d.colour == undefined && d.children) {
        // There is a maximum of two children!
        var colours = d.children.map(colour);
        var sum = { r: 0, g: 0, b: 0 };
        for(var i=0; i < colours.length; i++) {
          var aColor = d3.rgb(colours[i]);
          sum.r = Math.max(aColor.r, sum.r);
          sum.g = Math.max(aColor.g, sum.g);
          sum.b = Math.max(aColor.b, sum.b);
        }
        return d3.rgb(sum.r, sum.g, sum.b);
      }

      return d.colour || "#fff";
    }

    // Interpolate the scales!
    function arcTween(d) {
      var my = maxY(d),
          xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, my]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
      return function(d) {
        return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
      };
    }

    function maxY(d) {
      return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
    }

    // http://www.w3.org/WAI/ER/WD-AERT/#color-contrast
    function brightness(rgb) {
      return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
    }

    (function(json) {
      var assignSizes = function(node) {
      	if(node.children == undefined || node.children.length < 1) {
      		return;
      	} else {
      		var numOfChilds = node.children.length
      		for(var ci=0; ci < numOfChilds; ci++) {
      			var childNode = node.children[ci];
      			childNode.value = 1.0/numOfChilds;
      			assignSizes(childNode);
      		}
      	}
      };

      for(var i=0; i < json.length; i++) {
      	assignSizes(json[i]);
      }

      var nodes = partition.nodes({children: json});

      var path = vis.selectAll("path").data(nodes);
      path.enter().append("path")
          .attr("id", function(d, i) { return "path-" + i; })
          .attr("d", arc)
          .attr("fill-rule", "evenodd")
          .style("fill", colour)
          .style("stroke", "#000000")
          .style("stroke-width", 1.5)
          ;

      var text = vis.selectAll("text").data(nodes);
      var textEnter = text.enter().append("text")
          .style("fill-opacity", 1)
          .style("fill", function(d) {
            return brightness(d3.rgb(colour(d))) < 125 ? "#eee" : "#000";
          })
          .attr("text-anchor", function(d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
          })
          .attr("dy", ".2em")
          .attr("transform", function(d) {
            var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                rotate = angle;
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
          })
          .style("font-size", function(d) { return fontSize + "px"; })
          .attr("title", "Something something...")
          .each(function(d, i) {
            var content = extractProperties(d);
            $(this).tooltipster({ content: $(content) }); 
          })
          ;
      textEnter.append("tspan")
          .attr("x", function(d) { return x(d.x + d.dx / 2) > Math.PI ? -5 : 5 })
          .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });


      if(showLegend && legendBreaks && legendColors) {
          var ly = d3.scale.linear().domain([0, legendBreaks.length-1]).range([0+height/20, height-height/20]);
          var rects = vis.selectAll("rect").data(legendBreaks);
          var lx = (orgWidth-legendWidth) + legendWidth/5;

          var lviz = svg.append("g");

          var colorBoxes = lviz.selectAll("rect").data(legendColors);
          colorBoxes.enter().append("rect")
            .attr("x", lx)
            .attr("y", function(d, i) { return ly(i); })
            .attr("width", 30)
            .attr("height", function(d, i) { return ly(i) - ly(i-1); })
            .style("fill", function(d) { return d; })
            .style("stroke", "#000")
            .style("stroke-width", 1.5)
          ;

          var breakTxt = lviz.append("g").selectAll("text").data(legendBreaks);
          breakTxt.enter().append("text")
            .attr("dx", lx + fontSize*3)
            .attr("dy", function(d, i) { return ly(i) + fontSize/3; })
            .style("font-size", fontSize + "px")
            .style("font-weight", "bold")
            .style("color", "#000")
            .text(function(d) { return d; });

          var legX = lx - fontSize;
          var legY = ly((legendBreaks.length-1)/2);
          var legendTitle = lviz.append("g").selectAll("text").data([legendText]);
          legendTitle.enter().append("text")
            .attr("dx", legX)
            .attr("dy", legY)
            .attr("transform", "rotate(-90 " + legX + "," + legY + ")")
            .style("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .style("font-weight", "bold")
            .style("color", "#000")
            .text(function(d) { return d; })
          ;
      }

      function click(d) {
        path.transition()
          .duration(duration)
          .attrTween("d", arcTween(d));

        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function(e) {
              return isParentOf(d, e) ? null : d3.select(this).style("visibility");
            })
          .transition()
            .duration(duration)
            .attrTween("text-anchor", function(d) {
              return function() {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
              };
            })
            .attrTween("transform", function(d) {
              var multiline = (d.name || "").split(" ").length > 1;
              return function() {
                var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                    rotate = angle + (multiline ? -.5 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
              };
            })
            .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function(e) {
              d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });
      }
    })(data);

};