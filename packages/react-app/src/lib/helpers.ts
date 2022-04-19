import fromUnixTime from 'date-fns/fromUnixTime'
import format from 'date-fns/format'
import {  intervalToDuration } from 'date-fns'
import formatDuration from 'date-fns/formatDuration'
import compareAsc from 'date-fns/compareAsc'

export function formatDate(timestamp: number) {
  const date = fromUnixTime(timestamp);
  return format(date, 'MMMM d yyyy, HH:mm')
}

export function getTimeLeft(endDate: Date): string | false {
  const startDate = new Date()

  if (compareAsc(startDate, endDate) === 1) {
    return false;
  }

  const duration = intervalToDuration({ start: startDate, end: endDate })
  return formatDuration(duration, {format: ['years', 'months', 'weeks', 'days', 'hours', 'minutes']});
}