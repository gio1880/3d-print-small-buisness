(function (root, factory) {
  const catalog = factory();
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  if (root) root.GLITCH_PRODUCTS = catalog;
})(typeof window !== 'undefined' ? window : null, function () {
  return [
    { id: 'mini-dragon-blue', name: 'Mini Flexi Dragon (Blue)', category: 'Flexi Dragons', price: 200, stock: 22, image: 'assets/prod-blue-minis.png', description: 'Pocket-size articulated blue dragon.' },
    { id: 'mini-dragon-blue-black', name: 'Mini Flexi Dragon (Blue & Black)', category: 'Flexi Dragons', price: 200, stock: 36, image: 'assets/prod-blue-minis.png', description: 'Pocket-size blue-and-black articulated dragon.' },
    { id: 'mini-dragon-green', name: 'Mini Flexi Dragon (Green)', category: 'Flexi Dragons', price: 200, stock: 1, image: 'assets/prod-mini-dragons.png', description: 'Pocket-size green articulated dragon.' },
    { id: 'medium-dragon-black-red', name: 'Medium Flexi Dragon (Black & Red)', category: 'Flexi Dragons', price: 1200, stock: 5, image: 'assets/dragon-shadow.png', description: 'Medium articulated dragon with bold black-and-red color.' },
    { id: 'dragon-white-blue', name: 'Dragon (White & Blue)', category: 'Flexi Dragons', price: 1500, stock: 1, image: 'assets/dragon-crystal.png', description: 'Articulated dragon in a white-and-blue finish.' },
    { id: 'dragon-red', name: 'Dragon (Red)', category: 'Flexi Dragons', price: 1500, stock: 1, image: 'assets/prod-flame-dragon.png', description: 'Articulated dragon in a vivid red finish.' },
    { id: 'dragon-blue', name: 'Dragon (Blue)', category: 'Flexi Dragons', price: 1500, stock: 1, image: 'assets/prod-blue-minis.png', description: 'Articulated dragon in an ocean-blue finish.' },
    { id: 'medium-dragon-yellow-red', name: 'Medium Dragon (Yellow & Red)', category: 'Flexi Dragons', price: 1000, stock: 4, image: 'assets/prod-flame-dragon.png', description: 'Medium articulated dragon with yellow and red details.' },
    { id: 'dragon-yellow-blue', name: 'Dragon (Yellow & Blue)', category: 'Flexi Dragons', price: 1500, stock: 1, image: 'assets/prod-flame-dragon.png', description: 'Articulated dragon with a bright yellow-and-blue finish.' },

    { id: 'spring-cat-black', name: 'Black Spring Cat', category: 'Figures & Critters', price: 400, stock: 5, image: 'assets/prod-spring-cats.png', description: 'Springy black cat that wobbles and poses.' },
    { id: 'flexi-cat-white', name: 'White Flexi Cat', category: 'Figures & Critters', price: 600, stock: 3, image: 'assets/prod-flexi-cat.webp', description: 'White articulated cat with a poseable tail.' },
    { id: 'alligator-purple-pink', name: 'Alligator (Purple & Pink)', category: 'Figures & Critters', price: 700, stock: 9, image: 'assets/prod-mini-trex.webp', description: 'Playful purple-and-pink articulated alligator.' },
    { id: 'parrot-purple-pink', name: 'Parrot (Purple & Pink)', category: 'Figures & Critters', price: 700, stock: 15, image: 'assets/prod-flexi-bird.webp', description: 'Colorful articulated parrot with poseable wings.' },
    { id: 'parrot-multicolor', name: 'Parrot (Orange, Red & Blue)', category: 'Figures & Critters', price: 700, stock: 7, image: 'assets/prod-flexi-bird.webp', description: 'Bright multicolor articulated parrot.' },
    { id: 'butterfly-white-blue', name: 'Butterfly (White & Blue)', category: 'Figures & Critters', price: 500, stock: 1, image: 'assets/prod-flexi-bird.webp', description: 'Lightweight white-and-blue butterfly figure.' },
    { id: 'old-godzilla-green', name: 'Classic Godzilla (Green)', category: 'Figures & Critters', price: 800, stock: 1, image: 'assets/prod-mini-trex.webp', description: 'Classic green monster figure with retro character.' },
    { id: 'crocodile-green', name: 'Flexi Crocodile (Green)', category: 'Figures & Critters', price: 1000, stock: 1, image: 'assets/prod-mini-trex.webp', description: 'Green articulated crocodile with a flexible body.' },

    { id: 'airless-basketball-medium', name: 'Medium Airless Basketball', category: 'Sculptures & Decor', price: 1300, stock: 1, image: 'assets/prod-squish-basketball.webp', description: 'Flexible medium-size lattice basketball.' },
    { id: 'airless-basketball-small', name: 'Small Airless Basketball', category: 'Sculptures & Decor', price: 800, stock: 1, image: 'assets/prod-squish-basketball.webp', description: 'Compact flexible lattice basketball.' },
    { id: 'spiral-red-black', name: 'Medium Spiral (Red & Black)', category: 'Sculptures & Decor', price: 300, stock: 11, image: 'assets/prod-spiral.png', description: 'Hypnotic red-and-black spiral desk sculpture.' },
    { id: 'spiral-black', name: 'Medium Spiral (Black)', category: 'Sculptures & Decor', price: 300, stock: 2, image: 'assets/prod-spiral.png', description: 'Hypnotic black spiral desk sculpture.' },
    { id: 'spiral-blue', name: 'Medium Spiral (Blue)', category: 'Sculptures & Decor', price: 300, stock: 1, image: 'assets/prod-spiral-galaxy.png', description: 'Hypnotic blue spiral desk sculpture.' }
  ];
});
