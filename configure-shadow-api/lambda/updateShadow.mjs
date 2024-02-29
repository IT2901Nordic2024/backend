import { IoTDataPlaneClient, UpdateThingShadowCommand,  } from "@aws-sdk/client-iot-data-plane"; // ES Modules import

export const handler = async (event, context) => {
    // client for requesting shadow
    const client = new IoTDataPlaneClient({
        logger: console,
        endpoint: "https://a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"
    });

    // Create empty response
    let response = ""

    // Getting unnamed thing shadow, or send error messager
    //Help below!!!
    // https://stackoverflow.com/questions/68959299/iot-data-plane-client-aws-sdk-for-javascript-v3-function-updatethingshadowco
    try {
        const command = new UpdateThingShadowCommand({
            thingName: "firmwareSimulatorThing",
            payload: new Uint8Array(
                Buffer.from(
                    JSON.stringify({
                        "state": {
                            "desired": {
                                "BackendApollo": "landed"
                            }
                        }
                    })
                )
            )
        });
        console.log(command);
        response = await client.send(command);
    }
    catch (err){
        response = err.message
    }

    // Returning response to sender
    return response
}