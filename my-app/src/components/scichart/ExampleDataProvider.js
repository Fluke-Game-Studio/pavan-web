export const baseUrl = "";

/**
 * Helper class for the SciChart.Js JavaScript Chart examples to return datasets used throughout the examples
 */
export class ExampleDataProvider {
    static fetchLidarData() {
        return fetch("/data/lidardata.txt");
    }
}

export const fetchLidarData = () => fetch("/data/lidardata.txt");
