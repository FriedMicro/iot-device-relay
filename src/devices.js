import fs from "fs";

const filePaths = [];

export default (path) => {
    itterateDir(path);
    const deviceRoutes = cleanPaths();
    return deviceRoutes;
}

const cleanPaths = () => {
    const cleanedPaths = [];
    for(const path of filePaths){
        const noJsExtension = path.replace(".js", "");
        const noLocalPrefx = noJsExtension.replace(".", "");
        cleanedPaths.push(noLocalPrefx);
    }
    return cleanedPaths;
}

const itterateDir = (path) => {
    const inodes = fs.readdirSync(path);
    for(const inode of inodes){
        const inodePath = `${path}/${inode}`;
        if(fs.lstatSync(inodePath).isDirectory()){
            itterateDir(inodePath);
        } else {
            filePaths.push(inodePath)
        }
    }
}