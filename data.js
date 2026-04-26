window.SEED_DATA = {
  pois: [
    {
      id: 'poi-1',
      name: 'Duna-parti Büfé',
      category: 'buffet',
      position: [47.4979, 19.0452],
      description: 'Quick food and drinks close to launch area.'
    },
    {
      id: 'poi-2',
      name: 'Római-part Restaurant',
      category: 'restaurant',
      position: [47.5718, 19.0647],
      description: 'Popular riverside restaurant.'
    },
    {
      id: 'poi-3',
      name: 'Public Water Tap',
      category: 'water_source',
      position: [47.706, 19.126],
      description: 'Fresh water refill point.'
    },
    {
      id: 'poi-4',
      name: 'Tisza Riverside Camping',
      category: 'camping',
      position: [47.902, 20.377],
      description: 'Basic camping near paddle section.'
    },
    {
      id: 'poi-5',
      name: 'Kayak Launch - Szentendre Branch',
      category: 'launch',
      position: [47.673, 19.075],
      description: 'Easy launch/slip access.'
    },
    {
      id: 'poi-6',
      name: 'Parking by the River',
      category: 'parking',
      position: [47.661, 19.08],
      description: 'Good place to leave a car before paddling.'
    },
    {
      id: 'poi-7',
      name: 'Danube Paddle Rental',
      category: 'rental',
      position: [47.548, 19.049],
      description: 'Kayak/canoe rental and basic service.'
    },
    {
      id: 'poi-8',
      name: 'Váh Riverside Buffet',
      category: 'buffet',
      position: [48.107, 17.996],
      description: 'Snack stop near Slovak section.'
    }
  ],

  waters: [
    {
      id: 'water-1',
      name: 'Danube - Budapest Section',
      type: 'river',
      centerline: [
        [47.620, 19.040],
        [47.570, 19.050],
        [47.520, 19.045],
        [47.490, 19.040],
        [47.450, 19.030]
      ],
      properties: {
        flow: 'moderate',
        current: 'steady',
        notes: 'Urban river section with heavy traffic; watch motorboats.'
      }
    },
    {
      id: 'water-2',
      name: 'Szentendre Branch',
      type: 'river_branch',
      centerline: [
        [47.750, 19.090],
        [47.710, 19.080],
        [47.680, 19.074],
        [47.640, 19.070]
      ],
      properties: {
        flow: 'light',
        current: 'gentle',
        notes: 'Popular paddle section, calmer than main Danube.'
      }
    },
    {
      id: 'water-3',
      name: 'Lake Velence Demo Section',
      type: 'lake',
      centerline: [
        [47.240, 18.620],
        [47.230, 18.660],
        [47.220, 18.720],
        [47.210, 18.770]
      ],
      properties: {
        flow: 'still',
        current: 'minimal',
        notes: 'Lake paddling with wind exposure.'
      }
    },
    {
      id: 'water-4',
      name: 'Tisza Demo Section',
      type: 'river',
      centerline: [
        [47.980, 20.300],
        [47.930, 20.360],
        [47.890, 20.420],
        [47.850, 20.500]
      ],
      properties: {
        flow: 'moderate',
        current: 'variable',
        notes: 'Wide river section with changing banks.'
      }
    },
    {
      id: 'water-5',
      name: 'Váh Bordering Demo Section',
      type: 'river',
      centerline: [
        [48.140, 17.980],
        [48.120, 17.990],
        [48.100, 18.000],
        [48.070, 18.020]
      ],
      properties: {
        flow: 'moderate',
        current: 'steady',
        notes: 'Border-region demo water corridor.'
      }
    }
  ],

  annotations: [
    {
      id: 'ann-1',
      type: 'obstacle',
      title: 'Low bridge clearance',
      position: [47.676, 19.073],
      note: 'Watch water level before passing.'
    },
    {
      id: 'ann-2',
      type: 'crossing',
      title: 'Possible crossing channel',
      position: [47.544, 19.046],
      note: 'Cross quickly due to boat traffic.'
    },
    {
      id: 'ann-3',
      type: 'hazard',
      title: 'Motorboat traffic zone',
      position: [47.500, 19.043],
      note: 'Busy especially on weekends.'
    },
    {
      id: 'ann-4',
      type: 'portage',
      title: 'Short portage section',
      position: [47.925, 20.395],
      note: 'Rocky bank, use caution.'
    },
    {
      id: 'ann-5',
      type: 'lock_weir',
      title: 'Weir warning',
      position: [48.098, 18.005],
      note: 'Do not approach directly.'
    },
    {
      id: 'ann-6',
      type: 'current_note',
      title: 'Faster current in outer bend',
      position: [47.574, 19.049],
      note: 'Can speed up downstream travel.'
    },
    {
      id: 'ann-7',
      type: 'flow_note',
      title: 'Low summer water levels',
      position: [47.220, 18.700],
      note: 'Some reed areas become shallow.'
    }
  ],

  routes: [
    {
      id: 'route-1',
      name: 'Budapest Easy Paddle',
      points: [
        [47.571, 19.062],
        [47.555, 19.056],
        [47.536, 19.049],
        [47.515, 19.045]
      ],
      estimatedSpeedKmh: 6
    },
    {
      id: 'route-2',
      name: 'Szentendre Relaxed Branch',
      points: [
        [47.715, 19.082],
        [47.695, 19.079],
        [47.675, 19.074],
        [47.650, 19.071]
      ],
      estimatedSpeedKmh: 5
    }
  ]
}
