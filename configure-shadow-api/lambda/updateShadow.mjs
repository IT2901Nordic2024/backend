import { IoTDataPlaneClient, UpdateThingShadowCommand,  } from "@aws-sdk/client-iot-data-plane"; // ES Modules import

export const handler = async (event, context) => {
    // client for requesting shadow
    const client = new IoTDataPlaneClient({
        // logger: console,
        endpoint: "https://a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"
    });

    // Create empty response
    let response = ""

    // Updating unnamed thing shadow, or send error messager
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
                                "BackendApollo": "LandedOnEarthAgain"
                            }
                        }
                    })
                )
            )
        });
        response = await client.send(command);
    }
    catch (err){
        response = err.message
    }

    // Converting raw Uint8Array to human readable JSON (may be useless for updateShadow)
    const responsePayload = response.payload
    const uint8ArrayToString = String.fromCharCode.apply(null, responsePayload)
    const json = JSON.parse(uint8ArrayToString)


    // Returning json to sender
    return json
}