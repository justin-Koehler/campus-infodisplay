import type { WeatherDay, WeatherIcon } from "@/lib/types";

function Icon({ name }: { name: WeatherIcon }) {
  const common = {
    width: 42,
    height: 42,
    viewBox: "0 0 42 42",
    fill: "none",
    "aria-hidden": true as const,
  };
  switch (name) {
    case "sun":
      return (
        <svg {...common}>
          <circle cx="21" cy="21" r="7.5" fill="#F5C542" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180;
            return (
              <line
                key={deg}
                x1={21 + Math.cos(rad) * 12}
                y1={21 + Math.sin(rad) * 12}
                x2={21 + Math.cos(rad) * 16.5}
                y2={21 + Math.sin(rad) * 16.5}
                stroke="#F5C542"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      );
    case "sunCloud":
      return (
        <svg {...common}>
          <circle cx="15" cy="16" r="6" fill="#F5C542" />
          <path
            d="M12.5 29h16.2a6 6 0 0 0 .3-12 8.8 8.8 0 0 0-16.7 2.6A5.4 5.4 0 0 0 12.5 29Z"
            fill="#111"
            stroke="#fff"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path
            d="M12 28.5h17a6 6 0 0 0 .3-12 8.8 8.8 0 0 0-16.8 2.8A5.4 5.4 0 0 0 12 28.5Z"
            stroke="#fff"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "rain":
      return (
        <svg {...common}>
          <path
            d="M12 23h16.5a5.5 5.5 0 0 0 .2-11 8.2 8.2 0 0 0-15.8 2.5A5 5 0 0 0 12 23Z"
            stroke="#fff"
            strokeWidth="1.8"
          />
          <path d="M16 27v6M21 28v6M26 27v6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "storm":
      return (
        <svg {...common}>
          <path
            d="M12 22h16.5a5.5 5.5 0 0 0 .2-11 8.2 8.2 0 0 0-15.8 2.5A5 5 0 0 0 12 22Z"
            stroke="#fff"
            strokeWidth="1.8"
          />
          <path d="M21 23 17 31h5l-2 7 8-11h-5l4-4Z" fill="#F5C542" />
        </svg>
      );
    case "snow":
      return (
        <svg {...common}>
          <path
            d="M12 23h16.5a5.5 5.5 0 0 0 .2-11 8.2 8.2 0 0 0-15.8 2.5A5 5 0 0 0 12 23Z"
            stroke="#fff"
            strokeWidth="1.8"
          />
          <path d="M16 28v.01M21 29v.01M26 28v.01M18 33v.01M24 33v.01" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M10 27h22M12 22h18M14 17h14" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
  }
}

export function WeatherBar({ days }: { days: WeatherDay[] }) {
  return (
    <div className="weather">
      {days.map((day) => (
        <div className="weather-day" key={day.weekday}>
          <span className="weather-wd">{day.weekday}</span>
          <Icon name={day.icon} />
          <span className="weather-temp">{day.tempC}°C</span>
        </div>
      ))}
    </div>
  );
}
