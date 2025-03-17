function getTimezoneOffset(atTime, timeZone) {
    const localizedTime = new Date(atTime.toLocaleString("en-US", { timeZone }));
    const utcTime = new Date(atTime.toLocaleString("en-US", { timeZone: "UTC" }));
    return Math.round((localizedTime.getTime() - utcTime.getTime()) / (60 * 1000));
}

const isDST = (d = new Date()) => {
    let jan = getTimezoneOffset(new Date(d.getFullYear(), 0, 1), "America/Chicago");
    let jul = getTimezoneOffset(new Date(d.getFullYear(), 6, 1), "America/Chicago");
    console.log(jan, jul);
    console.log(getTimezoneOffset(d, "America/Chicago"));
    return Math.max(jan, jul) === getTimezoneOffset(d, "America/Chicago");
}

export default isDST;