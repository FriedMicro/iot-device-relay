import generator from "./generator/file.js";
import formatter from "./generator/formatter.js";
import safeties from "./generator/safeties.js";
import groups from "./generator/groups.js";

const data = generator();
const formattedData = formatter(data);
const finalFormat = safeties(formattedData);
const groupedData = groups(finalFormat);
console.log(groupedData.devices);