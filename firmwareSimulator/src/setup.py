import io
import boto3
import boto3.session
import requests
import json
import config

class FirmwareSimulatorThingSetup:
    def __init__(self, region_name:str, certificate_file_path:str, private_key_file_path:str, public_key_file_path:str, root_ca1_pem_file_path:str, aws_endpoint:str, thing_name:str = "FirmwareSimulatorThing"):
        self.thing_name = thing_name
        self.region_name:str = region_name
        self.certificate_file_path:str = certificate_file_path
        self.private_key_file_path:str = private_key_file_path
        self.public_key_file_path:str = public_key_file_path
        self.root_ca1_pem_file_path:str = root_ca1_pem_file_path
        self.aws_endpoint:str = aws_endpoint
        self.session = boto3.session.Session(region_name=self.region_name)
        self.iot_client = self.session.client('iot')
        self.account_id:str = self.session.client('sts').get_caller_identity()['Account'] # sts stands for AWS Security Token Service
        self.iot_data_client = self.session.client('iot-data')

    def create_certificates(self) -> tuple[str,str]:
        """Method that generates the private_key, public_key, certificate and the root_ca1_pem.
        The results are written to the files specified via the file paths defined in the __init__() method
        
        --------------
        Return values:
        --------------
        certificate_ARN:    (string) The ARN of the certificate
        certificate_ID:     (string) The ID of the certificate
        These values are returned as a tuple whith the certificate_ARN being the first element

        """

        create_keys_and_certificate_response:dict = self.iot_client.create_keys_and_certificate(setAsActive=True) # response will be a dict containing: certificateArn, certificateId, certificatePem and keyPair (dict that contains the private and public key)

        certificate_ARN:str = create_keys_and_certificate_response['certificateArn']
        certificateID:str = create_keys_and_certificate_response['certificateId']


        # Creating and writing the cerificates, keys and permissions to specified files

        with open(self.private_key_file_path, 'a') as private_key_file:
            private_key_file.write(create_keys_and_certificate_response['keyPair']['PrivateKey'])
        
        with open(self.public_key_file_path, 'a') as public_key_file:
            public_key_file.write(create_keys_and_certificate_response['keyPair']['PublicKey'])

        with open(self.certificate_file_path, 'a') as certificate_file:
            certificate_file.write(create_keys_and_certificate_response['certificatePem'])
        
        # Getting the root certificate needed for communicating with AWS using MQTT

        try:
            root_ca1_url:str = 'https://www.amazontrust.com/repository/AmazonRootCA1.pem'
            root_ca1_response = requests.get(root_ca1_url)

            if root_ca1_response.status_code == 200: # success
                # Save the root certificate
                with open(self.root_ca1_pem_file_path, 'a') as root_ca1_pem_file:
                    root_ca1_pem_file.write(root_ca1_response.content.decode('utf-8')) # Decoding from bytes to string

            else: # Failure / Non 200 code
                raise  Exception("Failed to download the root CA certificate from {}. Status code: {}".format(root_ca1_url,root_ca1_response.status_code))

        except Exception as error:
            raise Exception("Error downloading root CA certificate from {}".format(root_ca1_url, str(error)))
        
        return (certificate_ARN,certificateID)



    def create_policy(self, policy_name:str, policy_description:str | None = None) -> str:
        """Create the policy that specifies what the thing representing the FirmwareSimulator 
        can do.
        --------------
        Parameters:
        --------------

        policy_name:            (string) Name of the policy to be defined
        policy_description:     (string) Description of the policy to be defined
             
        --------------
        Return values:
        --------------
        policy_name:            (string) Name of the policy to be defined 
        """
            
        # Adding default description for policy
        if policy_description == None:
            policy_description = "Policy for the FirmwareSimulatorThing that gives the firmware simulator the necessary permissions to publish and connect to MQTT topics such as: '${iot:Connection.Thing.ThingName}/events' and 'client/${iot:Connection.Thing.ThingName}'"
            
        # Resources

        # publish_receive_publishretain_resource_ARN:str = "arn:aws:iot:" + self.region_name + ":" + self.account_id + ":topic/habit-tracker-data/${iot:Connection.Thing.ThingName}/events"
        publish_receive_publishretain_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":topic/" + config.PUBLISH_MQTT_TOPIC # using "*" for region and account_id, because the connection is refused for some reason otherwise.
        allow_connect_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":client/" + self.thing_name # using "*" for region and account_id, because the connection is refused for some reason otherwise.
        
        allow_update_thing_shadow_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":client/" + self.thing_name
        
        ## Topic to which we publish an empty message in order to get the shadow of a device
        publish_get_from_thing_shadow_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":topic/$aws/things/" + self.thing_name + "/shadow/get"

        ## Topic to which AWS IoT publishes an error response document when it cannot return a device shadow
        subscribe_thing_shadow_get_rejected_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" +":topicfilter/$aws/things/"+ self.thing_name + "/shadow/get/rejected"
        receive_thing_shadow_get_rejected_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" +":topic/$aws/things/"+ self.thing_name + "/shadow/get/rejected"
        
        ## Topic to which AWS IoT publishes a response shadow document when returning the device shadow
        subscribe_thing_shadow_get_accepted_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":topicfilter/$aws/things/" + self.thing_name + "/shadow/get/accepted"
        receive_thing_shadow_get_accepted_resource_ARN:str = "arn:aws:iot:" + "*" + ":" + "*" + ":topic/$aws/things/" + self.thing_name + "/shadow/get/accepted"
        
        # Policy document
        firmare_simulator_policy_document:dict = {

                                                "Version": "2012-10-17",

                                                "Statement": [

                                                    {

                                                    "Effect": "Allow",

                                                    "Action": [

                                                        "iot:Publish",

                                                        "iot:Receive",

                                                        "iot:PublishRetain"

                                                    ],

                                                    "Resource": [publish_receive_publishretain_resource_ARN,
                                                                 publish_get_from_thing_shadow_resource_ARN,
                                                                 receive_thing_shadow_get_accepted_resource_ARN,
                                                                 receive_thing_shadow_get_rejected_resource_ARN]

                                                    },
                                                    {
                                                        "Effect": "Allow",
                                                        "Action": ["iot:Subscribe"],
                                                        "Resource": [subscribe_thing_shadow_get_accepted_resource_ARN,
                                                                     subscribe_thing_shadow_get_rejected_resource_ARN]
                                                    },

                                                    {

                                                    "Effect": "Allow",

                                                    "Action": ["iot:Connect"],

                                                    "Resource": [allow_connect_resource_ARN]

                                                    },
                                                    {
                                                        "Effect": "Allow",
                                                        "Action":["iot:UpdateThingShadow"],
                                                        "Resource": [allow_update_thing_shadow_resource_ARN]
                                                    }

                                                ]

                                            }
        firmware_simulator_thing_policy_response:dict = self.iot_client.create_policy(
            policyName = policy_name,
            policyDocument = json.dumps(firmare_simulator_policy_document),
        )

        # Checking whether policy was created successfully
        list_of_policy_names:list[str] = [policy['policyName'] for policy in self.iot_client.list_policies()['policies']]
        if policy_name in list_of_policy_names:
            print("SUCCESS: Policy with name {} successfully created!".format(policy_name))
        else:
            raise Exception("FAILURE: Policy with name {} not created!".format(policy_name))

        return policy_name
        

    def create_firmware_simulator_aws_thing(self) -> tuple[str, str]:
        """Method that creates the FirmwareSimulatorThing
        
        
        --------------
        Return values:
        --------------
        thing_ARN:      (string) The Arn of the FirmwareSimulatorAWSThing
        thing_ID:       (string) The ID of the FirmWareSimulatorAWSThing
        The above values are returned as elements of a tuple with thing_ARN being the first element
        and thing_ID being the second element.

        """
        create_thing_response:dict = self.iot_client.create_thing(thingName = self.thing_name) # This will be a dict containing thingName, thingArn and thingId

        thing_ARN:str = create_thing_response['thingArn']
        thing_ID:str = create_thing_response['thingId']

        # Checking if the thing got created
        list_of_thing_names:list[str] = [thing['thingName'] for thing in self.iot_client.list_things()['things']]
        if self.thing_name in list_of_thing_names:
            print("SUCCESS: Thing with name {} successfully created!".format(self.thing_name))
        else:
            raise Exception("FAILURE: Thing with name {} not created!".format(self.thing_name))


        return (thing_ARN, thing_ID)
    


    def attach_policy_and_thing_principal_to_firmware_simulator_aws_thing(self, policy_name:str, certificate_ARN:str) -> None:
        """A method that attaches a specified policy to a given certificate and then adds that certificate to a given AWS IoT thing.
        The name of the AWS IoT thing is given by self.thing_name.

        Args:
            policy_name (str): The name of the policy to be attached to the AWS IoT thing
            certificate_ARN (str): The Arn of the resource to which the policy is to be attached. Also, the certificate which will be added to the AWS IoT thing as principal.
        """
        attach_policy_response:None = self.iot_client.attach_policy(
            policyName = policy_name,
            target = certificate_ARN
        )
        
        # attach_thing_principal_response is an empty dict
        attach_thing_principal_response:dict = self.iot_client.attach_thing_principal(
            thingName = self.thing_name,
            principal = certificate_ARN
        )

    def update_or_create_device_shadow(self)-> None:
        """Method that uses the dodecahedron file specified in config.PATH_TO_DODECAHEDRON
        to create a thing shadow for the thing created with this setup class.
        The dodecahedron json file is here used to create an initial state for the shadow."""
        with open(config.PATH_TO_DODECAHEDRON, 'r') as dodecahedron_json_file:
            original_json = dodecahedron_json_file.read()

        # Modifies the dodecahedron json to meet AWS requirements for uploading payload
        desired_json = {"desired":json.loads(original_json)}
        modified_json = {"state":desired_json}               
        modified_json = json.dumps(modified_json)

        update_or_create_response = self.iot_data_client.update_thing_shadow(
            thingName = self.thing_name,
            payload = modified_json
        )

    def delete_device_shadow(self) -> None:
        """Method that deletes the device shadow of the AWS thing created with this class."""
        delete_device_shadow_response:dict = self.iot_data_client(thingName = self.thing_name)

    def list_all_aws_iot_policies(self) -> dict:
        """Returns all the AWS IoT policies assoicated with self.iot_client

        Returns:
            dict: All AWS IoT policies associated with self.iot_client
        """
        return self.iot_client.list_policies()

    def list_all_aws_iot_things(self) -> dict:
        """Returns all AWS IoT things assoicated with self.iot_client.

        Returns:
            dict: All AWS IoT things associated with self.iot_client.
        """
        return self.iot_client.list_things()

    def list_all_aws_iot_certificates(self) -> dict:
        """Returns all AWS IoT certificates associated with self.iot_client

        Returns:
            dict: A dictionary with all the certificates associated with self.iot_client
        """
        return self.iot_client.list_certificates()



    def detach_firmware_simulator_aws_thing_policy(self, policy_name:str, certificat_ARN:str) -> None:
        """Detatches a policy from the certificate specified

        Args:
            policy_name (string): The policy to detatch.
            certificat_ARN (str): The certificate from which to detatch the policy.
        """
        detach_policy_response:None = self.iot_client.detach_policy(polcyName = policy_name,
                                                                    target = certificat_ARN)
        

    def update_aws_iot_certificate(self, certificateID:str, new_status:str) -> None:
        """Method that can be used to update the status of a certificate.
        
        IMPORTANT:
        To delete a certificate, first run detach_firmware_simulator_aws_thing_policy once or multiple times,
        until all policies are detatched from the certificate. Then use this method to set the status of the certificate to  'INACTIVE'.
        Thereafter run delete_aws_iot_certificate to delete the certificate.
        A certificate must be deactivated before it can be deleted.

        Args:
            certificateID (str): The id of certificate whose status should be updated.
            new_status (str, optional): _description_. Defaults to 'ACTIVE' | 'INACTIVE' | 'REVOKED' | 'PENDING_TRANSFER' | 'REGISTER_INACTIVE' | 'PENDING_ACTIVATION'.
        """
        if new_status not in ['ACTIVE', 'INACTIVE' , 'REVOKED' , 'PENDING_TRANSFER' , 'REGISTER_INACTIVE' , 'PENDING_ACTIVATION']:
            raise Exception("new_status must be one of the following values: 'ACTIVE', 'INACTIVE' , 'REVOKED' , 'PENDING_TRANSFER' , 'REGISTER_INACTIVE' , 'PENDING_ACTIVATION'")
        
        update_aws_iot_certificate_response:None = self.iot_client.update_certificate()
        
    def delete_aws_iot_certificate(self, certificate_ID) -> None:
        """Deletes a certificate.
        
        IMPORTANT:
        To delete a certificate, first run detach_firmware_simulator_aws_thing_policy once or multiple times,
        until all policies are detatched from the certificate. Then use this method to set the status of the certificate to  'INACTIVE'.
        Thereafter run delete_aws_iot_certificate to delete the certificate.
        A certificate must be deactivated before it can be deleted.

        Args:
            certificate_ID (_type_): The ID of the certifcate to delete
        """
    def delete_firmware_simulator_aws_thing_policy(self, policy_name:str) -> None:
        """Deltes the AWS IoT rule specified by the policy_name

        Args:
            policy_name (string): The name of the policy to be deleted
        """
        delete_policy_response:None = self.iot_client.delete_policy(policyName=policy_name)

    def delete_firmware_simulator_aws_thing(self) -> None:
        """Deletes the AWS IoT thing created by this setup.
        """
        delete_thing_response:dict = self.iot_client.delete_thing(thingName=self.thing_name)


if __name__ == '__main__':


    #---------------------------------------------------------------------------

    #                                   Setup                  

    #---------------------------------------------------------------------------

    print("===================BEGIN SETUP===================")
    FirmwareSimulatorThing = FirmwareSimulatorThingSetup(region_name=config.REGION_NAME,
                                                            certificate_file_path=config.CERT_FILE_PATH,
                                                            private_key_file_path=config.PRI_KEY_FILE_PATH,
                                                            public_key_file_path=config.PUB_KEY_FILE_PATH,
                                                            root_ca1_pem_file_path=config.ROOT_PEM_FILE_PATH,
                                                            aws_endpoint=config.AWS_ENDPOINT,
                                                            thing_name=config.THING_NAME)
    

    thing_ARN,thing_ID = FirmwareSimulatorThing.create_firmware_simulator_aws_thing()
    FirmwareSimulatorThing.update_or_create_device_shadow()
    certificate_ARN, certificateID = FirmwareSimulatorThing.create_certificates()
    policy_name:str = FirmwareSimulatorThing.create_policy(policy_name=config.POLICY_NAME)
    FirmwareSimulatorThing.attach_policy_and_thing_principal_to_firmware_simulator_aws_thing(policy_name=policy_name, certificate_ARN=certificate_ARN)
    
    print("===================SETUP COMPLETED===================")


#---------------------------------------------------------------------------

#                         Sources & Important links                        

#---------------------------------------------------------------------------

 

############################################################################

# The code for this setup file was heavily inspired by:     https://github.com/keivanK1/aws-create-thing-boto3/blob/master/createThing-Cert.py
# The link to get the root_ca_url:                          https://repost.aws/knowledge-center/iot-core-publish-mqtt-messages-python
# Configure credentials:                                    https://boto3.amazonaws.com/v1/documentation/api/latest/guide/credentials.html
# Response syntax of create_keys_and_certificates:          https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/create_keys_and_certificate.html
# Create AWS IoT policy:                                    https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/create_policy.html
# Create AWS IoT thing:                                     https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/create_thing.html
#                                                           https://www.youtube.com/watch?v=_OkJkV_StSM
# Attatch thing principal:                                  https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/attach_thing_principal.html
# Attatch AWS IoT policy:                                   https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/attach_policy.html
# General boto3 session information:                        https://ben11kehoe.medium.com/boto3-sessions-and-why-you-should-use-them-9b094eb5ca8e
# Update or create thing shadow:                            https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot-data.html
#                                                           https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot-data/client/update_thing_shadow.html
#                                                           https://stackoverflow.com/questions/61440132/why-is-my-aws-iot-sdk-thing-shadow-update-request-timing-out-using-the-node-sdk            
# Delete thing shadow:                                      https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/delete_thing.html
# Listing all AWS IoT policies using the AWS CLI:           https://docs.aws.amazon.com/cli/latest/reference/iot/list-policies.html
# Detatch AWS IoT policy:                                   https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/detach_policy.html
# Delete an AWS IoT Policy using the AWS CLI:               https://docs.aws.amazon.com/cli/latest/reference/iot/delete-policy.html                  
# Delete AWS certificate:                                   https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/delete_certificate.html
# List all AWS IoT certificates:                            https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/iot/client/list_certificates.html
############################################################################