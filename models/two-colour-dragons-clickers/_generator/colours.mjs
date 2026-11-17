// The four spools on the AMS (Bambu PLA Basic colour codes), purge amounts, and the default pair per design.
export const SPOOL = {
  gold: { hex: '#E4BD68', rgb: [228, 189, 104] }, orange: { hex: '#FF6A13', rgb: [255, 106, 19] },
  blue: { hex: '#0A2989', rgb: [22, 52, 160] }, turquoise: { hex: '#00B1B7', rgb: [0, 177, 183] },
  // the rest of the palette in ../../FILAMENT.md
  white: { hex: '#FFFFFF', rgb: [250, 250, 248] }, black: { hex: '#000000', rgb: [30, 30, 32] },
  red: { hex: '#C12E1F', rgb: [200, 48, 34] }, pink: { hex: '#F5A3C7', rgb: [245, 163, 199] },
  brown: { hex: '#8E5A3A', rgb: [142, 90, 58] }, tan: { hex: '#C68E5A', rgb: [210, 156, 104] },
  lightgreen: { hex: '#7AC943', rgb: [122, 201, 67] }, darkgreen: { hex: '#3F8E43', rgb: [55, 130, 60] },
  pumpkin: { hex: '#FF9016', rgb: [255, 144, 22] }, purple: { hex: '#5E43B7', rgb: [94, 67, 183] }, skyblue: { hex: '#0086D6', rgb: [0, 134, 214] },
};
// purge for any pair not in FLUSH: more when going from a dark colour to a light one
const lum = c => { const [r, g, b] = SPOOL[c].rgb; return 0.3 * r + 0.59 * g + 0.11 * b; };
export const flushFor = (a, b) => FLUSH[a + '>' + b] ?? (a === b ? 0 : Math.round(160 + 480 * Math.max(0, lum(b) - lum(a)) / 255 + (b === 'white' ? 80 : 0)));
// purge (mm³) from -> to; a dark colour into gold needs the most
export const FLUSH = { 'gold>blue': 160, 'blue>gold': 520, 'gold>turquoise': 240, 'turquoise>gold': 380, 'gold>orange': 200, 'orange>gold': 320, 'blue>orange': 420, 'orange>blue': 160, 'turquoise>orange': 260, 'orange>turquoise': 260, 'blue>turquoise': 420, 'turquoise>blue': 180 };
// [body (slot 1), accent (slot 2)]. Swap the spools in the AMS for the other looks.
export const PAIR = {
  ridgeback: ['gold', 'blue'], puff: ['gold', 'turquoise'],
  'ridgeback-mini': ['gold', 'blue'], 'puff-mini': ['gold', 'turquoise'], 'ridgeback-short': ['gold', 'blue'], 'puff-short': ['gold', 'turquoise'],
  square: ['gold', 'blue'], circle: ['gold', 'turquoise'], triangle: ['gold', 'orange'], star: ['blue', 'gold'], heart: ['gold', 'orange'],
  hexagon: ['gold', 'turquoise'], gear: ['blue', 'gold'], 'star-of-david': ['gold', 'blue'], flower: ['gold', 'orange'], donut: ['gold', 'turquoise'],
  paw: ['turquoise', 'blue'], shield: ['blue', 'gold'], 'keychain-tag': ['gold', 'blue'], hamburger: ['gold', 'orange'], 'switch-fit-test': ['gold', 'gold'],
  // food line
  pizza: ['tan', 'red'], cookie: ['tan', 'brown'], cupcake: ['brown', 'pink'], 'ice-cream': ['tan', 'pink'],
  strawberry: ['red', 'lightgreen'], watermelon: ['red', 'darkgreen'], taco: ['gold', 'lightgreen'], sushi: ['black', 'white'],
  // animals
  macaron: ['pink', 'white'], 'cookie-sandwich': ['brown', 'white'], 'stem-fit-test': ['gold', 'gold'],
  bee: ['gold', 'black'], ladybug: ['red', 'black'], frog: ['lightgreen', 'darkgreen'], panda: ['white', 'black'], 'cat-face': ['pumpkin', 'white'], turtle: ['darkgreen', 'lightgreen'],
};
