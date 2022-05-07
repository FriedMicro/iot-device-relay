import fs from "fs";

export default () => {
    const rawData = fs.readFileSync("./config.json");
    const parsedConfig = JSON.parse(rawData);
    return parsedConfig;
}