window.SEED_DATA = {
  pois: [
    {
      id: 'poi-1',
      name: 'Római-part Riverside Food Area',
      category: 'buffet',
      position: [47.5755, 19.0665],
      description: 'Popular riverside snack and refreshment area by the Danube.'
    },
    {
      id: 'poi-2',
      name: 'Szentendre Danube Launch',
      category: 'launch',
      position: [47.6735, 19.0735],
      description: 'Common launch point for paddling on the Szentendre branch.'
    },
    {
      id: 'poi-3',
      name: 'Danube Riverside Parking',
      category: 'parking',
      position: [47.6622, 19.0794],
      description: 'Convenient parking close to access point.'
    },
    {
      id: 'poi-4',
      name: 'Public Water Refill - North Danube Area',
      category: 'water_source',
      position: [47.7055, 19.0865],
      description: 'Water refill near the branch and riverside recreation zone.'
    },
    {
      id: 'poi-5',
      name: 'Velence Lake Shore Buffet',
      category: 'buffet',
      position: [47.2325, 18.655],
      description: 'Light food and drinks near the lake shore.'
    },
    {
      id: 'poi-6',
      name: 'Velence Paddle Access',
      category: 'launch',
      position: [47.225, 18.690],
      description: 'Lake launch/access point for kayaks and canoes.'
    },
    {
      id: 'poi-7',
      name: 'Tisza Riverside Camping',
      category: 'camping',
      position: [47.903, 20.414],
      description: 'Simple campsite near a demo Tisza section.'
    },
    {
      id: 'poi-8',
      name: 'Tisza Water Access',
      category: 'launch',
      position: [47.929, 20.365],
      description: 'Launch area for river paddling.'
    },
    {
      id: 'poi-9',
      name: 'Váh Riverside Snack Stop',
      category: 'buffet',
      position: [48.106, 17.999],
      description: 'Snack stop near the bordering Váh demo section.'
    },
    {
      id: 'poi-10',
      name: 'Danube Paddle Rental',
      category: 'rental',
      position: [47.548, 19.047],
      description: 'Boat rental/service close to the river.'
    },
    {
      id: 'poi-11',
      name: 'Riverside Restaurant - Budapest Section',
      category: 'restaurant',
      position: [47.556, 19.054],
      description: 'Sit-down food option near the Danube.'
    }
  ],

  waters: [
    {
      id: 'water-1',
      name: 'Danube - Budapest Section',
      type: 'river',
      centerline: [
        [47.620, 19.036],
        [47.596, 19.040],
        [47.574, 19.047],
        [47.548, 19.050],
        [47.522, 19.045],
        [47.494, 19.036],
        [47.455, 19.030]
      ],
      properties: {
        flow: 'moderate',
        current: 'steady',
        notes: 'Urban Danube section with boat traffic and embankments.'
      }
    },
    {
      id: 'water-2',
      name: 'Szentendre Branch',
      type: 'river_branch',
      centerline: [
        [47.748, 19.075],
        [47.726, 19.074],
        [47.703, 19.073],
        [47.679, 19.072],
        [47.655, 19.070],
        [47.640, 19.069]
      ],
      properties: {
        flow: 'light',
        current: 'gentle',
        notes: 'Calmer branch suited for recreational paddling.'
      }
    },
    {
      id: 'water-3',
      name: 'Lake Velence Demo Section',
      type: 'lake',
      centerline: [
        [47.236, 18.620],
        [47.232, 18.655],
        [47.225, 18.690],
        [47.221, 18.725],
        [47.218, 18.760]
      ],
      properties: {
        flow: 'still',
        current: 'minimal',
        notes: 'Lake environment with wind exposure.'
      }
    },
    {
      id: 'water-4',
      name: 'Tisza Demo Section',
      type: 'river',
      centerline: [
        [47.976, 20.295],
        [47.956, 20.330],
        [47.931, 20.365],
        [47.905, 20.405],
        [47.880, 20.448],
        [47.852, 20.500]
      ],
      properties: {
        flow: 'moderate',
        current: 'variable',
        notes: 'Wide river section with changing banks and gentle bends.'
      }
    },
    {
      id: 'water-5',
      name: 'Váh Bordering Demo Section',
      type: 'river',
      centerline: [
        [48.140, 17.981],
        [48.127, 17.989],
        [48.112, 17.997],
        [48.096, 18.004],
        [48.079, 18.015],
        [48.061, 18.022]
      ],
      properties: {
        flow: 'moderate',
        current: 'steady',
        notes: 'Border-region demo corridor for cross-border exploration context.'
      }
    }
  ],

  annotations: [
    {
      id: 'ann-1',
      type: 'obstacle',
      title: 'Low branch / overhanging obstacle',
      position: [47.677, 19.072],
      note: 'Take care when water level is high.'
    },
    {
      id: 'ann-2',
      type: 'crossing',
      title: 'Crossing corridor',
      position: [47.545, 19.046],
      note: 'Cross quickly due to motor traffic.'
    },
    {
      id: 'ann-3',
      type: 'hazard',
      title: 'Heavy boat wake zone',
      position: [47.502, 19.041],
      note: 'Expect larger wakes on busy days.'
    },
    {
      id: 'ann-4',
      type: 'portage',
      title: 'Short portage / rough bank',
      position: [47.907, 20.409],
      note: 'Landing can be muddy.'
    },
    {
      id: 'ann-5',
      type: 'lock_weir',
      title: 'Weir warning area',
      position: [48.098, 18.005],
      note: 'Do not approach directly.'
    },
    {
      id: 'ann-6',
      type: 'current_note',
      title: 'Outer bend stronger current',
      position: [47.574, 19.048],
      note: 'Current increases slightly here.'
    },
    {
      id: 'ann-7',
      type: 'flow_note',
      title: 'Seasonal shallow reeds',
      position: [47.223, 18.740],
      note: 'Lake edge becomes shallower in summer.'
    }
  ],

  routes: [
    {
      id: 'route-1',
      name: 'Danube Budapest Urban Paddle',
      points: [
        [47.596, 19.040],
        [47.575, 19.047],
        [47.548, 19.050],
        [47.524, 19.045]
      ],
      estimatedSpeedKmh: 6
    },
    {
      id: 'route-2',
      name: 'Szentendre Branch Relaxed Paddle',
      points: [
        [47.726, 19.074],
        [47.702, 19.073],
        [47.678, 19.072],
        [47.655, 19.070]
      ],
      estimatedSpeedKmh: 5
    },
    {
      id: 'route-3',
      name: 'Velence Lake Crossing Demo',
      points: [
        [47.234, 18.630],
        [47.229, 18.665],
        [47.224, 18.705],
        [47.220, 18.748]
      ],
      estimatedSpeedKmh: 5
    },
    {
      id: 'route-4',
      name: 'Tisza Gentle Section',
      points: [
        [47.956, 20.330],
        [47.931, 20.365],
        [47.905, 20.405],
        [47.882, 20.445]
      ],
      estimatedSpeedKmh: 5
    },
    {
      id: 'route-5',
      name: 'Váh Border Demo Run',
      points: [
        [48.127, 17.989],
        [48.112, 17.997],
        [48.096, 18.004],
        [48.079, 18.015]
      ],
      estimatedSpeedKmh: 5
    }
  ]
};
