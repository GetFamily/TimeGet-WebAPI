var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const jalaali = require('jalaali-js');
const ground = global.ground;

/* GET all occasions. */
router.get('/', async function (req, res, next) {
    try {
        let results = await ground.occasion.get({ filter: req.query });
        if (req.query.year && req.query.month && !req.query.day) { // normal request to badesaba data
            if (!results?.length) { // if data is not gathered yet
                await collectBadesaba(req.query.year, req.query.month);
                results = await ground.occasion.get({ filter: req.query });
            }
        }
        res.send(results);
    } catch (error) {
        res.status(400).send(error);
    }
});

/* GET collect occasions from farsi calendar. */
router.get('/collect-farsicalendar', async function (req, res, next) {
    const calendarTypes = [
        'sh', // Solar Hijri Calendar - شمسی
        'ic', // Islamic Calendar - قمری
        'wc', // World Calendar - میلادی
    ];
    const monthCount = 12;
    const dayCount = 31;
    const result = [];
    try {
        for (const calendarType of calendarTypes) {
            for (let monthIndex = 1; monthIndex <= monthCount; monthIndex++) {
                for (let dayIndex = 1; dayIndex <= dayCount; dayIndex++) {
                    const farsiCalendarResponse = await axios({
                        baseURL: 'https://farsicalendar.com',
                        url: `/api/${calendarType}/${dayIndex}/${monthIndex}`,
                        method: 'GET',
                    });
                    for (const occasion of farsiCalendarResponse.data.values) {
                        const obj = {
                            offlineId: occasion.id,
                            creatorId: 'BOT',
                            source: 'farsicalendar',
                            year: occasion.year,
                            month: monthIndex,
                            day: dayIndex,
                            calendarType: calendarType,
                            holiday: occasion.dayoff,
                            category: occasion.category,
                            description: occasion.occasion,
                        };
                        ground.occasion.put(obj);
                        result.push(obj);
                    }
                }
            }
        }
        res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

/* GET collect occasions from farsi calendar. */
router.get('/collect-badesaba', async function (req, res, next) {
    const year = req.query.year;
    const month = req.query.month;
    try {
        const result = await collectBadesaba(year, month);
        res.send(result);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;

async function collectBadesaba(year, month) {
    const result = [];
    const badesabaResponse = await axios({
        baseURL: 'https://badesaba.ir',
        url: `/api/site/getDataCalendar/${month}/${year}`,
        method: 'GET',
    });
    for (const dayOccasions of badesabaResponse.data) {
        const date = dayOccasions.date;
        const [gYear, gMonth, gDay] = date.split('-');
        const { jy, jm, jd } = jalaali.toJalaali(Number(gYear), Number(gMonth), Number(gDay));
        const occasions = dayOccasions.events;
        for (const occasion of occasions) {
            const obj = {
                offlineId: `${gYear}${gMonth}${gDay}${jy}${jm}${jd}`,
                creatorId: 'BOT',
                source: 'badesaba',
                year: jy,
                month: jm,
                day: jd,
                gYear,
                gMonth,
                gDay,
                // calendarType: null,
                holiday: occasion.holiday,
                // category: null,
                description: occasion.event,
            };
            ground.occasion.put(obj);
            result.push(obj);
        }
    }
    return result;
}