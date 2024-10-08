#!/usr/bin/env ts-node

import {Command} from 'commander'
import axios from 'axios'

// const API_KEY = 'f897a99d971b5eef57be6fafa0d83239'
const API_KEY = 'cb4bf78815e74de1e598b3c9b27391ea'
const GEO_API_BASE = 'http://api.openweathermap.org/geo/1.0'

// Types for API responses
interface CityGeoData {
    name: string
    lat: number
    lon: number
    country: string
    state?: string
}

interface ZipGeoData {
    zip: string
    name: string
    lat: number
    lon: number
    country: string
}

// Note: This function will always return only the first result
const getCityGeoLocation = async (city: string, state?: string): Promise<CityGeoData | null> => {
    try {
        const query = state ? `${city},${state},US` : city
        const response = await axios.get<CityGeoData[]>(`${GEO_API_BASE}/direct`, {
            params: {
                q: query, limit: 1, appid: API_KEY,
            },
        })

        if (response.data.length > 0) {
            return response.data[0] // Return the first (and only) result
        }
        return null
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error fetching data for ${city}${state ? `, ${state}` : ''}: ${error.message}`)
        } else {
            console.error(`Unknown error occurred while fetching data for ${city}${state ? `, ${state}` : ''}`)
        }
        return null
    }
}

const getZipGeoLocation = async (zip: string): Promise<ZipGeoData | null> => {
    try {
        const response = await axios.get<ZipGeoData>(`${GEO_API_BASE}/zip`, {
            params: {
                zip: `${zip},US`, // Assuming only US locations, per the requirement doc
                appid: API_KEY,
            },
        })

        return response.data
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                // Handle 404 error silently, as we'll display a user-friendly message later
                return null
            }
            console.error(`Error fetching data for zip code ${zip}: ${error.message}`)
        } else {
            console.error(`Unknown error occurred while fetching data for zip code ${zip}`)
        }
        return null
    }
}

const displayCityData = (data: CityGeoData) => {
    console.log(`
    Location: ${data.name}${data.state ? `, ${data.state}` : ''}, ${data.country}
    Latitude: ${data.lat}
    Longitude: ${data.lon}
  `)
}

const displayZipData = (data: ZipGeoData) => {
    console.log(`
    Zip Code: ${data.zip}
    Location: ${data.name}, ${data.country}
    Latitude: ${data.lat}
    Longitude: ${data.lon}
  `)
}

// Process multiple location inputs
export const processLocations = async (locations: string[]) => {
    if (locations.length === 0) {
        console.log('No locations provided.')
        return
    }

    for (const location of locations) {
        // Check if it's a zip code, a city/state format, or just a city
        if (/^\d{5}$/.test(location)) {
            // Handle zip code
            const zipData = await getZipGeoLocation(location)
            if (zipData) {
                displayZipData(zipData)
            } else {
                console.log(`No data found for zip code: ${location}`)
            }
        } else if (/^(.+),\s*(\w{2})$/.test(location)) {
            // Handle city/state
            const matches = location.match(/^(.+),\s*(\w{2})$/)
            if (matches) {
                const city = matches[1]
                const state = matches[2]
                const cityData = await getCityGeoLocation(city, state)
                if (cityData) {
                    displayCityData(cityData)
                } else {
                    console.log(`No data found for city/state: ${location}`)
                }
            }
        } else {
            // Handle single city (Note: Will return only the first match)
            const cityData = await getCityGeoLocation(location)
            if (cityData) {
                displayCityData(cityData)
            } else {
                console.log(`No data found for city: ${location}`)
            }
        }
    }
}

const program = new Command()

program
    .version('1.0.0')
    .description('Geolocation Utility CLI')
    .option('-l, --locations <locations...>', 'List of locations (city, city,state or zip code)')

program.parse(process.argv)

const options = program.opts()

const main = async () => {
    if (options.locations) {
        await processLocations(options.locations)
    } else {
        console.log('Please provide at least one location.')
    }
}

main().catch(error => console.error('Unexpected error:', error))