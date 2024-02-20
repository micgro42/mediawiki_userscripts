window.mockData = new Map();

/**
 * Add data based on Wikidata.org here,
 * because the Properties and Items are resolved against www.wikidata.org,
 * but not the statements themselves
 */

window.mockData.set('pointInTime', {
  mainsnak: {
    snaktype: 'value',
    property: 'P585',
    hash: 'd82094fb60c5eac7fdde794199b5e72ff273acec',
    datavalue: {
      value: {
        time: '+2023-07-08T00:00:00Z',
        timezone: 0,
        before: 0,
        after: 0,
        precision: 11,
        calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
      },
      type: 'time',
    },
    datatype: 'time',
  },
  type: 'statement',
  id: 'Q4115189$af306371-96b5-4af4-a314-0600b9ffa6fe',
  rank: 'normal',
});

window.mockData.set('quantityWithUnit', {
  mainsnak: {
    snaktype: 'value',
    property: 'P1106',
    hash: '14c279997065d1903e34d71c027f7a77dd7b3b69',
    datavalue: {
      value: {
        amount: '+7',
        unit: 'http://www.wikidata.org/entity/Q11573',
      },
      type: 'quantity',
    },
    datatype: 'quantity',
  },
  type: 'statement',
  qualifiers: {
    P370: [
      {
        snaktype: 'value',
        property: 'P370',
        hash: '42b37f494795acb3d5cb0f88357fa538394194f7',
        datavalue: {
          value: 'abc',
          type: 'string',
        },
        datatype: 'string',
      },
    ],
    P578: [
      {
        snaktype: 'value',
        property: 'P578',
        hash: 'b7e75521013b07bb5a8eaa54151253734da0091a',
        datavalue: {
          value: {
            time: '+2024-01-23T00:00:00Z',
            timezone: 0,
            before: 0,
            after: 0,
            precision: 11,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: 'time',
        },
        datatype: 'time',
      },
    ],
  },
  'qualifiers-order': ['P370', 'P578'],
  id: 'Q4115189$c50b80e7-4494-5635-1e7f-555997e2a8e6',
  rank: 'normal',
  references: [
    {
      hash: 'b2af1ed2290abf645c5e12a8372b3abd115d95ae',
      snaks: {
        P855: [
          {
            snaktype: 'value',
            property: 'P855',
            hash: '86ebfaffea7a0c3e1e518bdaa26d9220ae780a54',
            datavalue: {
              value: 'https://example.com',
              type: 'string',
            },
            datatype: 'url',
          },
        ],
        P2536: [
          {
            snaktype: 'value',
            property: 'P2536',
            hash: '41cea2ae4a8122ec5f4d6ed50eac9e614ecc279d',
            datavalue: {
              value: '123def',
              type: 'string',
            },
            datatype: 'external-id',
          },
        ],
      },
      'snaks-order': ['P855', 'P2536'],
    },
  ],
});

window.mockData.set('quantityWithoutUnit', {
  mainsnak: {
    snaktype: 'value',
    property: 'P1132',
    hash: '5796696af615644841321d5826d30551cbf2fb7e',
    datavalue: {
      value: {
        amount: '+167',
        unit: '1',
      },
      type: 'quantity',
    },
    datatype: 'quantity',
  },
  type: 'statement',
  qualifiers: {
    P276: [
      {
        snaktype: 'value',
        property: 'P276',
        hash: '571f3c097f8f7a19a635b60617eaeb9fb8f63201',
        datavalue: {
          value: {
            'entity-type': 'item',
            'numeric-id': 529711,
            id: 'Q529711',
          },
          type: 'wikibase-entityid',
        },
        datatype: 'wikibase-item',
      },
    ],
  },
  'qualifiers-order': ['P276'],
  id: 'Q4115189$44d2387d-687f-46df-a792-5338cb4a58ff',
  rank: 'normal',
});

window.mockData.set('quantityWithBounds', {
  mainsnak: {
    snaktype: 'value',
    property: 'P1106',
    hash: '46f67b29c91430a2794cdc1aeedc7bf5b71c6335',
    datavalue: {
      value: {
        amount: '+888',
        unit: 'http://www.wikidata.org/entity/Q11573',
        upperBound: '+890',
        lowerBound: '+886',
      },
      type: 'quantity',
    },
    datatype: 'quantity',
  },
  type: 'statement',
  qualifiers: {
    P370: [
      {
        snaktype: 'value',
        property: 'P370',
        hash: '42b37f494795acb3d5cb0f88357fa538394194f7',
        datavalue: {
          value: 'abc',
          type: 'string',
        },
        datatype: 'string',
      },
    ],
    P578: [
      {
        snaktype: 'value',
        property: 'P578',
        hash: 'b7e75521013b07bb5a8eaa54151253734da0091a',
        datavalue: {
          value: {
            time: '+2024-01-23T00:00:00Z',
            timezone: 0,
            before: 0,
            after: 0,
            precision: 11,
            calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
          },
          type: 'time',
        },
        datatype: 'time',
      },
    ],
  },
  'qualifiers-order': ['P370', 'P578'],
  id: 'Q4115189$c50b80e7-4494-5635-1e7f-555997e2a8e6',
  rank: 'normal',
  references: [
    {
      hash: 'b2af1ed2290abf645c5e12a8372b3abd115d95ae',
      snaks: {
        P855: [
          {
            snaktype: 'value',
            property: 'P855',
            hash: '86ebfaffea7a0c3e1e518bdaa26d9220ae780a54',
            datavalue: {
              value: 'https://example.com',
              type: 'string',
            },
            datatype: 'url',
          },
        ],
        P2536: [
          {
            snaktype: 'value',
            property: 'P2536',
            hash: '41cea2ae4a8122ec5f4d6ed50eac9e614ecc279d',
            datavalue: {
              value: '123def',
              type: 'string',
            },
            datatype: 'external-id',
          },
        ],
      },
      'snaks-order': ['P855', 'P2536'],
    },
  ],
});
