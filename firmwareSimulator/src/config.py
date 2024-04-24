#---------------------------------------------------------------------------
#                           Filepaths for certificates                  
#---------------------------------------------------------------------------

PATH_TO_DODECAHEDRON = '../firmwareSimulator/dodecahedron/dodecahedron.json'
CERT_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.cert.pem'
PRI_KEY_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.private.key'
ROOT_PEM_FILE_PATH = '../firmwareSimulator/certificates2/root.pem'
AWS_ENDPOINT = 'a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com'
PUB_KEY_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.public.key'

#CERT_FILEPATH = "../firmwareSimulator/certificates/firmwareSimulatorThing.cert.pem"
#PRI_KEY_FILEPATH = "../firmwareSimulator/certificates/firmwareSimulatorThing.private.key"
#CA_FILEPATH = "../firmwareSimulator/certificates/root.pem"
#AWS_ENDPOINT = "a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"

#---------------------------------------------------------------------------
#                                  Constants                  
#---------------------------------------------------------------------------

THING_NAME = CLIENT_ID = 'FirmwareSimulatorThing'                           # Using two variables for readability, because aws sometimes uses client_id and sometimes thingName.
POLICY_NAME = THING_NAME + 'Policy'
PUBLISH_MQTT_TOPIC = 'habit-tracker-data/' + THING_NAME + '/events'
REGION_NAME = 'eu-north-1'