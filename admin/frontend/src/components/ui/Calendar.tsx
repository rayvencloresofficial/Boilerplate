import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useColorScheme,
  type BoxProps,
} from "@mui/joy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getColors } from "@/utils/Colors";
import { getLocalDateString } from "@/utils/Format";
import Typography from "./Typography";
import Container from "@/components/ui/Container";

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
  nights?: number;
}

export interface CalendarEvent {
  date: Date | string;
  status:
    | "Available"
    | "Reserved"
    | "Occupied"
    | "Not Available"
    | "Maintenance"
    | "Blocked"
    | string;
  label?: string;
  bookingId?: string;
  blockId?: string;
}

export interface CalendarLegendItem {
  color: string;
  label: string;
  status?: string;
}

export interface RangeCalendarProps {
  /** Check-in / Start date in YYYY-MM-DD format */
  startDate?: string | null;
  /** Check-out / End date in YYYY-MM-DD format */
  endDate?: string | null;
  /** Callback fired when a date range is selected or updated */
  onChange?: (range: {
    startDate: string | null;
    endDate: string | null;
    nights: number;
  }) => void;
  /** Callback fired when a specific date is clicked */
  onDateClick?: (date: Date, event?: CalendarEvent) => void;
  /** Selection mode: "range" (default) or "single" */
  selectionMode?: "range" | "single";
  /** Minimum selectable date in YYYY-MM-DD format (defaults to today) */
  minDate?: string;
  /** Maximum selectable date in YYYY-MM-DD format */
  maxDate?: string;
  /** Specific dates to disable or a function returning boolean */
  disabledDates?: string[] | ((dateStr: string) => boolean);
  /** Array of events with status information */
  events?: CalendarEvent[];
  /** Show status legend */
  showLegend?: boolean;
  /** Custom legend items override */
  legendItems?: CalendarLegendItem[];
  /** Optional custom initial month (Date object or YYYY-MM-DD string) */
  initialMonth?: Date | string;
  /** Custom primary color override (defaults to brand orange #ff6b3d) */
  primaryColor?: string;
  /** Show Clear / Reset button footer */
  showFooter?: boolean;
  /** Callback when cleared */
  onClear?: () => void;
  /** Allow clicking the same date twice to select a 1-day range (default true) */
  allowSameDayEnd?: boolean;
  /** Whether to show drop shadow elevation (default true). Set to false for flat/embedded calendar. */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | boolean | number;
  /** Disables elevation box-shadow if true */
  disableElevation?: boolean;
  /** Disables clicking/selecting dates that have Reserved status or bookingId (default false) */
  disableReservedDates?: boolean;
  /** Disables clicking/selecting dates that have any non-available status (default false) */
  disableDatesWithStatus?: boolean;
  /** Custom style */
  style?: React.CSSProperties;
  /** Custom container styling */
  sx?: BoxProps["sx"];
  /** Class name */
  className?: string;
  variant?: "filled" | "outlined" | undefined;
  showClearButton?: boolean;
}

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_NAMES = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

export default function RangeCalendar({
  startDate: propStartDate = null,
  endDate: propEndDate = null,
  onChange,
  onDateClick,
  selectionMode = "range",
  minDate = getLocalDateString(),
  maxDate,
  disabledDates,
  events = [],
  showLegend = false,
  legendItems,
  initialMonth,
  primaryColor,
  showFooter = false,
  onClear,
  allowSameDayEnd = true,
  elevation = true,
  disableElevation = false,
  disableReservedDates = false,
  disableDatesWithStatus = false,
  style,
  variant = "filled",
  className,
  showClearButton = true,
}: RangeCalendarProps) {
  const { mode } = useColorScheme();
  const isDark = mode === "dark";
  const colors = getColors(isDark ? "dark" : "light");
  const brandOrange = primaryColor || colors.primary;

  const containerElevation: 0 | 1 | 2 | 3 | 4 | 5 | 6 = (() => {
    if (disableElevation || elevation === false || elevation === 0) return 0;
    if (typeof elevation === "number" && elevation >= 0 && elevation <= 6) {
      return elevation as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    }
    return 2;
  })();

  // Index events by YYYY-MM-DD
  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent>();
    if (!events) return map;
    for (const ev of events) {
      const dStr =
        typeof ev.date === "string"
          ? ev.date.substring(0, 10)
          : getLocalDateString(ev.date);
      map.set(dStr, ev);
    }
    return map;
  }, [events]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "Available":
        return colors.success;
      case "Reserved":
        return colors.secondary;
      case "Occupied":
        return colors.warning;
      case "Not Available":
      case "Maintenance":
      case "Blocked":
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const defaultLegendItems: CalendarLegendItem[] = [
    { label: "Reserved", color: colors.secondary },
    { label: "Occupied", color: colors.warning },
    { label: "Not Available", color: colors.error },
  ];

  // Internal selection state
  const [internalStart, setInternalStart] = useState<string | null>(
    propStartDate || null,
  );
  const [internalEnd, setInternalEnd] = useState<string | null>(
    propEndDate || null,
  );
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Sync with props during render when not actively selecting a range
  const [prevPropStartDate, setPrevPropStartDate] = useState(propStartDate);
  const [prevPropEndDate, setPrevPropEndDate] = useState(propEndDate);

  if (!isSelecting) {
    if (propStartDate !== prevPropStartDate) {
      setPrevPropStartDate(propStartDate);
      setInternalStart(propStartDate || null);
    }
    if (propEndDate !== prevPropEndDate) {
      setPrevPropEndDate(propEndDate);
      setInternalEnd(propEndDate || null);
    }
  }

  // Current view month/year
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (initialMonth) {
      return typeof initialMonth === "string"
        ? new Date(initialMonth + "T00:00:00")
        : new Date(initialMonth);
    }
    if (propStartDate) {
      return new Date(propStartDate + "T00:00:00");
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (d: Date): string => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check if a date is disabled
  const isDateDisabled = useCallback(
    (dateStr: string): boolean => {
      if (minDate && dateStr < minDate) return true;
      if (maxDate && dateStr > maxDate) return true;
      if (disableDatesWithStatus) {
        const ev = eventMap.get(dateStr);
        if (
          ev &&
          (ev.status !== "Available" || ev.bookingId || ev.blockId)
        ) {
          return true;
        }
      }
      if (disableReservedDates) {
        const ev = eventMap.get(dateStr);
        if (
          ev &&
          (ev.status === "Reserved" || ev.status === "Occupied" || ev.bookingId)
        ) {
          return true;
        }
      }
      if (disabledDates) {
        if (Array.isArray(disabledDates)) {
          return disabledDates.includes(dateStr);
        }
        if (typeof disabledDates === "function") {
          return disabledDates(dateStr);
        }
      }
      return false;
    },
    [
      minDate,
      maxDate,
      disabledDates,
      disableReservedDates,
      disableDatesWithStatus,
      eventMap,
    ],
  );

  // Helper to check if any date in a range is disabled
  const isRangeBlocked = useCallback(
    (startStr: string, endStr: string): boolean => {
      const start = startStr < endStr ? startStr : endStr;
      const end = startStr < endStr ? endStr : startStr;
      const cur = new Date(start + "T00:00:00");
      const endD = new Date(end + "T00:00:00");
      while (cur <= endD) {
        const dStr = formatDateStr(cur);
        if (isDateDisabled(dStr)) {
          return true;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    },
    [isDateDisabled],
  );

  // Calculate effective start and end dates (including hover preview)
  const effectiveStart = internalStart;
  const effectiveEnd = useMemo(() => {
    if (internalEnd) return internalEnd;
    if (internalStart && hoverDate && hoverDate >= internalStart) {
      if (isRangeBlocked(internalStart, hoverDate)) {
        return null;
      }
      return hoverDate;
    }
    return null;
  }, [internalStart, internalEnd, hoverDate, isRangeBlocked]);

  // Handle clicking a day
  const handleDayClick = (dateStr: string) => {
    if (isDateDisabled(dateStr)) return;

    const event = eventMap.get(dateStr);
    const dateObj = new Date(dateStr + "T00:00:00");
    onDateClick?.(dateObj, event);

    if (selectionMode === "single") {
      setInternalStart(dateStr);
      setInternalEnd(null);
      setHoverDate(null);
      setIsSelecting(false);
      onChange?.({ startDate: dateStr, endDate: null, nights: 0 });
      return;
    }

    if (!isSelecting || !internalStart || (internalStart && internalEnd)) {
      // Step 1: Pick new Start Date (Check-in)
      setInternalStart(dateStr);
      setInternalEnd(null);
      setHoverDate(null);
      setIsSelecting(true);
      onChange?.({ startDate: dateStr, endDate: null, nights: 0 });
    } else if (isSelecting && internalStart && !internalEnd) {
      // Step 2: Pick End Date (Check-out)
      if (dateStr < internalStart) {
        // If clicked date is before start date, reset start date to clicked date
        setInternalStart(dateStr);
        setInternalEnd(null);
        setHoverDate(null);
        setIsSelecting(true);
        onChange?.({ startDate: dateStr, endDate: null, nights: 0 });
      } else if (isRangeBlocked(internalStart, dateStr)) {
        // Cannot select a range spanning across reserved or disabled dates!
        setInternalStart(dateStr);
        setInternalEnd(null);
        setHoverDate(null);
        setIsSelecting(true);
        onChange?.({ startDate: dateStr, endDate: null, nights: 0 });
      } else if (dateStr === internalStart) {
        if (allowSameDayEnd) {
          // Same day clicked: 1 day range (e.g. for blocking 1 day)
          setInternalEnd(dateStr);
          setIsSelecting(false);
          setHoverDate(null);
          onChange?.({
            startDate: internalStart,
            endDate: dateStr,
            nights: 1,
          });
        } else {
          // 1 night stay (check-out next day)
          const nextD = new Date(dateStr + "T00:00:00");
          nextD.setDate(nextD.getDate() + 1);
          const nextStr = formatDateStr(nextD);
          setInternalEnd(nextStr);
          setIsSelecting(false);
          setHoverDate(null);
          onChange?.({
            startDate: internalStart,
            endDate: nextStr,
            nights: 1,
          });
        }
      } else {
        // Valid end date selected!
        const startD = new Date(internalStart + "T00:00:00");
        const endD = new Date(dateStr + "T00:00:00");
        const nights = Math.max(
          1,
          Math.round(
            (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        setInternalEnd(dateStr);
        setIsSelecting(false);
        setHoverDate(null);
        onChange?.({
          startDate: internalStart,
          endDate: dateStr,
          nights,
        });
      }
    }
  };

  const handleClearSelection = () => {
    setInternalStart(null);
    setInternalEnd(null);
    setHoverDate(null);
    setIsSelecting(false);
    onClear?.();
    onChange?.({ startDate: null, endDate: null, nights: 0 });
  };

  // Generate calendar cells (including leading and trailing days)
  const calendarWeeks = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      date: Date;
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      dayOfWeek: number;
    }[] = [];

    // Leading days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const d = new Date(year, month - 1, dayNum);
      cells.push({
        date: d,
        dateStr: formatDateStr(d),
        dayNumber: dayNum,
        isCurrentMonth: false,
        dayOfWeek: d.getDay(),
      });
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      cells.push({
        date: d,
        dateStr: formatDateStr(d),
        dayNumber: dayNum,
        isCurrentMonth: true,
        dayOfWeek: d.getDay(),
      });
    }

    // Trailing days from next month to complete the 7-column grid
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const d = new Date(year, month + 1, dayNum);
      cells.push({
        date: d,
        dateStr: formatDateStr(d),
        dayNumber: dayNum,
        isCurrentMonth: false,
        dayOfWeek: d.getDay(),
      });
    }

    // Split cells into rows of 7 (weeks)
    const weeks: (typeof cells)[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }, [year, month]);

  return (
    <Container
      className={className}
      elevation={containerElevation}
      background="light"
      padding="clamp(16px, 2.5vw, 24px)"
      overflow="visible"
      gap="0"
      variant={variant}
      style={{
        width: "100%",
        minWidth: "320px",
        maxWidth: "430px",
        userSelect: "none",
        ...style,
      }}
    >
      <style>{`
        @keyframes datePopIn {
          0% { transform: scale(0.65); opacity: 0; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      {/* ─── Header: Month / Year Navigation ─── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: { xs: 2, sm: 2.5 },
        }}
      >
        <IconButton
          variant="plain"
          size="sm"
          onClick={handlePrevMonth}
          sx={{
            color: brandOrange,
            borderRadius: "50%",
            width: { xs: 38, sm: 36 },
            height: { xs: 38, sm: 36 },
            "&:hover": {
              bgcolor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(255, 107, 61, 0.1)",
            },
          }}
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </IconButton>

        <Typography.Label
          size="sm"
          color="dark"
          bold
          sx={{
            letterSpacing: "0.08em",
            fontSize: { xs: "15px", sm: "16px" },
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {MONTH_NAMES[month]} {year}
        </Typography.Label>

        <IconButton
          variant="plain"
          size="sm"
          onClick={handleNextMonth}
          sx={{
            color: brandOrange,
            borderRadius: "50%",
            width: { xs: 38, sm: 36 },
            height: { xs: 38, sm: 36 },
            "&:hover": {
              bgcolor: isDark
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(255, 107, 61, 0.1)",
            },
          }}
        >
          <ChevronRight size={22} strokeWidth={2.4} />
        </IconButton>
      </Box>

      {/* Guide prompt for range picking */}
      {selectionMode === "range" && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2.5,
            mt: -1,
          }}
        >
          <Typography.Body
            size="xs"
            sx={{
              color: isSelecting ? brandOrange : "text.secondary",
              fontWeight: isSelecting ? 600 : 500,
              fontSize: { xs: "13px", sm: "13.5px" },
              textAlign: "center",
            }}
          >
            {isSelecting
              ? "👉 Step 2: Select your check-out date"
              : "👉 Step 1: Select your check-in date"}
          </Typography.Body>
        </Box>
      )}

      {/* ─── Weekday Header Row ─── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          mb: 2,
        }}
      >
        {WEEKDAY_NAMES.map((day) => (
          <Box
            key={day}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: { xs: 0.85, sm: 0.75 },
            }}
          >
            <Typography.Label
              size="xs"
              color="default"
              align="center"
              sx={{
                fontSize: { xs: "12.5px", sm: "13px" },
                fontWeight: 600,
                letterSpacing: "0.06em",
                opacity: 0.65,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Box
                component="span"
                sx={{ display: { xs: "inline", sm: "none" } }}
              >
                {day.charAt(0)}
              </Box>
              <Box
                component="span"
                sx={{ display: { xs: "none", sm: "inline" } }}
              >
                {day}
              </Box>
            </Typography.Label>
          </Box>
        ))}
      </Box>

      {/* ─── Calendar Matrix Rows with Continuous Ribbon ─── */}
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: "6px" }}
        onMouseLeave={() => {
          if (selectionMode === "range" && isSelecting) {
            setHoverDate(null);
          }
        }}
      >
        {calendarWeeks.map((week, weekIdx) => (
          <Box
            key={weekIdx}
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              position: "relative",
            }}
          >
            {week.map((cell) => {
              const { dateStr, dayNumber, isCurrentMonth, dayOfWeek } = cell;
              const disabled = isDateDisabled(dateStr);
              const event = eventMap.get(dateStr);

              const isStart = effectiveStart === dateStr;
              const isEnd = effectiveEnd === dateStr;
              const isRangeActive = Boolean(
                selectionMode === "range" &&
                effectiveStart &&
                effectiveEnd &&
                effectiveStart !== effectiveEnd,
              );
              const isInRange =
                isRangeActive &&
                dateStr > (effectiveStart as string) &&
                dateStr < (effectiveEnd as string);

              const isHighlighted = isStart || isEnd || isInRange;

              const cellContent = (
                <Box
                  key={dateStr}
                  onClick={() => !disabled && handleDayClick(dateStr)}
                  onMouseEnter={() => {
                    if (
                      selectionMode === "range" &&
                      internalStart &&
                      !internalEnd &&
                      !disabled
                    ) {
                      setHoverDate(dateStr);
                    }
                  }}
                  sx={{
                    position: "relative",
                    height: { xs: "46px", sm: "48px" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                    userSelect: "none",
                    transition: "transform 0.1s ease",
                    ...(!disabled && {
                      "&:active": {
                        transform: "scale(0.92)",
                      },
                    }),
                  }}
                >
                  {/* ── Continuous Ribbon Background Strip (Only active in multi-day range) ── */}
                  {isRangeActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        transform: isHighlighted
                          ? "translateY(-50%) scaleY(1)"
                          : "translateY(-50%) scaleY(0.7)",
                        opacity: isHighlighted ? 1 : 0,
                        pointerEvents: "none",
                        height: { xs: "36px", sm: "40px" },
                        bgcolor: brandOrange,
                        zIndex: 1,
                        left: 0,
                        right: 0,
                        width: "100%",
                        borderTopLeftRadius:
                          isStart || dayOfWeek === 0 ? "9999px" : "0px",
                        borderBottomLeftRadius:
                          isStart || dayOfWeek === 0 ? "9999px" : "0px",
                        borderTopRightRadius:
                          isEnd || dayOfWeek === 6 ? "9999px" : "0px",
                        borderBottomRightRadius:
                          isEnd || dayOfWeek === 6 ? "9999px" : "0px",
                        boxShadow:
                          isStart || isEnd
                            ? `0 3px 12px ${brandOrange}66`
                            : "none",
                        transition:
                          "opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.2s ease, box-shadow 0.2s ease",
                      }}
                    />
                  )}

                  {/* ── Day Number / Highlight Pill Content ── */}
                  {isStart || isEnd ? (
                    // Selected Day Badge (Always a 50% radius perfect circle)
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 2,
                        width: { xs: "36px", sm: "40px" },
                        height: { xs: "36px", sm: "40px" },
                        aspectRatio: "1 / 1",
                        borderRadius: "50%",
                        flexShrink: 0,
                        bgcolor: isRangeActive ? colors.white : brandOrange,
                        color: isRangeActive ? brandOrange : colors.white,
                        fontWeight: 700,
                        fontSize: { xs: "14px", sm: "15px" },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isRangeActive
                          ? "0 2px 8px rgba(0, 0, 0, 0.2)"
                          : `0 3px 10px ${brandOrange}66`,
                        border: isRangeActive
                          ? `2px solid ${colors.white}`
                          : "none",
                        animation:
                          "datePopIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {dayNumber}
                    </Box>
                  ) : (
                    // In-range days or standard days (Always 50% radius circle)
                    <Box
                      sx={{
                        position: "relative",
                        zIndex: 2,
                        width: { xs: "36px", sm: "40px" },
                        height: { xs: "36px", sm: "40px" },
                        aspectRatio: "1 / 1",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: { xs: "14px", sm: "15px" },
                        fontWeight: isHighlighted
                          ? 600
                          : isCurrentMonth
                            ? 500
                            : 400,
                        color: isHighlighted
                          ? colors.white
                          : disabled
                            ? isDark
                              ? "rgba(255, 255, 255, 0.2)"
                              : "rgba(0, 0, 0, 0.22)"
                            : !isCurrentMonth
                              ? isDark
                                ? "rgba(255, 255, 255, 0.35)"
                                : "rgba(0, 0, 0, 0.3)"
                              : colors.dark,
                        transition:
                          "color 0.2s ease, background-color 0.2s ease, transform 0.15s ease",
                        ...(!isHighlighted &&
                          !disabled && {
                            "&:hover": {
                              bgcolor: isDark
                                ? "rgba(255, 255, 255, 0.08)"
                                : "rgba(255, 107, 61, 0.12)",
                              color: brandOrange,
                              fontWeight: 600,
                              transform: "scale(1.08)",
                            },
                          }),
                      }}
                    >
                      {dayNumber}
                      {/* Status indicator dot */}
                      {event &&
                        event.status !== "Available" &&
                        !isHighlighted && (
                          <Box
                            sx={{
                              position: "absolute",
                              bottom: "3px",
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              bgcolor: getStatusColor(event.status),
                              boxShadow: `0 0 4px ${getStatusColor(event.status)}`,
                            }}
                          />
                        )}
                    </Box>
                  )}
                </Box>
              );

              if (
                event?.label ||
                (event?.status && event.status !== "Available")
              ) {
                return (
                  <Tooltip
                    key={dateStr}
                    title={event.label || event.status}
                    placement="top"
                    arrow
                  >
                    {cellContent}
                  </Tooltip>
                );
              }

              return cellContent;
            })}
          </Box>
        ))}
      </Box>

      {/* ─── Status Legend ─── */}
      {showLegend && (
        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: `1px solid ${
              isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
            }`,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {(legendItems || defaultLegendItems).map((item) => (
              <Box
                key={item.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.75,
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: item.color,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${item.color}66`,
                  }}
                />
                <Typography.Body
                  size="xs"
                  color="default"
                  sx={{ fontSize: "12px", opacity: 0.85 }}
                >
                  {item.label}
                </Typography.Body>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ─── Footer: Date Range Info & Clear Action ─── */}
      {showFooter && (internalStart || showClearButton) && (
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: showLegend
              ? "none"
              : `1px solid ${
                  isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"
                }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
          }}
        >
          {internalStart && (
            <Typography.Label
              size="xs"
              color="primary"
              bold
              onClick={handleClearSelection}
              sx={{
                fontSize: "13px",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Reset
            </Typography.Label>
          )}
        </Box>
      )}
    </Container>
  );
}
