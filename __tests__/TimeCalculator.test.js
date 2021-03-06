import TimeCalculator from '../src/TimeCalculator'

const makeTime = str => {
  const [_, hour, minute, second, ms] = str.match(/(\d\d):(\d\d):(\d\d)(?:\.(\d{1,3}))?/)
  const d = new Date()
  d.setHours(Number(hour))
  d.setMinutes(Number(minute))
  d.setSeconds(Number(second))
  d.setMilliseconds(Number(ms || 0))
  return d
}

const makeDatetime = str => {
  const [_, month, date, hour, minute, second] = str.match(/(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/)
  const d = new Date()
  d.setMonth(Number(month - 1))
  d.setDate(Number(date))
  d.setHours(Number(hour))
  d.setMinutes(Number(minute))
  d.setSeconds(Number(second))
  d.setMilliseconds(0)
  return d
}

test('invalid pattern', () => {
  expect(() => new TimeCalculator({ second: 'invalid' })).toThrow('Invalid pattern')
})

test('calculator.test against { second: * }', () => {
  const calculator = new TimeCalculator({ second: '*' })
  expect(calculator.test(makeTime('10:00:01'))).toBe(true)
  expect(calculator.test(makeDatetime('03-25 10:00:00'))).toBe(true)
})

test('calculator.test against { hour: 10 }', () => {
  const calculator = new TimeCalculator({ hour: 10 })
  expect(calculator.test(makeTime('10:00:00'))).toBe(true)
  expect(calculator.test(makeTime('10:20:00'))).toBe(false)
  expect(calculator.test(makeTime('10:00:01'))).toBe(false)
  expect(calculator.test(makeDatetime('03-25 10:00:00'))).toBe(true)
})

test('calculator.test against { hour: 16, minute: 30 }', () => {
  const calculator = new TimeCalculator({ hour: 16, minute: 30 })
  expect(calculator.test(makeTime('16:30:00'))).toBe(true)
  expect(calculator.test(makeTime('15:00:00'))).toBe(false)
  expect(calculator.test(makeTime('16:30:01'))).toBe(false)
  expect(calculator.test(makeDatetime('07-14 16:30:00'))).toBe(true)
})

test('calculator.test against { hour: [7, 8, 9], minute: [20, 30, 40] }', () => {
  const calculator = new TimeCalculator({ hour: [7, 8, 9], minute: [20, 30, 40] })
  expect(calculator.test(makeTime('09:40:00'))).toBe(true)
  expect(calculator.test(makeTime('08:30:00'))).toBe(true)
  expect(calculator.test(makeTime('07:20:00'))).toBe(true)

  expect(calculator.test(makeTime('06:20:00'))).toBe(false)
  expect(calculator.test(makeTime('07:50:00'))).toBe(false)
  expect(calculator.test(makeTime('09:40:01'))).toBe(false)

  expect(calculator.test(makeDatetime('07-14 09:40:00'))).toBe(true)
  expect(calculator.test(makeDatetime('07-15 08:30:00'))).toBe(true)
  expect(calculator.test(makeDatetime('12-15 07:20:00'))).toBe(true)
})

const d = {
  milliseconds: x => x,
  seconds: x => x * d.milliseconds(1000),
  minutes: x => x * d.seconds(60),
  hours: x => x * d.minutes(60),
  days: x => x * d.hours(24),
}

test('calculator.calculate against { millisecond: * }', () => {
  const calculator = new TimeCalculator({ millisecond: '*' })
  expect(calculator.calculate(makeTime('10:00:01'))).toBe(0)
  expect(calculator.calculate(makeTime('10:00:01.040'))).toBe(0)
  expect(calculator.calculate(makeTime('10:00:01.100'))).toBe(0)
  expect(calculator.calculate(makeTime('10:00:01.120'))).toBe(0)
  expect(calculator.calculate(makeTime('10:00:01.350'))).toBe(0)
})

test('calculator.calculate against { millisecond: [0, 100, 200] }', () => {
  const calculator = new TimeCalculator({ millisecond: [0, 100, 200] })
  expect(calculator.calculate(makeTime('10:00:01'))).toBe(d.milliseconds(0))
  expect(calculator.calculate(makeTime('10:00:01.040'))).toBe(d.milliseconds(60))
  expect(calculator.calculate(makeTime('10:00:01.100'))).toBe(d.milliseconds(0))
  expect(calculator.calculate(makeTime('10:00:01.120'))).toBe(d.milliseconds(80))
  expect(calculator.calculate(makeTime('10:00:01.350'))).toBe(d.milliseconds(650))
})

test('calculator.calculate against { hour: 10 }', () => {
  const calculator = new TimeCalculator({ hour: 10 })

  expect(calculator.calculate(makeTime('10:00:00'))).toBe(0)

  expect(calculator.calculate(makeTime('07:00:00'))).toBe(d.hours(3))
  expect(calculator.calculate(makeTime('09:40:00'))).toBe(d.minutes(20))
  expect(calculator.calculate(makeTime('00:20:50'))).toBe(
    d.hours(9) + d.minutes(39) + d.seconds(10),
  )

  expect(calculator.calculate(makeTime('15:00:01'))).toBe(d.hours(19) - d.seconds(1))
  expect(calculator.calculate(makeTime('12:30:00'))).toBe(d.hours(21) + d.minutes(30))
})
