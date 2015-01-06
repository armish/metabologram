HTMLWidgets.widget({
  name: 'metabologram',
  type: 'output',

  initialize: function(el, width, height) {
    return {
      el: el,
      width: width,
      height: height
    }
  },

  renderValue: function(el, x, instance) {
    initializeCoffeeWheel(x.treeData, el, instance.width, instance.height, x.main);
    instance["x"] = x;
  },

  resize: function(el, width, height, instance) {
    el.innerHTML = "";
    initializeCoffeeWheel(instance.x.treeData, el, width, height, instance.x.main);
    instance.width = width;
    instance.height = height;
  }

});
