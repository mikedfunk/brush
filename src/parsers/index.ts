import { artworkDataParser } from './artworkDataParser.js'
import { z } from 'zod'

const measurementSystemParser = z.enum(['INCH', 'CENTIMETER']).optional()
const favoriteArtworkIdsParser = z.array(z.number().min(1)).catch([]) // if it's empty, it will come in as {}. Change that to [].

const zendSessionDataParser = z.object({
  admin_full_name: z.string().min(1).optional(),
  adminId: z.number().min(1).optional(),
  check_in_timer_started_at: z.string().min(1).optional().nullable(),
  email: z.string().min(1),
  first_name: z.string().min(1),
  isEaselAdmin: z.boolean(),
  is_limited_artist: z.coerce.boolean(), // comes in as 0|1
  is_verified_to_sell: z.boolean().optional(),
  last_name: z.string(),
  id: z.number().min(1),
  username: z.string().min(1).nullable(),
  user_type_id: z.number().gte(1).lte(3),
})

const rawSessionDataParser = z.object({
  Zend_Auth: z
    .object({
      storage: z.object({
        body: zendSessionDataParser,
      }),
    })
    .optional(),
  Saatchi: z
    .object({
      userFavorites: favoriteArtworkIdsParser,
      measurementSystem: measurementSystemParser,
    })
    .optional(),
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
