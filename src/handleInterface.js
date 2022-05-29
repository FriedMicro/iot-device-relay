import _ from "lodash";
import fs from "fs";
import config from "./config.js";

const formParamPaths = (files) => {
    const temp = [];
    for (const file of files) {
        const parts = file.split("/");
        const backUrl = parts.slice(2);
        temp.push(backUrl);
    }
    return temp;
}

const formFuncNames = (files) => {
    const formedFuncNameArray = [];
    for (const file of files) {
        let containedParts = "";
        for (let i = 0; i < file.length; i++) {
            const part = file[i];
            var casedPart = part;
            if (i != 0) {
                casedPart = _.capitalize(part);
            }
            containedParts += casedPart;
        }
        formedFuncNameArray.push(containedParts);
    }
    return formedFuncNameArray;
}

const combineUrlToPath = (funcNames, paths) => {
    const url = {};
    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const funcName = funcNames[i];
        url[funcName] = path;
    }
    return url;
}

const fsWrite = (deviceMap) => {
    const generatedSourceFile = "devicesGenerated.js";
    try {
        fs.unlinkSync(generatedSourceFile);
    } catch (e) {}
    const initCode = `import axios from "axios";
`;
    fs.writeFileSync(generatedSourceFile, initCode);
    for (const device in deviceMap) {
        const devicePath = deviceMap[device];
        const deviceCode = `
let ${device} = (state) => {
    const requestPath = "http://${config().device_ip}:${config().port}${devicePath}";
    return axios.post(requestPath, {
        state: state,
        params: {}
    });
}
`;
        fs.appendFileSync(generatedSourceFile, deviceCode);
    }

    const deviceOverridesFile = "deviceOverrides.js";
    if (fs.existsSync(deviceOverridesFile)) {
        const overrideData = fs.readFileSync(deviceOverridesFile, "utf-8");
        fs.appendFileSync(generatedSourceFile, overrideData);
    }

    for (const device in deviceMap) {
        const functionExports = `
export {${device}};
`;
        fs.appendFileSync(generatedSourceFile, functionExports);
    }
}

export default (files) => {
    const paths = formParamPaths(files);
    const funcNames = formFuncNames(paths);
    const dataMap = combineUrlToPath(funcNames, files);
    fs.writeFileSync("devices.json", JSON.stringify(dataMap));
    fsWrite(dataMap);
    console.log(dataMap);
}