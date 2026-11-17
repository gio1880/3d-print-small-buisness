/**
 * Single source of truth for custom flexi clicker pricing.
 * Loaded by the browser (window.GLITCH_CLICKERS) and by server.js at checkout,
 * so the quoted price and the charged price can never drift apart.
 * All money is in US cents.
 */
(function (root, factory) {
  const pricing = factory();
  if (typeof module === 'object' && module.exports) module.exports = pricing;
  if (root) root.GLITCH_CLICKERS = pricing;
})(typeof window !== 'undefined' ? window : null, function () {
  /**
   * Lengths describe ONE clicker by how many buttons it has.
   * Not to be confused with event sizes below, which are measured in people.
   */
  const sizes = [
    {
      id: 'mini',
      name: 'Mini',
      min: 2,
      max: 4,
      base: 400,
      perButton: 150,
      tagline: 'Initials, monograms, short nicknames',
      examples: 'GIO · MOM · 2026'
    },
    {
      id: 'standard',
      name: 'Standard',
      min: 5,
      max: 8,
      base: 600,
      perButton: 200,
      tagline: 'Most first names — our best seller',
      examples: 'SOFIA · JACKSON · TEACHER'
    },
    {
      id: 'long',
      name: 'Long',
      min: 9,
      max: 12,
      base: 1000,
      perButton: 200,
      tagline: 'Full names, team names, statements',
      examples: 'RICECOOKERS · CHAMPIONS'
    }
  ];

  /**
   * Event packages are priced per attendee — this is the main business.
   * Everyone at the event gets their own custom clicker with their own name.
   */
  const eventTiers = [
    {
      id: 'small',
      name: 'Small Event',
      minPeople: 5,
      maxPeople: 10,
      perPerson: 1200,
      tagline: 'Club meetings, small classes, team dinners, birthdays',
      includes: 'Up to 8 buttons per person'
    },
    {
      id: 'medium',
      name: 'Medium Event',
      minPeople: 11,
      maxPeople: 25,
      perPerson: 1000,
      tagline: 'Full classrooms, sports teams, banquets, camps',
      includes: 'Up to 8 buttons per person · free color matching'
    },
    {
      id: 'large',
      name: 'Large Event',
      minPeople: 26,
      maxPeople: null,
      perPerson: 800,
      tagline: 'Whole grades, tournaments, conferences, fundraisers',
      includes: 'Up to 8 buttons per person · free color matching · free gift boxes'
    }
  ];

  function eventTierFor(people) {
    const count = Math.floor(Number(people) || 0);
    return eventTiers.find(tier =>
      count >= tier.minPeople && (tier.maxPeople === null || count <= tier.maxPeople)
    ) || null;
  }

  /** Quote a whole event by headcount. Returns null below the 5-person minimum. */
  function eventQuote(people) {
    const count = Math.floor(Number(people) || 0);
    const tier = eventTierFor(count);
    if (!tier) return null;

    // What the same headcount would cost at the entry-level rate — the honest
    // comparison figure showing what the bigger-event rate saves you.
    const baseRate = eventTiers[0].perPerson;
    const listTotal = baseRate * count;
    const total = tier.perPerson * count;

    return {
      tier,
      people: count,
      perPerson: tier.perPerson,
      total,
      listTotal,
      save: listTotal - total,
      savePercent: listTotal ? Math.round((listTotal - total) / listTotal * 100) : 0
    };
  }

  const EVENT_MIN_PEOPLE = eventTiers[0].minPeople;

  const addOns = [
    {
      id: 'theme',
      name: 'Theme Pack',
      price: 600,
      blurb: 'Themed button faces and matching colors — sports, gaming, holiday, school spirit, healthcare, music.'
    },
    {
      id: 'extra-links',
      name: 'Extra Chain Links',
      price: 150,
      perUnit: true,
      maxUnits: 6,
      blurb: 'Add length so it hangs the way you want. $1.50 per link, up to 6.'
    },
    {
      id: 'glow',
      name: 'Glow in the Dark',
      price: 300,
      blurb: 'Charges in daylight, glows green at night.'
    },
    {
      id: 'premium-filament',
      name: 'Silk / Metallic Filament',
      price: 300,
      blurb: 'High-shine silk or metallic finish instead of standard matte PLA.'
    },
    {
      id: 'multicolor',
      name: 'Multi-Color Buttons',
      price: 200,
      blurb: 'Every button a different color instead of one solid color.'
    },
    {
      id: 'metal-hardware',
      name: 'Heavy-Duty Keyring',
      price: 200,
      blurb: 'Steel split ring and lobster clasp — survives a backpack.'
    },
    {
      id: 'gift-box',
      name: 'Gift Box',
      price: 300,
      blurb: 'Printed presentation box with a card. Ready to hand over.'
    },
    {
      id: 'rush',
      name: 'Rush 48-Hour Build',
      price: 500,
      blurb: 'Jumps the queue. Built and shipped within two business days.'
    }
  ];

  const MAX_PER_PERSON = 10;
  const MIN_BUTTONS = 2;
  const MAX_BUTTONS = 12;

  /**
   * Real bundle discounts, applied automatically at checkout.
   * These are genuine reductions off the normal price — the "was" figure shown
   * on the site is the true undiscounted total, never an inflated reference price.
   */
  const BULK_TIERS = [
    { min: 10, percent: 20, label: 'Max bundle — 20% off' },
    { min: 5, percent: 15, label: '5+ clickers — 15% off' },
    { min: 3, percent: 10, label: '3+ clickers — 10% off' },
    { min: 2, percent: 5, label: '2 clickers — 5% off' }
  ];

  /** Stack 3 or more add-ons and the add-on subtotal drops by this much. */
  const ADDON_BUNDLE_MIN = 3;
  const ADDON_BUNDLE_PERCENT = 15;

  function bulkTierFor(quantity) {
    return BULK_TIERS.find(tier => quantity >= tier.min) || null;
  }

  const sizeById = {};
  const addOnById = {};
  const eventTierById = {};
  sizes.forEach(size => { sizeById[size.id] = size; });
  addOns.forEach(addOn => { addOnById[addOn.id] = addOn; });
  eventTiers.forEach(tier => { eventTierById[tier.id] = tier; });

  /** Which size tier a given button count falls into. */
  function sizeForCount(count) {
    return sizes.find(size => count >= size.min && count <= size.max) || null;
  }

  /**
   * Price an order of `quantity` identical clickers, in cents.
   * selectedAddOns: { [addOnId]: true | unitCount }
   * Returns null when the button count is outside the sellable range.
   *
   * `listTotal` is what the order would cost with no discounts — the honest
   * strikethrough figure. `total` is what actually gets charged.
   */
  function quote(count, selectedAddOns, quantity) {
    const size = sizeForCount(count);
    if (!size) return null;

    const qty = Math.min(Math.max(Math.floor(Number(quantity) || 1), 1), MAX_PER_PERSON);
    const selections = selectedAddOns || {};
    const base = size.base + count * size.perButton;
    const lines = [];
    let addOnTotal = 0;

    addOns.forEach(addOn => {
      const raw = selections[addOn.id];
      if (!raw) return;

      const units = addOn.perUnit
        ? Math.min(Math.max(Math.floor(Number(raw)) || 0, 0), addOn.maxUnits)
        : 1;
      if (units < 1) return;

      const amount = addOn.price * units;
      addOnTotal += amount;
      lines.push({ id: addOn.id, name: addOn.name, units, amount });
    });

    // Add-on bundle discount: stack 3+ add-ons, save on the add-on subtotal.
    const addOnBundleApplies = lines.length >= ADDON_BUNDLE_MIN;
    const addOnBundleSave = addOnBundleApplies
      ? Math.round(addOnTotal * ADDON_BUNDLE_PERCENT / 100)
      : 0;

    const unitList = base + addOnTotal;
    const unitTotal = unitList - addOnBundleSave;

    // Bulk discount. Rounded per unit so the Stripe line item's unit_amount
    // multiplies out to exactly the total shown on the site.
    const bulkTier = bulkTierFor(qty);
    const bulkPercent = bulkTier ? bulkTier.percent : 0;
    const unitCharged = Math.round(unitTotal * (100 - bulkPercent) / 100);
    const bulkSave = (unitTotal - unitCharged) * qty;

    const listTotal = unitList * qty;
    const total = unitCharged * qty;

    return {
      size,
      buttons: count,
      quantity: qty,
      base,
      addOns: lines,
      addOnTotal,
      addOnBundleApplies,
      addOnBundlePercent: addOnBundleApplies ? ADDON_BUNDLE_PERCENT : 0,
      addOnBundleSave,
      unitList,
      unitTotal,
      unitCharged,
      bulkTier,
      bulkPercent,
      bulkSave,
      listTotal,
      total,
      save: listTotal - total,
      savePercent: listTotal ? Math.round((listTotal - total) / listTotal * 100) : 0
    };
  }

  return {
    sizes,
    addOns,
    sizeById,
    addOnById,
    sizeForCount,
    quote,
    eventTiers,
    eventTierById,
    eventTierFor,
    eventQuote,
    EVENT_MIN_PEOPLE,
    bulkTierFor,
    BULK_TIERS,
    ADDON_BUNDLE_MIN,
    ADDON_BUNDLE_PERCENT,
    MAX_PER_PERSON,
    MIN_BUTTONS,
    MAX_BUTTONS
  };
});
