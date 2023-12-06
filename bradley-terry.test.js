const { getGeometricMean, getIndividualProbability } = require('./bradley-terry');

test('geometric mean', () => {
    const object = {
        '1': 0.429,
        '2': 1.172,
        '3': 0.557,
        '4': 1.694
    }

    expect(Math.abs(0.83 - getGeometricMean(object))).toBeLessThan(0.001)
})

test('individual probability', () => {
    const map = {
        "wins": ["Middle Tennessee", "South Florida", "Ole Miss"],
        "losses": ["Texas"]
    }

    const probMap = {
        "Alabama": 1,
        "Middle Tennessee": 1,
        "South Florida": 1,
        "Ole Miss": 1,
        "Texas": 1
    }

    const prob2Map = {
        "Alabama": 0.5,
        "Middle Tennessee": 0.5,
        "South Florida": 0.5,
        "Ole Miss": 0.5,
        "Texas": 0.5
    }

    expect(getIndividualProbability(map, probMap, 1)).toBe(1);
})