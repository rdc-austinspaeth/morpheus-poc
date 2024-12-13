let matchedPatterns = [];
let filterData = {};

const minPatterns = [
  /over/,
  /min/,
  /more/,
  /at least/,
  /\+/,
];

const maxPatterns = [
  /under/,
  /less/,
  /max/,
  /at most/,
];

const bothPatterns = [
  /\-/,
  /between/,
  /to/,
];

const schemas = [
  {
    attribute: 'new_construction',
    filterType: 'BOOLEAN',
    patterns: [
      /new homes/,
      /new construction/,
      /new builds/,
    ]
  },  
  {
    attribute: 'bed',
    filterType: 'MIN_MAX',
    patterns: [
      /bed/,
      /bd/,
      '\w*room(?<!bathroom)'
    ]
  },
  {
    attribute: 'bath',
    filterType: 'MIN_MAX',
    patterns: [
      /bath/,
    ]
  },
  {
    attribute: 'sqft',
    filterType: 'MIN_MAX',
    patterns: [
      /sqft/,
      /square feet/,
      /square foot/,
      /sq ft/,
      /square ft/,
      /sq feet/,
    ]
  },
  {
    attribute: 'price',
    filterType: 'PRICE',
    patterns: [
      /\d+k/,
      /\d+(\.?\d+)?m/,
      /\$\d+\.?\d+?/,
      /for under \$?\d+(\.\d+)?/,
      /for \$?\d+(\.\d+)?/,
      /under \$?\d{3,}(\.\d+)?/,
      /for over \$?\d+(\.\d+)?/,
      /for under \$?\d+(\.\d+)?/,
      /for less than \$?\d+(\.\d+)?/,
      /for more than \$?\d+(\.\d+)?/,
      /for at least \$?\d+(\.\d+)?/,
      /for at most \$?\d+(\.\d+)?/,
    ]
  },
  {
    attribute: 'propertyType',
    filterType: 'PROPERTY_TYPE',
    patterns: [
      /house/,
      /home/,
      /condo/,
      /townhome/,
      /town home/,
      /townhouse/,
      /town house/,
      /multi family/,
      /multi-family/,
      /mobile/,
      /farm/,
      /land/,
    ]
  },
  {
    attribute: 'garage',
    filterType: 'NUMERIC',
    patterns: [
      /garage/,
      /car port/,
      /carport/,
    ]
  },
  {
    attribute: 'ocean_view',
    filterType: 'BOOLEAN',
    patterns: [
      /ocean view/,
      /view of ocean/,
      /view of the ocean/,
    ]
  },
  {
    attribute: 'cul_de_sac',
    filterType: 'BOOLEAN',
    patterns: [
      /culdesac/,
      /cul-de-sac/,
      /cul de sac/,
    ]
  },
  {
    attribute: 'recently_sold',
    filterType: 'BOOLEAN',
    patterns: [
      /sold/,
      /off market/,
      /off-market/,
    ]
  },
  {
    attribute: 'pool',
    filterType: 'BOOLEAN',
    patterns: [
      /pool/,
    ]
  },
  {
    attribute: 'basement',
    filterType: 'BOOLEAN',
    patterns: [
      /basement/,
    ]
  },
  {
    attribute: 'air_conditioning',
    filterType: 'BOOLEAN',
    patterns: [
      /ac/,
      /a\/c/,
      /air conditioning/,
      /air conditioned/,
      /central air/,
      /heat pump/,
    ]
  },
  {
    attribute: 'gated',
    filterType: 'BOOLEAN',
    patterns: [
      /gate/,
      /private/,
    ]
  },
  {
    attribute: 'pond',
    filterType: 'BOOLEAN',
    patterns: [
      /pond/,
    ]
  },
];

const matchPrefix = (match, matchIndex, string) => {
  const currentMatchStart = match.location.start;
  const previousMatchEnd = matchIndex === 0 ? 0 : matchedPatterns[matchIndex - 1].location.end;
  return string.slice(previousMatchEnd, currentMatchStart);
}

const matchSuffix = (match, matchIndex, string) => {
  const currentMatchEnd = match.location.end;
  const nextMatchStart = matchedPatterns[matchIndex + 1]?.location.start;

  return string.slice(currentMatchEnd, nextMatchStart);
}

const getMinMaxValues = (match, matchIndex, string) => {
  const prefix = matchPrefix(match, matchIndex, string)?.toLowerCase().replace(',', '');
  const numeral = /\d+/g;
  const numeralMatch = [...prefix.matchAll(numeral)];

  const hasMin = minPatterns.some(minPattern => minPattern.test(prefix));
  const hasMax = maxPatterns.some(maxPattern => maxPattern.test(prefix));
  const hasBoth = bothPatterns.some(bothPatterns => bothPatterns.test(prefix));

  if ((hasMin && hasMax || hasBoth) && numeralMatch[0] && numeralMatch[0][0] && numeralMatch[1] && numeralMatch[1][0]) {
    const numerals = [numeralMatch[0][0], numeralMatch[1][0]].sort((a, b) => a - b);

    filterData[match.attribute] = {
      min: Number(numerals[0]),
      max: Number(numerals[1]),
    };
    
  } else if (hasMin && numeralMatch[0] && numeralMatch[0][0]) {
    filterData[match.attribute] = {
      min: numeralMatch[0] && Number(numeralMatch[0][0]),
    };
  } else if (hasMax && numeralMatch[0] && numeralMatch[0][0]) {
    filterData[match.attribute] = {
      max: numeralMatch[0] && Number(numeralMatch[0][0]),
    };
  } else if (numeralMatch[0]?.[0]) {
    filterData[match.attribute] = {
      min: numeralMatch[0] && Number(numeralMatch[0][0]),
      max: numeralMatch[0] && Number(numeralMatch[0][0]),
    };
  }
}

const getNumericValue = (match, matchIndex, string) => {
  const prefix = matchPrefix(match, matchIndex, string)?.toLowerCase();

  const numeral = /\d+/g;
  const numeralMatch = [...prefix.matchAll(numeral)];

  filterData[match.attribute] = Number(numeralMatch?.[0]?.[0]) || 1;
}

const getBooleanValue = (match, matchIndex) => {
  filterData[match.attribute] = true;
}

const getPropertyType = (match) => {
  const propertyType = () => {
    switch(match.matchedPattern.toLowerCase()) {
      case 'house':
      case 'home':
        return 'house';
      case 'condo':
        return 'condo';
      case 'townhome':
      case 'town home':
      case 'townhouse':
      case 'town house':
        return 'townhome';
      case 'multi family':
      case 'multi-family':
        return 'multi-family';
      case 'mobile':
        return 'mobile';
      case 'farm':
        return 'farm';
      case 'land':
        return 'land';
      default:
        return 'house';
    };
  }

  filterData[match.attribute] = propertyType();
}

const getPriceValue = (match, matchIndex, string) => {
  let numericalValue = 0;
  const prefix = matchPrefix(match, matchIndex, string)?.toLowerCase().replace(',', '');
  const suffix = matchSuffix(match, matchIndex, string)?.toLowerCase().replace(',', '');

  if (match.matchedPattern.toLowerCase().includes('k')) {
    const cleanedValue = match.matchedPattern.toLowerCase().replace('k', '');
    numericalValue = Number(cleanedValue + '000');
  } else if (match.matchedPattern.toLowerCase().includes('m')) {
    if (match.matchedPattern.toLowerCase()?.includes('.')) {
      const millionValue = match.matchedPattern.toLowerCase().replace('$', '').replace('m', '').replace(/[^\d\.]/g,'').split('.')[0];
      const thousandValue = match.matchedPattern.toLowerCase().replace('$', '').replace('m', '').replace(/[^\d\.]/g,'').split('.')[1];
      const missingZeros = millionValue.length + 6;
      numericalValue = Number((millionValue + thousandValue).padEnd(missingZeros, '0'));
    } else {
      const cleanedValue = match.matchedPattern.toLowerCase().replace('m', '');
      numericalValue = Number(cleanedValue + '000000');
    }
  } else {
    if (match.matchedPattern.toLowerCase()?.includes('.')) {
      const millionValue = match.matchedPattern.toLowerCase().replace('$', '').replace('m', '').replace(/[^\d\.]/g,'').split('.')[0];
      const thousandValue = match.matchedPattern.toLowerCase().replace('$', '').replace('m', '').replace(/^\d\./g,'').split('.')[1];
      const missingZeros = millionValue.length + 6;
      numericalValue = Number((millionValue + thousandValue).padEnd(missingZeros, '0'));
    } else {
      const numeral = /\d+/g;
      const numeralMatch = [...match.matchedPattern.matchAll(numeral)]?.[0]?.[0];
      numericalValue = Number(numeralMatch.padEnd(6, '0'));
    }
  }

  const hasMin = minPatterns.some(minPattern => minPattern.test(prefix + match.matchedPattern.toLowerCase()));
  const hasMax = maxPatterns.some(maxPattern => maxPattern.test(prefix + match.matchedPattern.toLowerCase()));
  const hasBoth = bothPatterns.some(bothPatterns => bothPatterns.test(prefix + match.matchedPattern.toLowerCase()));

  if ((hasMin && hasMax || hasBoth) && numericalValue) {
    filterData[match.attribute] = {
      min: Number(numericalValue),
      max: Number(numericalValue),
    };
    
  } else if (hasMin && numericalValue) {
    filterData[match.attribute] = {
      min: numericalValue,
    };
  } else if (hasMax && numericalValue) {
    filterData[match.attribute] = {
      max: numericalValue,
    };
  } else if (numericalValue) {
    filterData[match.attribute] = {
      min: numericalValue,
      max: numericalValue,
    };
  }
}

const getValues = (string) => {
  matchedPatterns.forEach((match, matchIndex) => {
    switch(match.schema.filterType) {
      case 'MIN_MAX':
        return getMinMaxValues(match, matchIndex, string);
      case 'PRICE':
        return getPriceValue(match, matchIndex, string);
      case 'NUMERIC':
        return getNumericValue(match, matchIndex, string);
      case 'BOOLEAN':
        return getBooleanValue(match, matchIndex, string);
      case 'PROPERTY_TYPE':
        return getPropertyType(match);
    }
  });
};

self.onmessage = (event) => {
  const { string } = event.data;
  const lowerCaseString = string.toLowerCase();

  schemas.forEach(schema => {
    const regexPatterns = schema.patterns.map(pattern => new RegExp(pattern, 'g'));
    regexPatterns.every(pattern => {
      const matches = [...lowerCaseString.matchAll(pattern)];

      if (matches.length > 0) {
        matchedPatterns.push({
          attribute: schema.attribute,
          schema: schema,
          location: {
            start: matches[0].index,
            end: matches[0].index + matches[0][0].length,
          },
          matchedPattern: matches[0][0],
        });

        return false;
      }

      return true;
    });
  });

  matchedPatterns.sort((a, b) => a.location.start - b.location.start);
  getValues(string);

  const filteredData = () => {
    for(let i in filterData) {
      return filterData;
    }
    return null;
  }

  self.postMessage(filteredData());
}
