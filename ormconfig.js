require('dotenv').config();

module.exports = [{
    "name": "praktikum",
    "type": "mysql",
    "host": process.env.PRAKTIKUM_HOST,
    "port": process.env.PRAKTIKUM_PORT,
    "username": process.env.PRAKTIKUM_USER,
    "password": process.env.PRAKTIKUM_PASSWORD,
    "database": process.env.PRAKTIKUM_DATABASE,
    "strict": true,
    "entities": [
       "src/models/v1/praktikum/*.ts"
    ]
 }, {
    "name": "srs",
    "type": "mysql",
    "host": process.env.SRS_HOST,
    "port": process.env.SRS_PORT,
    "username": process.env.SRS_USER,
    "password": process.env.SRS_PASSWORD,
    "database": process.env.SRS_DATABASE,
    "strict": true,
    "entities": [
       "src/models/v1/srs/*.ts"
    ]
 }]