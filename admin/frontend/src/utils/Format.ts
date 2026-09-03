// Convert 12-hour format (e.g., "08:00 AM", "07:30 PM") to 24-hour format (e.g., "08:00", "19:30")
export function convertTo24Hour(time12h: string): string {
    if (!time12h) return "08:00"; // default fallback
    const match = time12h.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return "08:00"; // default fallback

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
}

// Convert 24-hour format (e.g., "08:00", "19:30") to 12-hour format (e.g., "08:00 AM", "07:30 PM")
export function convertTo12Hour(time24h: string): string {
    if (!time24h) return "08:00 AM";
    const parts = time24h.split(":");
    if (parts.length < 2) return "08:00 AM";

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export interface FormatDateOptions {
    includeDayOfWeek?: boolean;
    shortMonth?: boolean;
}

/**
 * Format any date string / Date object into standard readable date.
 * Example outputs:
 * - "September 28, 2026" (default)
 * - "Sunday, September 28, 2026" (with includeDayOfWeek: true)
 * - "Sep 28, 2026" (with shortMonth: true)
 */
export function formatStandardDate(
    dateInput: string | Date | null | undefined,
    options?: FormatDateOptions
): string {
    if (!dateInput) return "";

    let date: Date;
    if (typeof dateInput === "string") {
        const trimmed = dateInput.trim();
        // Check for YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
        const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);
            date = new Date(year, month, day);
        } else {
            date = new Date(trimmed);
        }
    } else {
        date = dateInput;
    }

    if (isNaN(date.getTime())) return typeof dateInput === "string" ? dateInput : "";

    const monthFormat = options?.shortMonth ? "short" : "long";
    const intlOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: monthFormat,
        day: "numeric",
    };

    if (options?.includeDayOfWeek) {
        intlOptions.weekday = "long";
    }

    return new Intl.DateTimeFormat("en-US", intlOptions).format(date);
}

/**
 * Format date and time into standard readable string.
 * Example: "September 28, 2026 at 2:00 PM"
 */
export function formatStandardDateTime(
    dateInput: string | Date | null | undefined,
    timeInput?: string,
    options?: FormatDateOptions
): string {
    const dateStr = formatStandardDate(dateInput, options);
    if (!dateStr) return "";
    if (!timeInput) return dateStr;

    const timeFormatted =
        timeInput.includes("AM") || timeInput.includes("PM")
            ? timeInput
            : convertTo12Hour(timeInput);

    return `${dateStr} at ${timeFormatted}`;
}

/**
 * Format currency with Peso symbol and thousands separator.
 * Example: formatCurrency(1000) -> "₱1,000"
 */
export function formatCurrency(amount: number | null | undefined): string {
    return `₱${(amount ?? 0).toLocaleString("en-US")}`;
}

/**
 * Masks an email address for privacy protection (e.g. "rayven.clores@gmail.com" -> "ray***@gmail.com").
 * Prevents exposing raw email in the DOM or inspect element.
 */
export function maskEmail(email: string | null | undefined): string {
    if (!email) return "Guest";
    const trimmed = email.trim();
    if (!trimmed.includes("@")) return trimmed;

    const [localPart, domain] = trimmed.split("@");
    if (!localPart || !domain) return trimmed;

    let maskedLocal: string;
    if (localPart.length <= 2) {
        maskedLocal = `${localPart[0]}***`;
    } else if (localPart.length <= 4) {
        maskedLocal = `${localPart.slice(0, 2)}***`;
    } else {
        maskedLocal = `${localPart.slice(0, 3)}***`;
    }

    return `${maskedLocal}@${domain}`;
}


/**
 * Returns a YYYY-MM-DD string in the user's local timezone (preventing UTC offset date shifts).
 */
export function getLocalDateString(dateInput?: Date | string | null): string {
    let d: Date;
    if (!dateInput) {
        d = new Date();
    } else if (typeof dateInput === "string") {
        const trimmed = dateInput.trim();
        const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);
            d = new Date(year, month, day);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = dateInput;
    }

    if (isNaN(d.getTime())) {
        d = new Date();
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}