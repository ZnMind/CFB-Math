const fs = require('fs');
const records = require('./json');

const formatWL = () => {
    const map = {};
    const data = records['winloss'];
    
    Object.keys(data).forEach(el => {
        map[el] = [data[el]['wins'].length, data[el]['losses'].length];
    })
    
    return map;
}

const getSos = () => {
    const recordMap = formatWL();
    const data = records['winloss'];
    const map = {};

    Object.keys(data).forEach(el => {
        let wins = 0, losses = 0;
        data[el]['wins'].forEach(team => {
            wins += recordMap[team][0];
            losses += recordMap[team][1];
        })

        let sov;
        if (wins + losses === 0) {
            sov = 0;
        } else {
            sov = Math.floor((wins / (wins + losses)) * 1000) / 1000;
        }
        
        data[el]['losses'].forEach(team => {
            wins += recordMap[team][0];
            losses += recordMap[team][1];
        })
        let sos = Math.floor((wins / (wins + losses)) * 1000) / 1000;

        map[el] = { "SoV": sov, "SoS": sos };
    })

    let stringify = JSON.stringify(map);
    fs.writeFile(`json/sov.json`, stringify, (err) => {
        if (err) {
            console.log(err);
        }
    })
}
getSos();