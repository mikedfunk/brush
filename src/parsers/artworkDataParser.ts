import { z } from 'zod'

const ARTWORK_MATERIALS = [
  'Aluminium',
  'Bronze',
  'Canvas',
  'Carbon Fibre',
  'Cardboard',
  'Ceramic',
  'Glass',
  'Iron',
  'Marble',
  'Paper',
  'Plastic',
  'Soft (Yarn, Cotton, Fabric)',
  'Sound',
  'Stainless Steel',
  'Steel',
  'Stone',
  'Wood',
  'Other',
] as const

const artworkDataParser = z.object({
  artwork_id: z.string().min(1),
  // is_legacy_artwork: z.boolean(),
  legacy_user_art_id: z.number().min(1),
  user_id: z.number().min(1),
  // created_at: z.number().min(1),
  // uploaded_at: z.number().min(1),
  // modified_at: z.number().min(1),
  year_produced: z.number().min(1),
  is_deleted: z.boolean(),
  artwork_image: z.object({
    main_url: z.string().min(1),
    thumbnail_url: z.string().min(1),
    polaroid_url: z.string().min(1),
    // fullscreen_url: z.string().min(1),
    original_width: z.number().min(1),
    original_height: z.number().min(1),
    crops: z.object({
      studio: z.object({
        square: z.object({
          x: z.number().min(0),
          y: z.number().min(0),
          width: z.number().min(1),
          height: z.number().min(1),
        }),
        print: z.object({
          x: z.number().min(0).nullable(),
          y: z.number().min(0).nullable(),
          width: z.number().min(1).nullable(),
          height: z.number().min(1).nullable(),
        }),
      }),
    }),
  }),
  additional_images: z.array(
    z.object({
      main_url: z.string().min(1),
      thumbnail_url: z.string().min(1),
      polaroid_url: z.string().min(1),
      main_width: z.number().min(1),
      main_height: z.number().min(1),
      display_width: z.number().min(1),
      display_height: z.number().min(1),
      description: z.string().min(1).nullable(),
    })
  ),
  youtube_video_id: z.string().min(1).nullable(),
  title: z.string().min(1),
  width: z.string().min(1), // float as string
  height: z.string().min(1), // float as string
  depth: z.string().min(1), // float as string
  description: z.string().min(1),
  total_likes: z.number().min(0),
  total_views: z.number().min(0),
  total_curation_votes: z.number().min(0),
  category: z.enum([
    'Collage',
    'Drawing',
    'Installation',
    'Mixed Media',
    'Painting',
    'Photography',
    'Printmaking',
    'Sculpture',
    'Digital',
  ]),
  subject: z.enum([
    'Abstract',
    'Aerial',
    'Aeroplane',
    'Airplane',
    'Animal',
    'Architecture',
    'Automobile',
    'Beach',
    'Bicycle',
    'Bike',
    'Boat',
    'Body',
    'Botanic',
    'Business',
    'Calligraphy',
    'Car',
    'Cartoon',
    'Cats',
    'Celebrity',
    'Children',
    'Cinema',
    'Cities',
    'Classical mythology',
    'Comics',
    'Cows',
    'Cuisine',
    'Culture',
    'Dogs',
    'Education',
    'Erotic',
    'Family',
    'Fantasy',
    'Fashion',
    'Fish',
    'Floral',
    'Food',
    'Food & Drink',
    'Garden',
    'Geometric',
    'Graffiti',
    'Health & Beauty',
    'Home',
    'Horse',
    'Humor',
    'Interiors',
    'Kids',
    'Kitchen',
    'Landscape',
    'Language',
    'Light',
    'Love',
    'Men',
    'Mortality',
    'Motor',
    'Motorbike',
    'Motorcycle',
    'Music',
    'Nature',
    'Nude',
    'Outer Space',
    'Patterns',
    'People',
    'Performing Arts',
    'Places',
    'Political',
    'Politics',
    'Pop Culture/Celebrity',
    'Popular culture',
    'Portrait',
    'Religion',
    'Religious',
    'Rural life',
    'Sailboat',
    'Science',
    'Science/Technology',
    'Seascape',
    'Seasons',
    'Ship',
    'Sport',
    'Sports',
    'Still Life',
    'Technology',
    'Time',
    'Train',
    'Transportation',
    'Travel',
    'Tree',
    'Typography',
    'Wall',
    'Water',
    'Women',
    'World Culture',
    'Yacht',
  ]),
  styles: z.array(
    z.enum([
      '3D Sculpture',
      'Abstract',
      'Abstract Expressionism',
      'Art Deco',
      'Conceptual',
      'Contemporary',
      'Cubism',
      'Dada',
      'Documentary',
      'Expressionism',
      'Figurative',
      'Fine Art',
      'Folk',
      'Fractal/Algorithmic',
      'Gaming',
      'Generative',
      'Glitch',
      'Graphics and Animation',
      'Illustration',
      'Impressionism',
      'Minimalism',
      'Modern',
      'Photorealism',
      'Pop Art',
      'Portraiture',
      'Realism',
      'Street Art',
      'Surrealism',
    ])
  ),
  mediums: z.array(
    z.enum([
      '3D Sculpting',
      'Acrylic',
      'Airbrush',
      'Algorithmic Art',
      'Aquatint',
      'Ballpoint Pen',
      'Black & White',
      'Bronze',
      'C-type',
      'Ceramic',
      'Chalk',
      'Charcoal',
      'Clay',
      'Color',
      'Colored Pencil',
      'Conte',
      'Crayon',
      'Decoupage',
      'Digital',
      'Drypoint',
      'Dye Transfer',
      'Enamel',
      'Encaustic',
      'Engraving',
      'Environmental',
      'Etching',
      'Fabric',
      'Fiber',
      'Fiberglass',
      'Found Objects',
      'Fractal',
      'Full spectrum',
      'Gelatin',
      'Gesso',
      'Giclée',
      'Glass',
      'Gouache',
      'Granite',
      'Graphite',
      'Household',
      'Ink',
      'Interactive',
      'Kinetic',
      'Latex',
      'Leather',
      'LED',
      'Lenticular',
      'Lights',
      'Linocuts',
      'Lithograph',
      'Manipulated',
      'Marble',
      'Marker',
      'Metal',
      'Mezzotint',
      'Mixed Media',
      'Monotype',
      'Mosaic',
      'Moving Images',
      'Neon',
      'Mixed Media',
      'NFT',
      'Oil',
      'Paint',
      'Paper',
      'Paper mache',
      'Pastel',
      'Pen and Ink',
      'Pencil',
      'Photo',
      'Photogram',
      'Photography',
      'Pinhole',
      'Plaster',
      'Plastic',
      'Platinum',
      'Polaroid',
      'Pottery',
      'Precious Materials',
      'Resin',
      'Robotics',
      'Rubber',
      'Screenprinting',
      'Silverpoint',
      'Sound',
      'Spray Paint',
      'Steel',
      'Stencil',
      'Stone',
      'Taxidermy',
      'Tempera',
      'Textile',
      'Timber',
      'Vector',
      'Video',
      'Watercolor',
      'Wax',
      'Wood',
      'Woodcut',
    ])
  ),
  keywords: z.array(z.string().min(1)),
  materials: z.array(z.enum(ARTWORK_MATERIALS)),
  has_original: z.boolean(),
  is_multipanel: z.boolean(),
  panels: z.number().min(1),
  is_safe: z.boolean(),
  visibility: z.enum(['published', 'draft']),
  has_open_editions: z.boolean(),
  has_limited_editions: z.boolean(),
  cheapest_print_price: z.number().min(1).nullable(),
  slug: z.string().min(1),
  url: z.string().min(1),
  products: z.array(
    z.object({
      // legacy_sku: z.string().min(1),
      sku: z.string().min(1),
      is_original: z.boolean(),
      is_open_edition_print: z.boolean(),
      is_limited_edition_print: z.boolean(),
      // is_aple: z.boolean(),
      price: z.number().min(1),
      width: z.string().min(1), // float as string
      height: z.string().min(1), // float as string
      depth: z.string().min(1), // float as string
      material: z.enum(['Fine Art Paper', 'Photo Paper', 'Canvas', '']),
      options: z.array(
        z.object({
          id: z.string().min(1),
          framing_type_id: z.number().min(1),
          extended_description: z.string().min(1),
          title: z.string().min(1),
          description: z.string().min(1),
          price: z.number().min(1),
          width: z.string().min(1), // int as string
          height: z.string().min(1), // int as string
          mat_size: z.number().min(1),
          framed_width: z.number().min(1).nullable(), // float
          framed_height: z.number().min(1).nullable(), // float
        })
      ).optional(),
      units_produced: z.number().min(1),
      is_sold_out: z.boolean(),
      is_reserved: z.boolean(),
      is_available_for_sale: z.boolean(),
      // id: z.number().min(1),
      original: z.object({
        aisp: z.object({
          freight_amount: z.number(),
          version: z.string(),
          bucket: z.string(),
        }),
        has_original_frame: z.boolean(),
        original_frame_color: z
          .enum(['black', 'brown', 'white', 'silver', 'gold', 'patina', 'other'])
          .nullable(),
        packaging_option: z.enum(['rolled', 'flat_cardboard', 'flat_crate']),
        is_ready_to_hang: z.boolean().nullable(),
        address_book_item_id: z.string().min(1),
        ships_from_country_code: z.string().length(2),
        ships_from_country_name: z.string().min(1),
        shipping_dimensions: z.object({
          dimensional_weight: z.number(),
          height: z.number().min(1),
          width: z.number().min(1),
          depth: z.number().min(0),
        }),
        days_to_produce: z.number().min(1).nullable(),
      }).optional(),
    }),
  ),
})

export { artworkDataParser }
