const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const gameJson = require('./json');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

const spreadsheetId = "1ZNrG9KXu2seOHq_aFIenB4l1lQAf3DTsaAKWERIA9pU";

const postData = async (user, values) => {
    await updateValParams(user, spreadsheetId, `2023!A3`, 'USER_ENTERED', values)
}

const updateValParams = async (auth, spreadsheetId, range, valueInputOption, values) => {
    const sheets = google.sheets({ version: 'v4', auth });
    const resource = {
        values,
    };

    try {
        const result = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption,
            resource,
        })

        console.log('%d cells updated.', result.data.updatedCells);
        return result;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

const getElo = (k, rating1, result1, rating2, result2) => {
    const exp1 = 1 / (1 + Math.pow(10, (rating2 - rating1) / 480));
    const exp2 = 1 / (1 + Math.pow(10, (rating1 - rating2) / 480));

    const new1 = rating1 + k * (result1 - exp1);
    const new2 = rating2 + k * (result2 - exp2);

    return [rating1, new1, rating2, new2];
}

const formatData = (data) => {
    const res = [];
    res.push(['Week: 1']);
    const arr = data['2023'];
    const searchFor = ['home_team', 'home_conference', 'home_points', 'away_points', 'away_conference', 'away_team'];

    const teams = {};

    arr.forEach((element, i) => {
        const temp = [];
        teams[element['home_team']] = (teams[element['home_team']] || 1200);
        teams[element['away_team']] = (teams[element['away_team']] || 1200);

        searchFor.forEach(el => {
            temp.push(element[el])
        })

        let elo;
        if (element['home_points'] > element['away_points']) {
            elo = getElo(64, teams[element['home_team']], 1, teams[element['away_team']], 0)
        } else {
            elo = getElo(64, teams[element['home_team']], 0, teams[element['away_team']], 1)
        }

        const newGroup = () => {
            return ['', element['home_team'], elo[0], elo[1], '', element['away_team'], elo[2], elo[3]];
        }

        temp.push(...newGroup());

        teams[element['home_team']] = elo[1];
        teams[element['away_team']] = elo[3];

        if (i > 0 && arr[i - 1]['week'] < element['week']) {
            res.push([`Week: ${element['week']}`]);
        }
        res.push(temp);
    })

    console.log(res);
    return res;
}

(async () => {
    const user = await authorize();
    const games = formatData(gameJson);
    //console.log(gameJson);
    /* let testing = getElo(32, 1200, 0, 1200, 1);
    console.log(testing); */
    postData(user, games);
})();