const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');

const year = 2023; 

const api_key = process.env.API_KEY;

const fetchGames = async () => {
    const url = `https://api.collegefootballdata.com/games?year=${year}&seasonType=regular&division=fbs`
    const headers = {
        "Authorization": `Bearer ${api_key}`,
        "Accept": "application/json"
    }
    const data = await fetch(url, { headers: headers })
    const res = await data.json();
    console.log(res);
    let string = JSON.stringify(res);
    fs.writeFile(`json/${year}.json`, string, (err) => {
        if (err) {
            console.log(err);
        }
    })
}

fetchGames();