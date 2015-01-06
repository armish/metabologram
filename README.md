## Install
This package is currently not on CRAN, but you can install it from GitHub via `devtools`:

```r
library("devtools");
devtools::install_github("armish/metabologram");
```

## Sample Plotting
```r
library("metabologram");
metabologram(sampleWheelData, width=500, height=500, main="Sample Wheel Title");
```

## Credits
This version of the wheel was adapted from [Jason Davies's Coffee Wheel example](https://www.jasondavies.com/coffee-wheel/). 
Built with [D3.js](http://d3js.org/). Sunburst zooming based on an [example](http://bl.ocks.org/mbostock/4348373) by [Mike Bostock](http://bost.ocks.org/mike).
