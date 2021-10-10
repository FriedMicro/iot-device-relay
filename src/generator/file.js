//Load and combine all JSON config files into one object
import fs from "fs";
import _ from "lodash";

const fileCache = {};

export default () => {
    const data = fs.readFileSync("./data/devices.json");
    const parsedData = JSON.parse(data);
    addGroupImports(parsedData);
    addDeviceImports(parsedData);
    return parsedData;
}

const getImportData = (group) => {
    const importParts = group.split(".");
    const fileNamePart = importParts[1];
    const importPart = importParts[2];
    const filePath = `./data/external/${fileNamePart}.json`;
    if(!fileCache[filePath]){
        const data = fs.readFileSync(filePath);
        const parsedData = JSON.parse(data);
        fileCache[filePath] = parsedData;
    }
    const importedData = fileCache[filePath][importPart];
    return importedData;
}

const addGroupImports = (data) => {
    const groups = data.groups;
    for(const group of groups){
        if(typeof group == "string"){
            const importData = getImportData(group);
            data.groups.push(...importData);
            _.remove(data.groups, (item) => {
                return item == group;
            }) 
        }
    }
    return data;
}

const addDeviceImports = (data) => {
    const types = data.types;
    for(const type in types){
        const deviceType = types[type];
        const devices = deviceType.devices;
        for(const device of devices){
            if(typeof device == "string"){
                const importData = getImportData(device);
                devices.push(...importData);
                _.remove(devices, (item) => {
                    return item == device;
                }) 
            }
        }
    }
    return data;
}