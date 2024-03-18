//import * as protobuf from 'protobufjs'

const PROTO_FILE = 'habit-event-storage\\proto-files\\fromFirmwareToBackend.proto'

export const handler = async (event, context) => {
  console.log(event.message)
  return event
}
