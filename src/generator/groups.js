export default (data) => {
    for (const groupKey in data.groups) {
        const actionKeys = data.groups[groupKey].actions;
        for (const action in actionKeys) {
            if(!actionTypeIsFormed(data.groups[groupKey].actions[action])){
                data.groups[groupKey][action] = formActionString(action, data);
            } else {
                data.groups[groupKey][action] = data.groups[groupKey].actions[action];
            }
        }
    }
    return data;
}

//Actions which are already a function should not be converted
const actionTypeIsFormed = (action) => {
    if(!Array.isArray(action)){
        if ((typeof action == "function") || (typeof action == "object")) {
            return true;
        }
    }
    return false;
}

//Syntax of type.id.action used
const formActionString = (action, data) => {
    return () => {
        const funcs = [];
        const keys = Object.keys(action);
        for (const key of keys) {
            if (keyIsDelay(key)) {
                const delay = getDelayValue(key);
                funcs.push(async () => { await new Promise(r => setTimeout(r, delay)) });
                continue;
            }
            funcs.push(
                getActionFunc(action, data)
            )
        }
        //Execute the funcs
        (async () => {
            for (const func of funcs) {
                await func();
            }
        })()
    }
}

const getActionFunc = (path, data) => {
    let parts = path.split(".");
    if (parts[0] == "file") {
        parts = parts.slice(2);
    }
    let dataSegment = data;
    for (const part of parts) {
        dataSegment = dataSegment[part];
    }
    return dataSegment;
}

const keyIsDelay = (keyString) => {
    const keyParts = keyString.split(":");
    if (keyParts.length > 1) {
        return true;
    }
    return false;
}

const getDelayValue = (delayString) => {
    const delayValue = delayString.split(":")[1];
    return delayValue;
}