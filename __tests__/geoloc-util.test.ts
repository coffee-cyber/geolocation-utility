import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)

const BASE_COMMAND = 'npx ts-node ./geoloc-util.ts --locations'

function normalizeText(text: string): string {
    return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line !== '')
        .join('\n')
}

function expectNormalizedOutput(actual: string, expected: string) {
    expect(normalizeText(actual)).toBe(normalizeText(expected))
}

describe('Geolocation Utility - Valid Inputs', () => {
    it('should return correct information for a valid city with state', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "Chicago, IL"`)
        const expectedOutput = `
            Location: Chicago, Illinois, US
            Latitude: 41.8755616
            Longitude: -87.6244212
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should return correct information for a valid zip code', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "60611"`)
        const expectedOutput = `
            Zip Code: 60611
            Location: Chicago, US
            Latitude: 41.8971
            Longitude: -87.6223
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should handle both city with state and zip locations at the same time', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "Chicago, IL" "60611"`)
        const expectedOutput = `
            Location: Chicago, Illinois, US
            Latitude: 41.8755616
            Longitude: -87.6244212
            
            Zip Code: 60611
            Location: Chicago, US
            Latitude: 41.8971
            Longitude: -87.6223
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should return correct information for a valid city without state', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "Atlanta"`)
        const expectedOutput = `
            Location: Atlanta, Georgia, US
            Latitude: 33.7489924
            Longitude: -84.3902644
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should handle multiple valid inputs of various types', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "Madison, WI" "12345" "Chicago, IL" "10001"`)
        const expectedOutput = `
            Location: Madison, Wisconsin, US
            Latitude: 43.074761
            Longitude: -89.3837613


            Zip Code: 12345
            Location: Schenectady, US
            Latitude: 42.8142
            Longitude: -73.9396
            
            
            Location: Chicago, Illinois, US
            Latitude: 41.8755616
            Longitude: -87.6244212
            
            
            Zip Code: 10001
            Location: New York, US
            Latitude: 40.7484
            Longitude: -73.9967
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should handle 20 locations provided at once', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "New York City" "Los Angeles" "Chicago" "Houston" "Phoenix" "Philadelphia" "San Antonio" "San Diego" "Dallas" "San Jose" "Austin" "Jacksonville" "Fort Worth" "Columbus" "Charlotte" "Indianapolis" "San Francisco" "Seattle" "Denver" "Nashville"`)
        const expectedOutput = `
            Location: New York County, New York, US
            Latitude: 40.7127281
            Longitude: -74.0060152
            
            
            Location: Los Angeles, California, US
            Latitude: 34.0536909
            Longitude: -118.242766
            
            
            Location: Chicago, Illinois, US
            Latitude: 41.8755616
            Longitude: -87.6244212
            
            
            Location: Houston, Texas, US
            Latitude: 29.7589382
            Longitude: -95.3676974
            
            
            Location: Phoenix, Arizona, US
            Latitude: 33.4484367
            Longitude: -112.074141
            
            
            Location: Philadelphia, Pennsylvania, US
            Latitude: 39.9527237
            Longitude: -75.1635262
            
            
            Location: San Antonio, Texas, US
            Latitude: 29.4246002
            Longitude: -98.4951405
            
            
            Location: San Diego, California, US
            Latitude: 32.7174202
            Longitude: -117.1627728
            
            
            Location: Dallas, Texas, US
            Latitude: 32.7762719
            Longitude: -96.7968559
            
            
            Location: San Jose, California, US
            Latitude: 37.3361663
            Longitude: -121.890591
            
            
            Location: Austin, Texas, US
            Latitude: 30.2711286
            Longitude: -97.7436995
            
            
            Location: Jacksonville, Florida, US
            Latitude: 30.3321838
            Longitude: -81.655651
            
            
            Location: Fort Worth, Texas, US
            Latitude: 32.753177
            Longitude: -97.3327459
            
            
            Location: Columbus, Ohio, US
            Latitude: 39.9622601
            Longitude: -83.0007065
            
            
            Location: Charlotte, North Carolina, US
            Latitude: 35.2272086
            Longitude: -80.8430827
            
            
            Location: Indianapolis, Indiana, US
            Latitude: 39.7683331
            Longitude: -86.1583502
            
            
            Location: San Francisco, California, US
            Latitude: 37.7790262
            Longitude: -122.419906
            
            
            Location: Seattle, Washington, US
            Latitude: 47.6038321
            Longitude: -122.330062
            
            
            Location: Denver, Colorado, US
            Latitude: 39.7392364
            Longitude: -104.984862
            
            
            Location: Nashville-Davidson, Tennessee, US
            Latitude: 36.1622767
            Longitude: -86.7742984
            `

        expectNormalizedOutput(stdout, expectedOutput)
    })
})

describe('Geolocation Utility - Invalid Inputs', () => {
    it('should return a friendly error message for no location provided', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} ""`)
        const expectedOutput = `
            No data found for city: 
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should handle non-existent location with a friendly error message', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "nonexistinglocation"`)
        const expectedOutput = `
            No data found for city: nonexistinglocation
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should handle mix of valid and non-existent locations', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "Chicago, IL" "nonexistinglocation"`)
        const expectedOutput = `
            Location: Chicago, Illinois, US
            Latitude: 41.8755616
            Longitude: -87.6244212

            No data found for city: nonexistinglocation
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })

    it('should return a friendly error message for invalid zip code', async () => {
        const {stdout} = await execAsync(`${BASE_COMMAND} "00000"`)
        const expectedOutput = `
            No data found for zip code: 00000
            `
        expectNormalizedOutput(stdout, expectedOutput)
    })
})