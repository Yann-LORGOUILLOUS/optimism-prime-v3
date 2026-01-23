export class TimeFormatter {
  private static readonly SECONDS_PER_MINUTE = 60;
  private static readonly SECONDS_PER_HOUR = 3600;
  private static readonly SECONDS_PER_DAY = 86400;
  private static readonly SECONDS_PER_WEEK = 604800;

  static toShortFormat(totalSeconds: number): string {
    return this.formatDuration(totalSeconds, true);
  }

  static toLongFormat(totalSeconds: number): string {
    return this.formatDuration(totalSeconds, false);
  }

  private static formatDuration(totalSeconds: number, useShortFormat: boolean): string {
    if (totalSeconds <= 0) {
      return "-";
    }

    const { weeks, days, hours, minutes, seconds } = this.decompose(totalSeconds);
    const timePart = this.formatTimePart(hours, minutes, seconds);

    if (useShortFormat) {
      return this.buildShortString(weeks, days, timePart);
    }

    return this.buildLongString(weeks, days, timePart);
  }

  private static decompose(totalSeconds: number): {
    weeks: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    let remaining = Math.floor(totalSeconds);

    const weeks = Math.floor(remaining / this.SECONDS_PER_WEEK);
    remaining = remaining % this.SECONDS_PER_WEEK;

    const days = Math.floor(remaining / this.SECONDS_PER_DAY);
    remaining = remaining % this.SECONDS_PER_DAY;

    const hours = Math.floor(remaining / this.SECONDS_PER_HOUR);
    remaining = remaining % this.SECONDS_PER_HOUR;

    const minutes = Math.floor(remaining / this.SECONDS_PER_MINUTE);
    const seconds = remaining % this.SECONDS_PER_MINUTE;

    return { weeks, days, hours, minutes, seconds };
  }

  private static formatTimePart(hours: number, minutes: number, seconds: number): string {
    const h = hours.toString().padStart(2, "0");
    const m = minutes.toString().padStart(2, "0");
    const s = seconds.toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  }

  private static buildShortString(weeks: number, days: number, timePart: string): string {
    const weeksPart = weeks > 0 ? `${weeks}W ` : "";
    const daysPart = days > 0 ? `${days}D ` : "";
    return `${weeksPart}${daysPart}${timePart}`;
  }

  private static buildLongString(weeks: number, days: number, timePart: string): string {
    const weeksLabel = weeks === 1 ? "week" : "weeks";
    const daysLabel = days === 1 ? "day" : "days";

    const weeksPart = weeks > 0 ? `${weeks} ${weeksLabel}, ` : "";
    const daysPart = days > 0 ? `${days} ${daysLabel}, ` : "";

    return `${weeksPart}${daysPart}${timePart}`;
  }
}