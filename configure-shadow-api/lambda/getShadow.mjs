import { IoTDataPlaneClient, GetThingShadowCommand } from '@aws-sdk/client-iot-data-plane' // ES Modules import

export const handler = async (event) => {
  // client for requesting shadow
  const client = new IoTDataPlaneClient({})
  // Create empty response
  let response = ''

  // Getting unnamed thing shadow, or send error messager
  try {
    // deviceId from URL-path
    const deviceId = event.pathParameters.deviceId

    // Get Command
    const command = new GetThingShadowCommand({
      thingName: deviceId,
    })
    response = await client.send(command)
  } catch (err) {
    response = err.message
  }

  // Converting raw Uint8Array to human readable JSON
  const responsePayload = response.payload
  const uint8ArrayToString = String.fromCharCode.apply(null, responsePayload)
  const json = JSON.parse(uint8ArrayToString)

  // Returning json to sender
  return json
}
