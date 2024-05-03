/* global Buffer */

import { IoTDataPlaneClient, UpdateThingShadowCommand } from '@aws-sdk/client-iot-data-plane' // ES Modules import

export const handler = async (event) => {
  // client for requesting shadow
  const client = new IoTDataPlaneClient({})

  // Create empty response
  let response = ''

  // Updating unnamed thing shadow, or send error messager
  try {
    // Data from URL-path
    const deviceId = event.pathParameters.deviceId
    const habitId = event.pathParameters.habitId
    const deviceSide = event.pathParameters.deviceSide

    //Command for updating shadow
    const command = new UpdateThingShadowCommand({
      thingName: deviceId,
      payload: new Uint8Array(
        Buffer.from(
          JSON.stringify({
            state: {
              desired: {
                [deviceSide]: habitId,
              },
            },
          })
        )
      ),
    })
    response = await client.send(command)
  } catch (err) {
    response = err.message
  }

  // Converting raw Uint8Array to human readable JSON (may be useless for updateShadow)
  const responsePayload = response.payload
  const uint8ArrayToString = String.fromCharCode.apply(null, responsePayload)
  const json = JSON.parse(uint8ArrayToString)

  // Returning json to sender
  return json
}
