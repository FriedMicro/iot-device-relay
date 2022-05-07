export default async (codePaths) => {
    const files = {};
    for (const file of codePaths) {
        const codePath = `../${file}.js`;
        files[file] = await import(codePath);
    }
    return files;
}