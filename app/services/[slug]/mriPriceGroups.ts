// Categories and explicit variant pairs follow the supplied MRI price sheet.
// IDs refer to the shared price catalog; prices are never duplicated here.
export const MRI_PRICE_GROUPS = [
  {
    "id": "head",
    "label": "Головний мозок, голова",
    "text": "Головний мозок, судини, гіпофіз та органи зору.",
    "artwork": "/ct-area-cards/head.webp"
  },
  {
    "id": "neck",
    "label": "Пазухи носа та шия",
    "text": "Приносові пазухи, м’які тканини та щелепні суглоби.",
    "artwork": "/ct-area-cards/neck.webp"
  },
  {
    "id": "spine",
    "label": "Хребет",
    "text": "Окремі відділи хребта та комплексні протоколи.",
    "artwork": "/mri-area-cards/spine-v3.webp"
  },
  {
    "id": "upper",
    "label": "Верхні кінцівки",
    "text": "Суглоби плеча, ліктя, кисті та м’які тканини.",
    "artwork": "/mri-area-cards/upper-v3.webp"
  },
  {
    "id": "lower",
    "label": "Нижні кінцівки",
    "text": "Кульшові, колінні суглоби, гомілка та стопа.",
    "artwork": "/ct-area-cards/bones.webp"
  },
  {
    "id": "abdomen",
    "label": "Черевна порожнина",
    "text": "Органи живота та заочеревинного простору.",
    "artwork": "/ct-area-cards/abdomen.webp"
  },
  {
    "id": "pelvis",
    "label": "Органи малого таза",
    "text": "Дослідження органів малого таза у жінок і чоловіків.",
    "artwork": "/mri-area-cards/pelvis-v3.webp"
  },
  {
    "id": "special",
    "label": "Спеціальні дослідження",
    "text": "Спинний мозок, кілька ділянок та дифузія всього тіла.",
    "artwork": "/ct-area-cards/combined.webp"
  },
  {
    "id": "additional",
    "label": "Додаткові послуги",
    "text": "Повторний опис, 3D-моделювання та супровід МРТ.",
    "artwork": "/mri-area-cards/additional-v4.webp"
  }
] as const;
export type MriPriceGroupId = (typeof MRI_PRICE_GROUPS)[number]['id'];
export const MRI_PRICE_ROWS: Record<MriPriceGroupId, readonly (readonly number[])[]> = {
  "head": [
    [
      1,
      2
    ],
    [
      3,
      4
    ],
    [
      5,
      6
    ],
    [
      7,
      8
    ],
    [
      9
    ],
    [
      10
    ],
    [
      11,
      12
    ],
    [
      13,
      14
    ],
    [
      15,
      16
    ],
    [
      17,
      18
    ],
    [
      19,
      20
    ],
    [
      21,
      22
    ],
    [
      23,
      24
    ],
    [
      25,
      26
    ],
    [
      0,
      27
    ],
    [
      0,
      28
    ],
    [
      0,
      29
    ]
  ],
  "neck": [
    [
      30,
      31
    ],
    [
      32,
      33
    ],
    [
      34,
      35
    ],
    [
      36,
      39
    ],
    [
      37,
      38
    ],
    [
      60
    ],
    [
      61
    ]
  ],
  "spine": [
    [
      40,
      41
    ],
    [
      42
    ],
    [
      43,
      44
    ],
    [
      45,
      46
    ],
    [
      47,
      48
    ],
    [
      49,
      52
    ],
    [
      50,
      51
    ],
    [
      53,
      54
    ],
    [
      55
    ],
    [
      56,
      57
    ],
    [
      58
    ],
    [
      59
    ]
  ],
  "upper": [
    [
      70
    ],
    [
      71,
      72
    ],
    [
      73,
      74
    ],
    [
      75,
      76
    ],
    [
      77,
      78
    ],
    [
      79
    ]
  ],
  "lower": [
    [
      62,
      63
    ],
    [
      64,
      65
    ],
    [
      66,
      67
    ],
    [
      68,
      69
    ],
    [
      80,
      81
    ],
    [
      82,
      83
    ]
  ],
  "abdomen": [
    [
      84
    ],
    [
      85,
      86
    ],
    [
      87,
      88
    ],
    [
      0,
      89
    ],
    [
      0,
      90
    ],
    [
      91
    ],
    [
      0,
      92
    ],
    [
      0,
      93
    ],
    [
      94,
      95
    ]
  ],
  "pelvis": [
    [
      96,
      99
    ],
    [
      97,
      98
    ],
    [
      100,
      101
    ],
    [
      102,
      103
    ],
    [
      104
    ],
    [
      106,
      105
    ]
  ],
  "special": [
    [
      107,
      108
    ],
    [
      0,
      109
    ],
    [
      110,
      111
    ],
    [
      112
    ],
    [
      0,
      113
    ],
    [
      114,
      115
    ]
  ],
  "additional": [
    [
      116
    ],
    [
      117
    ],
    [
      118
    ],
    [
      119
    ],
    [
      120
    ],
    [
      121
    ],
    [
      122
    ],
    [
      123
    ]
  ]
};
