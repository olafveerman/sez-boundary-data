'use strict'
const fs = require('fs')
const osmGeojson = require('osmtogeojson')
const path = require('path')
const rp = require('request-promise-native')

// Download boundary data for Special Economic Zones from OSM
// Stores 2 files:
//   1. raw boundary data
//   2. raw boundary data with geojson.io compatible style properties
//
// Usage:
//    $node index.js 

const sez = [
  {
    'officialName': 'Bonaberi-Douala IZ',
    'wayId': 229913020
  },
  {
    'officialName': 'Athi River Export Processing Zone',
    'wayId': 173815950
  },
  {
    'officialName': 'Linh Trung I Export Processing Zone',
    'wayId': 327898250
  },
  {
    'officialName': 'Pinthong Industrial Estate',
    'wayId': 153741069
  },
  {
    'officialName': 'Coega Industrial Park',
    'wayId': 48545367
  },
  {
    'officialName': 'Hao Khanh Industrial Area',
    'wayId': 524238099
  },
  {
    'officialName': 'Hawazza',
    'wayId': 447873671
  },
  {
    'officialName': 'Bole lemi',
    'wayId': 422509127
  }
]

// do a union of all the way id's
let query = sez.reduce((a, b) => a.concat(`way(${b.wayId});>;`), '')

console.log(`Fetching data from Overpass...`)
rp(`http://overpass-api.de/api/interpreter?data=[out:json];(${query});out body;`)
  .catch(err => {
    throw err.message
  })
  .then(osmJSON => {
    return osmGeojson(JSON.parse(osmJSON), { flatProperties: true })
  })
  .then(geoJSON => {
    let styledGeoJSON = JSON.parse(JSON.stringify(geoJSON))
    styledGeoJSON.features.map(f => {
      f.properties['stroke'] = "#f99e02"
      f.properties['stroke-width'] = 3
      f.properties['fill'] = "#555555"
      f.properties['stroke-opacity'] = 1
      f.properties['fill-opacity'] = 0.5
      return f
    })
    return [geoJSON, styledGeoJSON]
  })
  .then(json => {
    fs.writeFileSync(path.join(__dirname, `sez-boundaries.geojson`), JSON.stringify(json[0]))
    fs.writeFileSync(path.join(__dirname, `sez-boundaries-styled.geojson`), JSON.stringify(json[1]))
  })
  .catch(err => console.log(err))
