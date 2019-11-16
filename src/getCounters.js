import parkData from '../data'
import moment from 'moment'
import * as _ from 'lodash'

const counterIds = [...new Set(parkData.map(data => data.CounterID_ASTA))]

const data = counterIds.map((counterId) => {
    const counters = parkData.filter((park) => counterId === park.CounterID_ASTA)

    const countersByDate = _.groupBy(counters, (counter) => {
      return moment(counter.StartTime, "DD/MM/YY HH:mm").isSame(moment(counter.EndTime, "DD/MM/YY HH:mm"), 'day')
        ? moment(counter.StartTime, "DD/MM/YY HH:mm").format('DD/MM/YY')
        : null
    })

    const counterVisits = Object.keys(countersByDate).map((date) => {
      return date !== 'null'
        ? {
          counterId,
          date,
          visitCount: countersByDate[date]
            .reduce((total, currentCounter) => currentCounter.Visits ? total + Number(currentCounter.Visits) : total + 0, 0)
        }
        : null
    }).filter(Boolean)
    const maxVisit = Math.max.apply(Math, counterVisits.map((o) => o.visitCount))

    const row = parkData.find((park) => counterId === park.CounterID_ASTA)
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
})

console.log(data)