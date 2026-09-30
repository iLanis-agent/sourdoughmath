# SourdoughMath

Baker's percentages and fermentation timing for sourdough, with the honesty
most recipes skip: bulk time swings hours with kitchen temperature and starter
percentage, and "about 4 hours" is only true in the recipe writer's kitchen.

## What it does

- **Formula from any flour weight** - water, salt, and starter in grams from
  baker's percentages, with the starter's own flour and water counted back into
  total flour, true hydration, and true salt percentage.
- **Levain build** - seed, feed ratio, and total from a 1:r:r build.
- **Fermentation, honestly** - bulk and proof estimates anchored at 4.5 h for
  a 20%-starter dough at 24 °C, rate doubling every ~8 °C. Cold kitchens drag,
  hot kitchens race, and the app says so with a verdict note instead of a
  single fake-precise number.
- **Water temperature** - the classic DDT equation (water = 3x target - flour
  temp - room temp - mixing friction) so the dough starts where you want it.
- **Timeline** - mix, shape, and bake clock times from a start time, with or
  without an overnight fridge retard.

Static site: `index.html` is the landing page, `app.html` is the calculator,
`engine.js` is the pure-function math, `test-engine.js` is the node test suite
(38 tests).

## Run

Open `app.html`, or serve the folder with any static server. Tests:

    node test-engine.js
