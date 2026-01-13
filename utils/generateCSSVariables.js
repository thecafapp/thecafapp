export function generateCssVariables(themeObject) {
    let cssString = "";

    // This helper flattens the nested JSON into --key-subkey format
    const flatten = (obj, prefix = "-") => {
        for (const key in obj) {
            const value = obj[key];
            const name = `${prefix}-${key}`;

            if (typeof value === "object" && value !== null) {
                flatten(value, name);
            } else {
                cssString += `${name}: ${value};\n`;
            }
        }
    };

    flatten(themeObject);
    return cssString;
}