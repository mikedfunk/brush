import { afterEach, describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import { artworkDataParser } from '../../parser/index.js'
import { getArtworkDataByArtworkId } from './index.js'

describe('paintApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('gets artwork data by artwork id', async () => {
    const artworkJson: z.infer<typeof artworkDataParser> = {
      artwork_id: '3353900',
      // is_legacy_artwork: false,
      legacy_user_art_id: 3353900,
      user_id: 808363,
      // created_at: 1677906573,
      // uploaded_at: 1677906573,
      // modified_at: 1677906573,
      year_produced: 2020,
      is_deleted: false,
      artwork_image: {
        main_url: 'http://www.saatchiart.com/art.jpg',
        thumbnail_url: 'http://www.saatchiart.com/art-t.jpg',
        polaroid_url: 'http://www.saatchiart.com/art-p.jpg',
        // fullscreen_url: 'http://www.saatchiart.com/art-f.jpg',
        original_width: 20,
        original_height: 20,
        crops: {
          studio: {
            square: {
              x: 0,
              y: 0,
              width: 10,
              height: 10,
            },
            print: {
              x: 0,
              y: 0,
              width: 10,
              height: 10,
            },
          },
        },
      },
      additional_images: [
        {
          main_url: 'http://my-url',
          thumbnail_url: 'http://my-url',
          polaroid_url: 'http://my-url',
          main_width: 20,
          main_height: 20,
          display_width: 20,
          display_height: 20,
          description: null,
        },
      ],
      youtube_video_id: null,
      title: 'My Art',
      width: '20',
      height: '20',
      depth: '1',
      description: 'I like turtles',
      total_likes: 1,
      total_views: 1,
      total_curation_votes: 1,
      category: 'Painting',
      subject: 'Landscape',
      styles: ['Abstract'],
      mediums: ['Paint'],
      keywords: ['AAA', 'BBB', 'CCC', 'DDD', 'EEE'],
      materials: ['Canvas'],
      has_original: true,
      is_multipanel: false,
      panels: 1,
      is_safe: true,
      visibility: 'published',
      has_open_editions: false,
      has_limited_editions: false,
      cheapest_print_price: 1,
      slug: 'my-art',
      url: 'https://www.saatchiart.com/my-art',
      products: [
        {
          // legacy_sku: 'P1-U2-A3',
          sku: 'P1-U2-A3-T1',
          is_original: true,
          is_open_edition_print: false,
          is_limited_edition_print: false,
          // is_aple: false,
          price: 2000_00,
          width: '20.0',
          height: '20.0',
          depth: '20.0',
          material: 'Canvas',
          options: [],
          units_produced: 1,
          is_sold_out: false,
          is_reserved: false,
          is_available_for_sale: true,
          // id: 1,
          original: {
            aisp: {
              freight_amount: 100_00,
              version: 'v1',
              bucket: 'b1',
            },
            has_original_frame: false,
            original_frame_color: null,
            packaging_option: 'rolled',
            is_ready_to_hang: null,
            address_book_item_id: 'abc123',
            ships_from_country_code: 'US',
            ships_from_country_name: 'United States',
            shipping_dimensions: {
              dimensional_weight: 20,
              height: 20,
              width: 20,
              depth: 1,
            },
            days_to_produce: null,
          },
        },
        {
          // legacy_sku: 'P111-U2-A3',
          sku: 'P1111-U2-A3-T2',
          is_original: false,
          is_open_edition_print: true,
          is_limited_edition_print: false,
          // is_aple: false,
          price: 2000_00,
          width: '20.0',
          height: '20.0',
          depth: '20.0',
          material: 'Fine Art Paper',
          options: [
            {
              id: 'F1',
              framing_type_id: 9,
              extended_description: 'My Extended Desc',
              title: 'White Frame',
              description: 'White wood frame',
              price: 10_00,
              width: '20.0',
              height: '20.0',
              mat_size: 10,
              framed_width: 20,
              framed_height: 20,
            },
          ],
          units_produced: 1,
          is_sold_out: false,
          is_reserved: false,
          is_available_for_sale: true,
          // id: 2,
        },
      ],
    }

    const responseJson = { data: artworkJson }

    const fetch = vi.fn()
    const response = { status: 200, json: vi.fn() }
    response.json.mockResolvedValue(responseJson)
    fetch.mockResolvedValue(response)
    global.fetch = fetch

    const result = await getArtworkDataByArtworkId('3353900')

    expect(result).toEqual(responseJson)
    expect(fetch).toHaveBeenCalledWith('http://paint.nginx/browsing/artwork/3353900')
    expect(response.json).toHaveBeenCalledWith()
  })
})
