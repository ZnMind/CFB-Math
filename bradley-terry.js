const fs = require('fs');

// Free API's don't allow too many calls,
// so I wrote the results to a 39k line JSON file
const gameJson = require('./json');

// Taking raw JSON from API and converting it to a win/loss format
const buildMap = () => {
    const map = {};
    const data = gameJson['2023'];
    data.forEach(element => {
        map[element['home_team']] = map[element['home_team']] || { "wins": [], "losses": [] };
        map[element['away_team']] = map[element['away_team']] || { "wins": [], "losses": [] };

        if (element['home_points'] > element['away_points']) {
            map[element['home_team']]['wins'].push(element['away_team']);
            map[element['away_team']]['losses'].push(element['home_team']);
        } else {
            map[element['home_team']]['losses'].push(element['away_team']);
            map[element['away_team']]['wins'].push(element['home_team']);
        }
    });
    
    // Ordering by win count
    const ordered = {};
    Object.keys(map).sort((a, b) => {
        return map[b]['wins'].length - map[a]['wins'].length;
    }).forEach(el => {
        ordered[el] = map[el];
    })

    let stringify = JSON.stringify(ordered);
    fs.writeFile(`json/winloss.json`, stringify, (err) => {
        if (err) {
            console.log(err);
        }
    })
    return ordered;
}

// Setting all initial probabilities to 1
const buildProbabilityMap = (map) => {
    const probabilityMap = {};
    Object.keys(map).forEach(x => {
        probabilityMap[x] = 1;
    })
    return probabilityMap;
}

// Calculating individual probabilities with respect to opponent probabilities.
// I had to set the initial denominator to 1 because undefeated teams result in dividing by 0.
// That isn't strictly in line with the model, but that's just CFB for ya.
const getIndividualProbability = (team, probabilityMap, prob) => {
    let numerator = 0, denominator = 1;
    team['wins'].forEach(el => {
        let p = probabilityMap[el];
        if (prob + p === 0) {
            numerator += 0;
        } else {
            numerator += p / (prob + p);
        }
    });
    team['losses'].forEach(el => {
        let p = probabilityMap[el];
        if (prob + p === 0) {
            denominator += 0;
        } else {
            denominator += 1 / (prob + p);
        }
    });

    return denominator !== 0 ? numerator / denominator : numerator / 1;
}

// By nature the geometric mean will be 0 if any of the dataset is 0.
// There are several ways to circumvent this, but I chose to leave
// out the 0 values when getting the mean.
const getGeometricMean = (probabilityMap) => {
    let count = 0, prod = 1;
    Object.values(probabilityMap).forEach(x => {
        if (x !== 0) {
            prod *= x;
            count++;
        }
    });
    return Math.pow(prod, 1 / count);
}

// Calculating probabilities and then dividing by the geometric mean for all teams
const bradleyTerryModel = (map, probabilityMap) => {
    const tempMap = {};
    Object.keys(probabilityMap).forEach(el => {
        let team = map[el];
        tempMap[el] = getIndividualProbability(team, probabilityMap, probabilityMap[el]);
    });

    let mean = getGeometricMean(probabilityMap);
    Object.keys(probabilityMap).forEach(el => {
        probabilityMap[el] = tempMap[el] / mean;
    });
}

(mainLoop = () => {
    const map = buildMap();
    const probabilityMap = buildProbabilityMap(map);

    // Running calculations until results start to rapidly converge (10)
    for (let i = 0; i < 10; i++) {
        bradleyTerryModel(map, probabilityMap);
    }

    // Sorting by strongest
    let obj = {};
    Object.keys(probabilityMap).sort((a, b) => probabilityMap[b] - probabilityMap[a]).forEach(x => {
        obj[x] = probabilityMap[x];
    });
    
    let stringify = JSON.stringify(obj);
    fs.writeFile(`json/bradley-terry.json`, stringify, (err) => {
        if (err) {
            console.log(err);
        }
    })
})();

module.exports = {
    getGeometricMean,
    getIndividualProbability
}