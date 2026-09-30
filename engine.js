/* SourdoughMath engine - baker's percentages and fermentation timing. Pure functions, no DOM. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SourdoughMath = api;
}(typeof self !== 'undefined' ? self : this, function () {

  function r2(x) { return Math.round(x * 100) / 100; }
  function r1(x) { return Math.round(x * 10) / 10; }

  // Baker's math from a flour weight. Starter counts as half flour, half water
  // at 100% hydration; other starter hydrations split proportionally.
  function formula(flourG, waterPct, saltPct, starterPct, starterHydrationPct) {
    if (flourG <= 0) return null;
    var waterG = flourG * waterPct / 100;
    var saltG = flourG * saltPct / 100;
    var starterG = flourG * starterPct / 100;
    var sh = starterHydrationPct / 100;
    var starterFlour = starterG / (1 + sh);
    var starterWater = starterG - starterFlour;
    var totalFlour = flourG + starterFlour;
    var totalWater = waterG + starterWater;
    return {
      waterG: r1(waterG),
      saltG: r1(saltG),
      starterG: r1(starterG),
      starterFlourG: r1(starterFlour),
      starterWaterG: r1(starterWater),
      totalFlourG: r1(totalFlour),
      totalWaterG: r1(totalWater),
      totalDoughG: r1(flourG + waterG + saltG + starterG),
      trueHydrationPct: r2(totalWater / totalFlour * 100),
      saltTruePct: r2(saltG / totalFlour * 100)
    };
  }

  // Levain build: seed + flour + water by ratio, e.g. 1:5:5.
  function levain(seedG, feedRatio) {
    if (seedG <= 0 || feedRatio <= 0) return null;
    var flour = seedG * feedRatio;
    return { seedG: r1(seedG), flourG: r1(flour), waterG: r1(flour), totalG: r1(seedG + 2 * flour) };
  }

  // Fermentation rate model, honest version: rate doubles per ~8C rise from a
  // 24C reference where bulk for a 20% starter dough runs ~4.5h. Real kitchens
  // swing this by hours, which is exactly what recipes hide.
  var REF_TEMP_C = 24, REF_BULK_H = 4.5, Q10_STEP_C = 8;
  function bulkHours(starterPct, tempC) {
    if (tempC < 4 || tempC > 40) return null;
    var base = REF_BULK_H * (20 / starterPct); // more starter, faster bulk
    var factor = Math.pow(2, (REF_TEMP_C - tempC) / Q10_STEP_C);
    return r2(base * factor);
  }
  function proofHours(starterPct, tempC) {
    var b = bulkHours(starterPct, tempC);
    if (b === null) return null;
    return r2(b * 0.35);
  }
  function fridgeRetardHours() { return { min: 8, max: 16 }; }

  // Fermentation verdict for honesty messaging.
  function tempVerdict(tempC) {
    if (tempC < 18) return { level: 'warn', note: 'Cool kitchen - bulk drags. Use warmer water or a warmer spot; watch the dough, not the clock.' };
    if (tempC <= 26) return { level: 'good', note: 'Sweet spot. The estimate should land close; still judge by rise and jiggle.' };
    if (tempC <= 30) return { level: 'warn', note: 'Warm kitchen - fermentation runs hot. Shorten bulk and watch for over-proof.' };
    return { level: 'bad', note: 'Above 30C the dough races and sours fast. Cut starter % or find a cooler spot.' };
  }

  // Desired dough temperature: pick water temp to hit DDT given flour temp,
  // room temp, and friction from mixing (C).
  function waterTempC(ddtC, flourTempC, roomTempC, frictionC) {
    return r1(ddtC * 3 - flourTempC - roomTempC - frictionC);
  }

  // Timeline from a start time (minutes since midnight). Returns clock minutes.
  function timeline(startMin, bulkH, proofH, retardH) {
    var mix = startMin;
    var shape = mix + bulkH * 60;
    var bake = retardH > 0 ? shape + retardH * 60 + 45 : shape + proofH * 60;
    return { mixMin: Math.round(mix), shapeMin: Math.round(shape), bakeMin: Math.round(bake) };
  }
  function fmtClock(min) {
    min = ((Math.round(min) % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }

  // Flour blend splitting (e.g. 15% whole wheat).
  function blend(flourG, parts) {
    // parts: [{name, pct}] must sum to 100
    var sum = 0, i;
    for (i = 0; i < parts.length; i++) sum += parts[i].pct;
    if (Math.abs(sum - 100) > 0.01) return null;
    return parts.map(function (p) { return { name: p.name, g: r1(flourG * p.pct / 100) }; });
  }

  return {
    formula: formula, levain: levain, bulkHours: bulkHours, proofHours: proofHours,
    fridgeRetardHours: fridgeRetardHours, tempVerdict: tempVerdict, waterTempC: waterTempC,
    timeline: timeline, fmtClock: fmtClock, blend: blend,
    REF_TEMP_C: REF_TEMP_C, REF_BULK_H: REF_BULK_H
  };
}));
