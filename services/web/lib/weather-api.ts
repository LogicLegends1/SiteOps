import axios from "axios"

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

type WeatherCondition = "sunny" | "cloudy" | "rainy" | "stormy"
type ImpactLevel = "none" | "low" | "moderate" | "severe"

function toISODate(unixSeconds: number) {
  return new Date(unixSeconds * 1000).toISOString().split("T")[0]
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function msToKmh(ms: number) {
  if (!Number.isFinite(ms)) return 0
  return Math.round(ms * 3.6)
}

// Fetch raw data from OpenWeather.
// Fetches 5-day /3h forecast; falls back to current weather.
export const fetchWeatherForecast = async (lat: number, lon: number) => {
  if (!API_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_OPENWEATHER_API_KEY (required for OpenWeather requests)."
    )
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          lat,
          lon,
          units: "metric",
          appid: API_KEY,
        },
      }
    )
    return response.data
  } catch (forecastError) {
    try {
      const response = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: {
          lat,
          lon,
          units: "metric",
          appid: API_KEY,
        },
      })
      return response.data
    } catch {
      throw forecastError
    }
  }
}

// Transform OpenWeather payload → UI format.
// Supports One Call (`daily[]`), 5-day forecast (`list[]`), or current weather.
export const transformWeatherData = (data: any) => {
  if (data?.daily && Array.isArray(data.daily)) {
    return data.daily.slice(0, 7).map((day: any) => {
      const condition: WeatherCondition = mapCondition(day?.weather?.[0]?.main)
      const popFraction = Number.isFinite(day?.pop) ? Number(day.pop) : 0
      const windMs = Number.isFinite(day?.wind_speed) ? Number(day.wind_speed) : 0
      const humidity = Number.isFinite(day?.humidity) ? Number(day.humidity) : 0

      return {
        date: toISODate(day.dt),
        temperature: Math.round(day?.temp?.day ?? day?.temp?.max ?? 0),
        condition,
        humidity,
        windSpeed: msToKmh(windMs),
        precipitation: clampPercent(popFraction * 100),
        impactLevel: calculateImpact(condition, popFraction, windMs),
      }
    })
  }

  if (data?.list && Array.isArray(data.list)) {
    // Group 3-hour slices into daily buckets.
    const byDate = new Map<
      string,
      {
        temps: number[]
        humidities: number[]
        popMax: number
        windMs: number[]
        conditions: string[]
      }
    >()

    for (const item of data.list) {
      const date = typeof item?.dt === "number" ? toISODate(item.dt) : null
      if (!date) continue

      const bucket = byDate.get(date) ?? {
        temps: [],
        humidities: [],
        popMax: 0,
        windMs: [],
        conditions: [],
      }

      if (Number.isFinite(item?.main?.temp)) bucket.temps.push(Number(item.main.temp))
      if (Number.isFinite(item?.main?.humidity)) bucket.humidities.push(Number(item.main.humidity))
      if (Number.isFinite(item?.pop)) bucket.popMax = Math.max(bucket.popMax, Number(item.pop))
      if (Number.isFinite(item?.wind?.speed)) bucket.windMs.push(Number(item.wind.speed))
      if (item?.weather?.[0]?.main) bucket.conditions.push(String(item.weather[0].main))

      byDate.set(date, bucket)
    }

    const days = Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .slice(0, 7)
      .map(([date, bucket]) => {
        const avgTemp = bucket.temps.length
          ? bucket.temps.reduce((a, b) => a + b, 0) / bucket.temps.length
          : 0
        const avgHumidity = bucket.humidities.length
          ? bucket.humidities.reduce((a, b) => a + b, 0) / bucket.humidities.length
          : 0
        const avgWindMs = bucket.windMs.length
          ? bucket.windMs.reduce((a, b) => a + b, 0) / bucket.windMs.length
          : 0

        // Pick the most frequent condition in that day.
        const freq = new Map<string, number>()
        for (const c of bucket.conditions) freq.set(c, (freq.get(c) ?? 0) + 1)
        const mostCommon = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])?.[0]?.[0]
        const condition: WeatherCondition = mapCondition(mostCommon)

        return {
          date,
          temperature: Math.round(avgTemp),
          condition,
          humidity: Math.round(avgHumidity),
          windSpeed: msToKmh(avgWindMs),
          precipitation: clampPercent(bucket.popMax * 100),
          impactLevel: calculateImpact(condition, bucket.popMax, avgWindMs),
        }
      })

    return days
  }

  // Current weather shape (single day)
  const condition: WeatherCondition = mapCondition(data?.weather?.[0]?.main)
  const windMs = Number.isFinite(data?.wind?.speed) ? Number(data.wind.speed) : 0
  const humidity = Number.isFinite(data?.main?.humidity) ? Number(data.main.humidity) : 0
  const hasRain = Boolean(data?.rain?.["1h"] || data?.rain?.["3h"])
  const precipitationPercent = hasRain ? 70 : 0

  return [
    {
      date: typeof data?.dt === "number" ? toISODate(data.dt) : toISODate(Math.floor(Date.now() / 1000)),
      temperature: Math.round(Number(data?.main?.temp ?? 0)),
      condition,
      humidity,
      windSpeed: msToKmh(windMs),
      precipitation: precipitationPercent,
      impactLevel: calculateImpact(condition, precipitationPercent / 100, windMs),
    },
  ]
}

// Map OpenWeather → your enum
function mapCondition(main?: string): WeatherCondition {
  const normalized = (main ?? "").toLowerCase()
  switch (normalized) {
    case "clear":
      return "sunny"
    case "clouds":
      return "cloudy"
    case "rain":
    case "drizzle":
    case "snow":
      return "rainy"
    case "thunderstorm":
    case "tornado":
    case "squall":
      return "stormy"
    default:
      return "cloudy"
  }
}

// Decide risk level
function calculateImpact(condition: WeatherCondition, popFraction: number, windMs: number): ImpactLevel {
  // `popFraction` is 0..1 probability of precipitation.
  // `windMs` is meters/second as returned by OpenWeather.
  if (condition === "stormy" || windMs > 11.1) return "severe" // ~40 km/h
  if (condition === "rainy" || popFraction > 0.5) return "moderate"
  if (condition === "cloudy") return "low"
  return "none"
}