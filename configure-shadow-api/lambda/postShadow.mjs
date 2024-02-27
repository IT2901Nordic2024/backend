export const handler = async (event, context) => {
    // Initiating response to sender
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    const url = "https://a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com/things/firmwareSimulatorThing/shadow?name=demo_shadow_delete_later"
    
    let response = await fetch(url);
    let data = await response.json();
    return data;

    return {
        body,
        statusCode,
        headers
    }

}