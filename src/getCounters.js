import parkData from '../data'
import moment from 'moment'
import * as _ from 'lodash'

const counterIds = [...new Set(parkData.map(data => data.CounterID_ASTA))]
const data = counterIds.map((counterId) => {
    const counters = parkData.filter((park) => counterId === park.CounterID_ASTA);

    const countersByDate = _.groupBy(counters, (counter) => {
      return moment(counter.StartTime, "DD/MM/YY HH:mm").isSame(moment(counter.EndTime, "DD/MM/YY HH:mm"), 'day')
        ? moment(counter.StartTime, "DD/MM/YY HH:mm").format('DD/MM/YY')
        : null
    });

    const counterVisits = Object.keys(countersByDate).map((date) => {
      return date !== 'null'
        ? {
          counterId,
          date,
          visitCount: countersByDate[date]
            .reduce((total, currentCounter) => currentCounter.Visits ? total + Number(currentCounter.Visits) : total + 0, 0)
        }
        : null
    }).filter(Boolean);
    const maxVisit = Math.max.apply(Math, counterVisits.map((o) => o.visitCount));

    const row = parkData.find((park) => counterId === park.CounterID_ASTA);
    return ({
        id: row.CounterID_ASTA,
        counterName: row.ASTA_Counters.Name_ASTA,
        parkId: row.ASTA_Counters.NationalParkCode,
        parkName: row.ASTA_Counters.NationalParkCode === "34361" ? 'Pallas-Yllästunturi National Park' : 'Nuuksio National Park',
        loc: {
            north: row.PAVE_Counters.CoordinateNorth,
            east: row.PAVE_Counters.CoordinateEast
        },
        maxVisit: maxVisit !== -Infinity ? maxVisit : null
    })
});

const populateParks = () => {
    const countersByParkId = _.groupBy(parkData, (counter) => counter.ASTA_Counters.NationalParkCode);

    return Object.keys(countersByParkId).map((parkId) => {
        const counters = processCountersData(countersByParkId[parkId]);

        // Get the max visit from the list of counters
        let maxVisitOfPark = 0;
        counters.forEach((counters) => {
            const visits = counters.map((counter) => counter.visitCount);
            const maxVisit = visits.length > 0 ? Math.max(...visits) : 0;
            maxVisitOfPark += maxVisit === -Infinity ? 0 : maxVisit;
        });

        const today = moment();
        let lastYear = moment().subtract(1, 'year')
            .isoWeek(today.isoWeek())
            .isoWeekday(today.isoWeekday());
        let visitsOfDay = 0;
        for (let i = 0; i < 4; i++) {
            lastYear = lastYear.subtract(1, 'week');
            counters.forEach((counters) => {
                const counter = counters.find((counter) => {
                    return moment(counter.date, "DD/MM/YY").isSame(lastYear, 'day')
                });
                if (counter) {
                    visitsOfDay += counter.visitCount
                }
            });
        }

        const ratio = visitsOfDay / maxVisitOfPark;
        let level = 0;
        if (ratio >= 0 && ratio < 0.25) {
            level = 1
        } else if (ratio >= 0.25 && ratio < 0.5) {
            level = 2
        } else if (ratio >= 0.5 && ratio < 0.75) {
            level = 3
        } else if (ratio >= 0.75 && ratio < 1) {
            level = 4
        } else {
            level = 5
        }

        return {
            id: parkId,
            name: getParkName(countersByParkId[parkId][0]),
            level: level
        }
    });
};

const getParkName = (counter) => {
    return counter.ASTA_Counters.NationalParkCode === "34361" ?
        'Pallas-Yllästunturi National Park' : 'Nuuksio National Park';
};

const processCountersData = (counters) => {
    const counterIds = [...new Set(counters.map(counter => counter.CounterID_ASTA))];
    return counterIds.map((counterId) => {
        const _counters = counters.filter((counter) => counterId === counter.CounterID_ASTA);

        const countersByDate = _.groupBy(_counters, (counter) => {
            return moment(counter.StartTime, "DD/MM/YY HH:mm").isSame(moment(counter.EndTime, "DD/MM/YY HH:mm"), 'day')
                ? moment(counter.StartTime, "DD/MM/YY HH:mm").format('DD/MM/YY')
                : null
        });

        return Object.keys(countersByDate).map((date) => {
            return date !== 'null' ?
                {
                    counterId,
                    date,
                    visitCount: countersByDate[date]
                        .reduce((total, currentCounter) => currentCounter.Visits ? total + Number(currentCounter.Visits) : total + 0, 0)
                } : null
        }).filter(Boolean);
    });
};

const parks = populateParks();
const getParks = () => {
    return parks
};

module.exports = {
    getParks: getParks
};