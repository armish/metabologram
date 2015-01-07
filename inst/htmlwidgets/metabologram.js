HTMLWidgets.widget({
  name: 'metabologram',
  type: 'output',

  initialize: function(el, width, height) {
    el.innerHTML = "";
    
    return {
      el: el,
      width: width,
      height: height
    }
  },

  renderValue: function(el, x, instance) {
    initializeCoffeeWheel(x.treeData, el, instance.width, instance.height, x.main, x.fontSize, x.showLegend, x.legendColors, x.legendBreaks, x.legendText);
    instance["x"] = x;
  },

  resize: function(el, width, height, instance) {
    el.innerHTML = "";
    initializeCoffeeWheel(instance.x.treeData, el, width, height, instance.x.main, instance.x.fontSize, instance.x.showLegend, instance.x.legendColors, instance.x.legendBreaks, instance.x.legendText);
    instance.width = width;
    instance.height = height;
  }

});
