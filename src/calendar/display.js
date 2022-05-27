const { DateTime } = require('luxon')

function numToOrdinal(index) {
    return ordinal
        = index === 0 ? '1st'
        : index === 1 ? '2nd'
        : index === 2 ? '3rd'
        : `${index + 1}th`
}

const add = (() => {
    let options = {}
    return {
        option(opts = { format, calendarArray }) {
            options = opts
        },
        weeks(format = options['format']) {
            const $ = document['createElement']('div')
            const fromISO = DateTime['fromISO']
            const dow = {
                sunday: fromISO('0000-01-02'),
                monday: fromISO('0000-01-03'),
                tuesday: fromISO('0000-01-04'),
                wednesday: fromISO('0000-01-05'),
                thursday: fromISO('0000-01-06'),
                friday: fromISO('0000-01-07'),
                saturday: fromISO('0000-01-01'),
            }, entries = Object['entries'](dow)
            for (let i = 0; i < entries['length']; i++) {
                const [key, value] = entries[i]
                const w = document['createElement']('span')
                w['id'] = key
                w['textContent'] = value['setLocale'](options['locale'])['toFormat'](format)
                $['appendChild'](w)
            }
            return $
        },
        days(calArray = options['calendarArray']) {
            const $ = document['createElement']('div')
            for (let i = 0; i < calArray['length']; i++) {
                const cr = calArray[i]
                const r = document['createElement']('div')
                r['id'] = `week-of-${numToOrdinal(i)}`
                for (let ia = 0; ia < cr['length']; ia++) {
                    const d = document['createElement']('div')
                    const s = document['createElement']('span')
                    const t = cr[ia]['setLocale'](options['locale'])
                    d['id'] = cr[ia]['toFormat']('cccc')
                    if (t['toFormat']('yyyyLLdd') === DateTime['local']()['setLocale'](options['locale'])['toFormat']('yyyyLLdd')) {
                        d['setAttribute']('flu-sel', '')
                        s['setAttribute']('isToday', 'true')
                    }
                    s['textContent'] = cr[ia]['toFormat']('dd')
                    d['appendChild'](s)
                    r['appendChild'](d)
                }
                $['appendChild'](r)
            }
            return $
        },
    }
})()

module['exports'] = (selector, calendarArray, opts = {
    locale: 'en',
    class: {
        displayWeeks: undefined,
        displayDays: undefined,
    },
}) => {
    add['option']({ locale: opts['locale'], format: 'ccccc', calendarArray })
    const weeks = add['weeks']()
    const days = add['days']()
    const dw = opts['class']['displayWeeks']
    const dd = opts['class']['displayDays']
    const sel = document['querySelector'](selector)
    while (sel['firstChild']) sel['firstChild']['remove']()
    typeof dw === 'string' ? weeks['classList']['add'](...dw['split'](/\s/g)) : false
    typeof dd === 'string' ? days['classList']['add'](...dd['split'](/\s/g)) : false
    sel['appendChild'](weeks)
    sel['appendChild'](days)
}