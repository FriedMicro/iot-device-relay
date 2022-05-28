import _ from "lodash";
import fs from "fs";

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

export default (files) => {
    const paths = formParamPaths(files);
    const funcNames = formFuncNames(paths);
    const dataMap = combineUrlToPath(funcNames, files);
    fs.writeFileSync("devices.json", JSON.stringify(dataMap));
    console.log(dataMap);
}