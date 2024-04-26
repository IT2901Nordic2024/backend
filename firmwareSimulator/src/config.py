#---------------------------------------------------------------------------
#                           Filepaths for certificates                  
#---------------------------------------------------------------------------

#PATH_TO_DODECAHEDRON = '../firmwareSimulator/dodecahedron/dodecahedron.json'
#CERT_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.cert.pem'
#PRI_KEY_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.private.key'
#ROOT_PEM_FILE_PATH = '../firmwareSimulator/certificates2/root.pem'
#AWS_ENDPOINT = 'a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com'
#PUB_KEY_FILE_PATH = '../firmwareSimulator/certificates2/FirmwareSimulatorThing.public.key'

CERT_FILE_PATH:str = "../FirmwareSimulator/certificates/FirmwareSimulatorThing.cert.pem"
PRI_KEY_FILE_PATH:str = "../FirmwareSimulator/certificates/FirmwareSimulatorThing.private.key"
ROOT_PEM_FILE_PATH:str = "../FirmwareSimulator/certificates/root.pem"
AWS_ENDPOINT:str = "a2aclgd4nh1dkk-ats.iot.eu-north-1.amazonaws.com"
PUB_KEY_FILE_PATH:str = '../FirmwareSimulator/certificates/FirmwareSimulatorThing.public.key'
PATH_TO_DODECAHEDRON:str = '../FirmwareSimulator/dodecahedron/dodecahedron.json'



#---------------------------------------------------------------------------
#                                  Constants                  
#---------------------------------------------------------------------------

THING_NAME = CLIENT_ID = 'FirmwareSimulatorThing'                           # Using two variables for readability, because aws sometimes uses client_id and sometimes thingName.
POLICY_NAME = THING_NAME + 'Policy'
PUBLISH_MQTT_TOPIC:str = 'habit-tracker-data/' + THING_NAME + '/events'
REGION_NAME:str = 'eu-north-1'

#---------------------------------------------------------------------------
#                                   MQTT topics               
#---------------------------------------------------------------------------
AWS_THING_SHADOW_MQTT_GET_TOPIC:str = "$aws/things/" + THING_NAME+ "/shadow/get"
AWS_THING_SHADOW_MQTT_UPDATE:str = "$aws/things/" + THING_NAME+ "/shadow/update"
AWS_THING_SHADOW_MQTT_UPDATE_DELTA:str = "$aws/things/" + THING_NAME+ "/shadow/update/delta"