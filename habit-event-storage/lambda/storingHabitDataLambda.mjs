//const PROTO_FILE = 'habit-event-storage\\proto-files\\fromFirmwareToBackend.proto'

export const handler = async (event, context) => {
  /*protobuf.load(PROTO_FILE, function (err, root) {
    if (err) {
      throw err
    }
    // Get message type
    let habit_data_message = root.lookup('habitdatapackage.habit_data')

    // Decode message
    let message = habit_data_message.decode(event)
    console.log(message)
  })*/
  console.log('Hello World')
  console.log(event)
  return event
}
