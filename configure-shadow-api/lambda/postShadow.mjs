import { IoTDataPlaneClient, GetThingShadowCommand,  } from "@aws-sdk/client-iot-data-plane"; // ES Modules import

export const handler = async (event, context) => {
    // Initiating response to sender
    const client = new IoTDataPlaneClient({
        region: "eu-north-1",
        logger: console,
        endpoint: "https://a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"
    });
    let response = ""
    try {
        const command = new GetThingShadowCommand({
            thingName: "firmwareSimulatorThing",
            //shadowName: "shadow?name=demo_shadow_delete_later"   
            //shadow?name=demo_shadow_delete_later
        });
        response = await client.send(command);
    }
    catch (err){
        response = err.message
    }

    return response
}