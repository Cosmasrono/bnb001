 "use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isBefore, isAfter, isWithinInterval, startOfDay,
} from "date-fns";

type Props = {
  bookedRanges?: { checkIn: Date; checkOut: Date }[];
  onSelect: (checkIn: Date, checkOut: Date) => void;
  singleDay?: boolean;
};

export function BookingCalendar({ bookedRanges = [], onSelect, singleDay = false }: Props) {
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(today);
  const [direction, setDirection] = useState(1);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [hovering, setHovering] = useState<Date | null>(null);

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const startPad = startOfMonth(month).getDay();

  function isBooked(d: Date) {
    return bookedRanges.some((r) => isWithinInterval(d, { start: r.checkIn, end: r.checkOut }));
  }

  function isInRange(d: Date) {
    const effectiveEnd = end || hovering;
    if (!start || !effectiveEnd) return false;
    const [a, b] = isBefore(start, effectiveEnd) ? [start, effectiveEnd] : [effectiveEnd, start];
    return isAfter(d, a) && isBefore(d, b);
  }

  function handleDay(d: Date) {
    if (isBefore(d, today) || isBooked(d)) return;
    if (singleDay) {
      setStart(d); setEnd(null);
      onSelect(d, d);
      return;
    }
    if (!start || (start && end)) {
      setStart(d); setEnd(null);
    } else {
      if (isBefore(d, start)) { setStart(d); setEnd(null); return; }
      setEnd(d);
      onSelect(start, d);
    }
  }

  function changeMonth(dir: number) {
    setDirection(dir);
    setMonth((m) => dir > 0 ? addMonths(m, 1) : subMonths(m, 1));
  }

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)}
          disabled={isBefore(subMonths(month, 1), today)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={format(month, "MMMM yyyy")}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.2 }}
            className="font-semibold text-gray-900">
            {format(month, "MMMM yyyy")}
          </motion.p>
        </AnimatePresence>
        <button onClick={() => changeMonth(1)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map((d) => {
          const past = isBefore(d, today);
          const booked = isBooked(d);
          const isStart = start && isSameDay(d, start);
          const isEnd = end && isSameDay(d, end);
          const inRange = isInRange(d);

          return (
            <div key={d.toISOString()} className="relative flex items-center justify-center py-0.5">
              {inRange && <div className="absolute inset-y-0 inset-x-0 bg-rose-50" />}
              {isStart && end && <div className="absolute inset-y-0 right-0 left-1/2 bg-rose-50" />}
              {isEnd && <div className="absolute inset-y-0 left-0 right-1/2 bg-rose-50" />}
              <button
                onMouseEnter={() => start && !end && setHovering(d)}
                onMouseLeave={() => setHovering(null)}
                onClick={() => handleDay(d)}
                disabled={past || booked}
                className={`relative z-10 w-9 h-9 rounded-full text-sm font-medium transition-all
                  ${past || booked ? "text-gray-300 cursor-not-allowed line-through" : "cursor-pointer hover:border hover:border-gray-900"}
                  ${isStart || isEnd ? "bg-gray-900 text-white hover:border-0" : ""}
                  ${inRange ? "text-gray-900" : ""}
                `}
              >
                {format(d, "d")}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selection summary */}
      {start && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center justify-between text-sm text-gray-600 border-t border-gray-100 pt-3">
          <div>
            <span className="font-semibold text-gray-900">{format(start, "MMM d")}</span>
            {end && <> → <span className="font-semibold text-gray-900">{format(end, "MMM d")}</span></>}
          </div>
          <button onClick={() => { setStart(null); setEnd(null); }}
            className="text-xs underline hover:text-gray-900 transition-colors">Clear</button>
        </motion.div>
      )}
    </div>
  );
}
