//Translate the loaded data in the appropriate structure and functions
import axios from "axios";
import _ from "lodash";

export default (data) => {
    const formattedObj = {
        groups: {},
        devices: {}
    };

    for (const type in data.types) {
        const devices = data.types[type].devices
        formattedObj.devices[type] = {};
        for (const device of devices) {
            formattedObj.devices[type][device.id] = {
                ...getDeviceProps(device),
                data: getData(device),
                ...getActions(device)
            }
        }
    }

    for (const groupKey in data.groups) {
        const group = data.groups[groupKey];
        formattedObj.groups[group.id] = {
            ...getDeviceProps(group),
            actions: getActions(group)
        };
    }
    return formattedObj;
}

const getDeviceProps = (device) => {
    return {
        manufactuer: device.manufactuer,
        display: device.display
    }
}

const parseStringToFunc = (funcString, funcParamName) => {
    const funcStringNoNewlines = funcString.replace(/(\r\n|\n|\r)/gm, "");
    const funcStringCompact = funcStringNoNewlines.replace(/\s+/g, ' ');
    const funcStringParsed = `return (${funcStringCompact})(${funcParamName})`;
    return funcStringParsed;
}

const createAndExecuteFunc = (funcParamName, funcString, data) => {
    return Function(funcParamName, funcString)(data);
}

const paramsToReplace = (params) => {
    const replaceParams = []
    for (const param in params) {
        if (typeof params[param] == "string") {
            const paramPart = params[param].split(".")[0];
            if (paramPart == "params") {
                replaceParams.push(param);
            }
        }
    }
    return replaceParams;
}

const replaceParams = (netParams, userParams) => {
    const replacements = paramsToReplace(netParams);
    replacements.forEach((param, index) => {
        netParams[param] = userParams[index];
    })
    return netParams;
}

const createNetRequest = (netData) => {
    const netClone = _.cloneDeep(netData);
    return (...userParams) => {
        if (netClone.returnMap) {
            var returnMap = parseStringToFunc(netClone.returnMap, "data");
        }
        userParams = replaceParams(netData.params, userParams);
        if (netClone.paramFunc) {
            var paramMap = parseStringToFunc(netClone.paramFunc, "params");
            userParams = createAndExecuteFunc("params", paramMap, userParams);
        }
        return new Promise((resolve, reject) => {
            axios({
                method: netClone.method,
                url: netClone.url,
                data: userParams
            }).then((rawResponse) => {
                let response = rawResponse.data;
                if (returnMap) {
                    response = createAndExecuteFunc("data", returnMap, response);
                }
                resolve(response);
            }).catch((err) => {
                reject(err);
            })
        })
    }
}

const getData = (device) => {
    if (device.data) {
        return createNetRequest(device.data);
    }
    return () => {
        return new Promise((resolve) => {
            resolve(undefined);
        });
    }
}

const getActions = (device) => {
    const actionsObj = {};
    for (const action in device.actions) {
        if (Array.isArray(device.actions[action])) {
            actionsObj[action] = [];
            for (const request of device.actions[action]) {
                const netObj = createNetObj(request);
                actionsObj[action].push(netObj);
            }
        } else {
            actionsObj[action] = getNestedAction(device.actions[action]);
        }
    }
    return actionsObj;
}

const getNestedAction = (device) => {
    const actionsObj = {};
    for (const action in device) {
        actionsObj[action] = {};
        if (!Array.isArray(device[action])) {
            for(const method in device[action]){
                const request = device[action][method];
                const requestObj = createNetObj(request);
                actionsObj[action][method] = [];
                actionsObj[action][method].push(requestObj);
            }
        } else {
            for (const request of device[action]) {
                const requestObj = createNetObj(request);
                actionsObj[action].push(requestObj);
            }
        }
    }
    return actionsObj;
}

const createNetObj = (request) => {
    return {
        net: createNetRequest(request),
        condition: request.condition ? request.condition : true,
        delay: request.delay ? request.delay : 0,
        data: request.data ? getData(request.data) : getData({})
    }
}