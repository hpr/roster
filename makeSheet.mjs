import fs from 'fs';
import { stringify } from 'csv-stringify/sync';

const evts = JSON.parse(fs.readFileSync('9470-startListsMk2.json', { encoding: 'utf8' })).d.b.d;

const CATS = [{
  name: 'Sprints',
  1: '100m',
  4: '100m Hurdles',
  5: '110m Hurdles',
  6: '400m Hurdles',
  3: '400m',
  2: '200m',
}, {
  name: 'Distance',
  24: '3000m Steeplechase',
  21: '1500m',
  23: '10000m',
  25: 'Marathon',
  20: '800m',
  22: '5000m',
  32: '20K Racewalk',
  2234: '35K Racewalk',
}, {
  name: 'Throws',
  51: 'Hammer Throw',
  50: 'Shot Put',
  52: 'Discus Throw',
  53: 'Javelin Throw',
}, {
  name: 'Jumps',
  40: 'High Jump',
  42: 'Pole Vault',
  41: 'Long Jump',
  43: 'Triple Jump',
}];
const OTHER = {
  2140: 'Heptathlon',
}
const SEX = ['Male', 'Female'];
const NONE = 'None';

// console.log(Object.keys(evts).sort((a, b) => evts[a].startDateTime - evts[b].startDateTime).map(id => [id, evts[id].eventIdFk, new Date(evts[id].startDateTime)]));

const athletes = Object.values(evts).filter(evt => evt.combinedType === NONE && evt.entries).flatMap(evt => Object.values(evt.entries).map(ath => ({ ...ath, eventIdFk: evt.eventIdFk, event: (CATS.find(cat => evt.eventIdFk in cat) ?? {})[evt.eventIdFk], price: '$' + ath.price }))).map(ath => ({ ...ath, nameAndEvent: `${ath.firstName} ${ath.lastName} (${ath.event})` }));

for (const cat of CATS) {
  for (const sex of SEX) {
    fs.writeFileSync(`output/${cat.name}_${sex}.csv`, stringify(athletes.filter(ath => Object.keys(cat).includes(ath.eventIdFk + '') && ath.gender === sex).sort((a, b) => +b.price.slice(1) - +a.price.slice(1)), {
      header: true,
      columns: [ 'athleteCountryCode', 'nameAndEvent', 'price' ],
    }));
  }
}

fs.writeFileSync(`output/All Data (For Stat Nerds).csv`, stringify(athletes.sort((a, b) => +b.price.slice(1) - +a.price.slice(1)), {
  header: true,
}));