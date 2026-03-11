// if the code is used from sandboxes - redirect api requests to the scichart server
export const baseUrl =
    typeof window !== "undefined" &&
    !window.location.hostname.includes("scichart.com") &&
    !window.location.hostname.includes("localhost")
        ? "https://www.scichart.com/demo"
        : "";

/**
 * Helper class for the SciChart.Js JavaScript Chart examples to return datasets used throughout the examples
 */
export class ExampleDataProvider {
    static fetchLidarData() {
        return fetch(baseUrl + "api/lidardata");
    }
}

export const fetchLidarData = () => fetch(baseUrl + "api/lidardata");
