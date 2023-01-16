import { z } from 'zod'

const measurementSystemParser = z.enum(['INCH', 'CENTIMETER']).optional()

// const favoriteArtworkIdsParser = z.union([ // either or
//   z.object({}),
//   z.array(z.number())
// ])
const favoriteArtworkIdsParser = z.array(z.number()).catch([]) // if it's empty, it will come in as {}. Change that to [].

const zendSessionDataParser = z.object({
  admin_full_name: z.string().optional(),
  adminId: z.number().optional(),
  check_in_timer_started_at: z.string().optional(),
  email: z.string(),
  first_name: z.string(),
  isEaselAdmin: z.boolean(),
  is_limited_artist: z.coerce.boolean(), // comes in as 0|1
  is_verified_to_sell: z.boolean().optional(),
  last_name: z.string(),
  id: z.number(),
  username: z.string().nullable(),
  user_type_id: z.number().gte(1).lte(2),
})

const rawSessionDataParser = z.object({
  Zend_Auth: z.object({
    storage: z.object({
      body: zendSessionDataParser,
    })
  }).optional(),
  Saatchi: z.object({
    userFavorites: favoriteArtworkIdsParser,
    measurementSystem: measurementSystemParser,
  }).optional(),
})

const artworkDataParser = z.object({
  artwork_id: z.string(),
  is_legacy_artwork: z.boolean(),
  legacy_user_art_id: z.number(),
  user_id: z.number(),
  created_at: z.number(),
  uploaded_at: z.number(),
  modified_at: z.number(),
  year_produced: z.number(),
  is_deleted: z.boolean(),
  artwork_image: z.object({
    main_url: z.string(),
    thumbnail_url: z.string(),
    polaroid_url: z.string(),
    fullscreen_url: z.string(),
    original_width: z.number(),
    original_height: z.number(),
    crops: z.object({
      studio: z.object({
        square: z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
        print: z.object({
          x: z.number().nullable(),
          y: z.number().nullable(),
          width: z.number().nullable(),
          height: z.number().nullable(),
        }),
      }),
    }),
  }),
  additional_images: z.array(z.object({})),
  youtube_video_id: z.string().nullable(),
  title: z.string(),
  width: z.string(),
  height: z.string(),
  depth: z.string(),
  description: z.string(),
  total_likes: z.number(),
  total_views: z.number(),
  total_curation_votes: z.number(),
  category: z.string(),
  subject: z.string(),
  styles: z.array(z.string()),
  mediums: z.array(z.string()),
  keywords: z.array(z.string()),
  materials: z.array(z.string()),
  has_original: z.boolean(),
  is_multipanel: z.boolean(),
  panels: z.number(),
  is_safe: z.boolean(),
  visibility: z.enum(['published', 'draft']),
  has_open_editions: z.boolean(),
  has_limited_editions: z.boolean(),
  cheapest_print_price: z.number().nullable(),
  slug: z.string(),
  url: z.string(),
  products: z.array(z.object({})),
})

const sessionDataParser = zendSessionDataParser.extend({
  userFavorites: favoriteArtworkIdsParser,
  measurementSystem: measurementSystemParser,
})

export {
  sessionDataParser,
  measurementSystemParser,
  favoriteArtworkIdsParser,
  zendSessionDataParser,
  rawSessionDataParser,
  artworkDataParser,
}
