import { IoTDataPlaneClient, GetThingShadowCommand,  } from "@aws-sdk/client-iot-data-plane"; // ES Modules import

export const handler = async (event, context) => {
    // client for requesting shadow
    const client = new IoTDataPlaneClient({
        //logger: console,
        endpoint: "https://a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"
    });

    // Create empty response
    let response = ""

    // Getting unnamed thing shadow, or send error messager
    try {
        const command = new GetThingShadowCommand({
            thingName: "firmwareSimulatorThing",
        });
        response = await client.send(command);
    }
    catch (err){
        response = err.message
    }

    // Returning response to sender
    return response
}