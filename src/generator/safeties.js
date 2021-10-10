//Add network retry logic, batched sending, state checking, delays, etc
import _ from "lodash";

export default (data) => {
    for (const type in data.devices) {
        for (const deviceId in data.devices[type]) {
            const device = data.devices[type][deviceId];
            const dataFunc = device.data;
            data.devices[type][deviceId] = convertActions(dataFunc, device);
        }
    }
    for(const groupId in data.groups){
        const actions = data.groups[groupId].actions;
        for(const actionKey in actions){
            const action = actions[actionKey];
            if(Array.isArray(action)){
                data.groups[groupId].actions[actionKey] = convertGroupActions(action);
            } else {
                for(const nestedActionKey in action){
                    const parent = action[nestedActionKey];
                    for(const nestedAction in parent){
                        const actionsArray = parent[nestedAction];
                        data.groups[groupId].actions[actionKey][nestedActionKey][nestedAction] = convertGroupActions(actionsArray);
                    }
                }
            }
        }
    }
    return data;
}

const convertGroupActions = (netRequests) => {
    const conditionalRequests = [];
    for (const request of netRequests){
        const requestFunc = convertAction(request.data, [request])
        conditionalRequests.push(requestFunc);
    }
    return () => {
        for(const request of conditionalRequests){
            request();
        }
    }
}

const convertActions = (dataFunc, device) => {
    for (const prop in device) {
        if (Array.isArray(device[prop])) {
            device[prop] = convertAction(dataFunc, device[prop]);
        }
    }
    return device;
}

const convertAction = (dataFunc, requests) => {
    const cloneRequests = _.cloneDeep(requests);
    return (params) => {
        dataFunc().then((state) => {
            for (const request of cloneRequests) {
                const evalCondition = `const state=${JSON.stringify(state)}.state; ${request.condition}`;
                if (eval(evalCondition)) {
                    executeRequest(request, params);
                }
            }
        })
    }
}

const executeRequest = (request, params) => {
    setTimeout(() => {
        request.net(params).then(() => {
        }).catch(() => {
            setTimeout(() => {
                request.net(params).catch(() => {
                    executeRequest();
                })
            }, 15000);
        })
    }, request.delay)
}