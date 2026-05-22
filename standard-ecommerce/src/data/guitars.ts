export type Guitar = {
  id: string
  name: string
  tagline: string
  price: number
  image: string
  bodyShape: string
  topWood: string
  finish: string
  artwork: string
  rating: number
  reviewCount: number
  badges: Array<string>
  description: string
  highlights: Array<string>
}

export const PRIMARY_GUITAR: Guitar = {
  id: 'tradewind-sunset-dreadnought',
  name: 'Tradewind Sunset Dreadnought',
  tagline:
    'Sunset over the lagoon, captured in lacquer. The flagship of the Island Vibes collection.',
  price: 299,
  image: '/primary-guitar.png',
  bodyShape: 'Cutaway Dreadnought',
  topWood: 'Spruce-pattern laminate',
  finish: 'High-gloss sunset overlay',
  artwork: 'Hibiscus bloom, palm silhouettes & a golden Pacific sunset',
  rating: 4.7,
  reviewCount: 1248,
  badges: ['Bestseller', 'Limited Print', 'Free Shipping'],
  description:
    'Strap in for an instant vacation. The Tradewind Sunset Dreadnought wraps a cutaway dreadnought body in a hand-finished sunset mural — every hibiscus petal, palm frond, and rolling wave painted to put a smile on your face the moment you open the case. Six bright strings deliver enough shimmer for backyard luaus, dorm-room jam sessions, and \"please-just-one-song\" moments on the back porch.',
  highlights: [
    'Cutaway body for easy upper-fret access while you serenade the sunset',
    'Palm-tree fretboard inlays you can actually feel under your fingertips',
    'Gloss-finished top that pops in photos and survives sticky tropical drinks',
    'Pre-strung with bright bronze-wound strings tuned to standard at the factory',
  ],
}

export const RELATED_GUITARS: Array<Guitar> = [
  {
    id: 'lagoon-glow-dread',
    name: 'Lagoon Glow Dreadnought',
    tagline: 'Turquoise depths and a horizon that never quits.',
    price: 299,
    image: '/another-guitar-1.png',
    bodyShape: 'Full Dreadnought',
    topWood: 'Solid-look spruce laminate',
    finish: 'Satin lagoon fade',
    artwork: 'Glassy lagoon, leaning palm & abalone-style rosette',
    rating: 4.6,
    reviewCount: 842,
    badges: ['New Arrival', 'Free Shipping'],
    description:
      "The Lagoon Glow leans hard into that turquoise-water-from-the-airplane-window feeling. A full dreadnought body keeps the look bold while the satin finish reads as gallery-grade in person. We aren't going to claim it'll out-pick a vintage Martin, but it absolutely steals the show on a shelf — and it sounds plenty good for sing-alongs.",
    highlights: [
      'Bound body with faux-abalone rosette for serious shelf presence',
      'Palm-tree fretboard inlays running the length of the neck',
      '\u201CIsland Vibes\u201D logo screen-printed on the headstock',
      'Ships set up for a low, beginner-friendly action',
    ],
  },
  {
    id: 'island-traveler-mini',
    name: 'Island Traveler Mini',
    tagline: 'Vacation-sized. Backseat-friendly. Beach-ready.',
    price: 299,
    image: '/another-guitar-2.png',
    bodyShape: 'Travel / 3⁄4 Dreadnought',
    topWood: 'Light spruce laminate',
    finish: 'Natural with painted sunset',
    artwork: 'Sunrise harbor scene with painted-on soundhole logo',
    rating: 4.5,
    reviewCount: 612,
    badges: ['Travel Pick'],
    description:
      'The Island Traveler Mini is built for road trips, dorm rooms, and that one friend who insists on bringing a guitar to every cookout. The slightly shrunken body makes it endlessly haulable, and the painted sunrise on the lower bout is the kind of thing strangers actually walk over to compliment. Tone-wise: charming, mid-forward, and totally appropriate for the campsite.',
    highlights: [
      'Compact 3⁄4-style body that fits in overhead bins and crowded back seats',
      'Hand-painted-look sunrise mural with rocky-coast silhouette',
      'Lightweight build that\u2019s friendly for smaller players and kids',
      'Includes a soft padded gig bag for tossing in the trunk',
    ],
  },
  {
    id: 'aloha-classic-dread',
    name: 'Aloha Classic Dreadnought',
    tagline: 'A postcard you can play.',
    price: 299,
    image: '/another-guitar-3.png',
    bodyShape: 'Classic Dreadnought',
    topWood: 'Natural spruce laminate',
    finish: 'Open-pore satin',
    artwork: 'Diamond Head beach scene with hibiscus pickguard',
    rating: 4.8,
    reviewCount: 1573,
    badges: ['Top Rated', 'Staff Pick'],
    description:
      'The Aloha Classic is our most postcard-ready model — the kind of guitar that looks like it should be hanging on the wall of a beachside cafe. A floral pickguard, a sunset-over-Diamond-Head mural, and gold-script \u201CAloha\u201D headstock branding turn a beginner-friendly dreadnought into a centerpiece. Plays comfortably, sounds happy, and frankly makes you want to start a luau.',
    highlights: [
      'Hibiscus-printed tortoiseshell-style pickguard',
      '\u201CAloha\u201D headstock script in golden lacquer',
      'Hand-painted-look Diamond Head mural across the lower bout',
      'Smooth open-pore finish that feels great unplugged on the porch',
    ],
  },
  {
    id: 'island-wave-dreadnought',
    name: 'Island Wave Dreadnought',
    tagline: 'Catch a barrel without ever leaving the living room.',
    price: 299,
    image: '/another-guitar-4.png',
    bodyShape: 'Wide-shoulder Dreadnought',
    topWood: 'Painted spruce laminate',
    finish: 'High-gloss wraparound mural',
    artwork: 'Rolling surf, hibiscus foreground & golden-hour horizon',
    rating: 4.6,
    reviewCount: 504,
    badges: ['New Arrival', 'Limited Run'],
    description:
      'The Island Wave wraps a full-color surf scene around a wide-shoulder dreadnought — palm trees on the upper bout, a peeling wave through the soundhole, and a sunset horizon that runs all the way to the cutaway. Pure beach-bum showpiece energy. Strum it on the patio, hang it on the wall when you\u2019re done, and accept the compliments either way.',
    highlights: [
      'Edge-to-edge surf mural with foreground hibiscus and palm silhouettes',
      '\u201CIsland Wave\u201D gold-script headstock branding',
      'Glossy painted top that pops under string lights',
      'Pre-strung and pre-tuned so you can play the second it lands at your door',
    ],
  },
]

export const ALL_GUITARS: Array<Guitar> = [PRIMARY_GUITAR, ...RELATED_GUITARS]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
