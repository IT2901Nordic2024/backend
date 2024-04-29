# Imports
import keyboard
from datetime import datetime, timedelta
import re
from awscrt import  mqtt5
from awsiot import mqtt5_client_builder
import json
from concurrent.futures import Future
import time
from fromFirmwareToBackend_pb2 import habit_data as FirmwareMessage
import config





class FirmwareSimulator:
    """Class that represents the dodecahedron habit tracker"""
    def __init__(self, client_id:str, end_point:str, certficate_file_path:str, private_key_file_path:str, root_pem_file_path:str, path_to_dodecahedron_json:str):
        # The initial representation of the dodecahedron and its sides in this simulator
        with open(path_to_dodecahedron_json, 'r') as dodecahedron_json_data:
            self._dodecahedron = json.load(dodecahedron_json_data)
        self.client_id = client_id
        self.end_point = end_point
        self.certficate_file_path = certficate_file_path
        self.private_key_file_path = private_key_file_path
        self.root_pem_file_path = root_pem_file_path
        self.client = None
        self.future_stopped = Future()
        self.future_connection_success = Future()
        self.path_to_dodecahedron_json = path_to_dodecahedron_json


    #############################################################
    #                     MQTT related methods                  #
    #                            Start                          #
    #############################################################

    def create_client(self):
        self.client = mqtt5_client_builder.mtls_from_path(
            endpoint = self.end_point,
            port = 8883,
            cert_filepath = self.certficate_file_path,
            pri_key_filepath= self.private_key_file_path,
            ca_filepath = self.root_pem_file_path,
            on_publish_received = self.on_publish_received,
            on_lifecycle_stopped = self.on_lifecycle_stopped,
            on_lifecycle_connection_succes = self.on_lifecycle_connection_succes,
            on_lifecycle_connection_failure = self.on_lifecycle_connection_failure,
            client_id = self.client_id
        )

    def on_publish_received(self, publish_packet_data)->None:
        publish_packet = publish_packet_data.publish_packet
        assert isinstance(publish_packet, mqtt5.PublishPacket)
        print("Received message from topic {}: {}".format(publish_packet.topic,publish_packet.payload))
        
        # Decoding the incomming message and passing the elements of the decoded version to the update_sides function
        # It is assumed that any incomming message is a config message used to configure the dodecahedron
        # Check the config.proto file in the protocol_buffers_messages folder to see the assumed structure of those config messages.
        if publish_packet.topic == config.AWS_THING_SHADOW_MQTT_UPDATE_DELTA:      
            payload:dict = json.loads(publish_packet.payload.decode())
            self.update_sides(payload)

        

    def on_lifecycle_stopped(self, lifecycle_stopped_data:mqtt5.LifecycleStoppedData)->None:
        print("Lifecycle Stopped")
        self.future_stopped.set_result(lifecycle_stopped_data)
    
    def on_lifecycle_connection_succes(self, lifecycle_connection_succes_data: mqtt5.LifecycleConnectSuccessData)->None:
        print("Lifecycle Connection Success")
        self.future_connection_success.set_result(lifecycle_connection_succes_data)
    
    def on_lifecycle_connection_failure(self, lifecycle_connection_failure: mqtt5.LifecycleConnectFailureData)->None:
        print("Lifecycle Connection Failure")
        print("connack packet: ", lifecycle_connection_failure.connack_packet)
        print("client_id: ", self.client.client_id)
        print("Connection failed with exception:{}".format(lifecycle_connection_failure.exception))


    def publish_message(self, format:str, mqtt_topic:str, habit_id:int, data:tuple, habit_type:str)->None:
        """Method that publishes a message to an AWS MQTT topic either in JSOn format or in protocol buffers format.
        -----------
        Parameters:
        -----------

        format:     (string) The format the message is to be published in. Either 'JSON' or 'proto_buff'
        mqtt_topic: (string) The MQTT topic the message is to be published to.
        habit_id:   (int)    The number identifying the habit 
        data:       (tuple)  some form of data to be sent. In case of the habit type "count" it might be the number of increments / the amount of counted incidents,
                             in the case of the "time" type of habit, it contains the start_timestamp, the stop_timestamp and some additional data.
                             It is assumed that data is the first element, irrespective of the habit type, star_timestamp is the 2nd element
                             and stop_timestamp is the 3rd element.
        habit_type: (string) The type of habit, for instance "count" or "time"
           
        """
        device_timestamp = int(round(datetime.timestamp(datetime.now()))) # The timestamp of when the message is sent from the device

        match habit_type:
            case "COUNT":
                # For JSON format
                message = {
                    "device_timestamp": device_timestamp,
                    "habit_id": habit_id,
                    "data": data[0] # The data is a the first element in the data array 
                }
                # For protocol buffers format
                payload = FirmwareMessage(device_timestamp=message["device_timestamp"], habit_id=message["habit_id"], data=message["data"]).SerializeToString()
                
            case "TIME":
                # For JSON format
                message = {
                    "device_timestamp": device_timestamp,
                    "habit_id": habit_id,
                    "start_timestamp": data[1],
                    "stop_timestamp": data[2]
                }
                
                # For protocol buffers format
                payload = FirmwareMessage(device_timestamp = message["device_timestamp"], habit_id=message["habit_id"], start_timestamp=message["start_timestamp"], stop_timestamp=message["stop_timestamp"]).SerializeToString()
            
            case _:
                raise Exception("The provided habit_type ({}) is not recognised".format(habit_type))

        match format:
            case "JSON":
                print("publishing message in JSON format")
                self.client.publish(mqtt5.PublishPacket(
                    topic = mqtt_topic,
                    payload = json.dumps(message),
                    qos = mqtt5.QoS.AT_LEAST_ONCE
                ))
                print("Message published")

            # For more information about how to send protobuf messages with python see:
            # https://www.freecodecamp.org/news/googles-protocol-buffers-in-python/
            case "proto_buff":
                print("publishing message in protocol buffers format")
                self.client.publish(mqtt5.PublishPacket(
                    topic = mqtt_topic,
                    payload = payload,
                    qos = mqtt5.QoS.AT_LEAST_ONCE
                ))
                print("payload: {}".format(payload))
                print("Sent to topic {}".format(mqtt_topic))
            case _:
                raise Exception("The provided format must either be JSON or proto_buff")
            

    
    def subscribe(self,topic:str)->None:
        """Method that allows the HabitTracker to subscribe to an MQTT5 topic.
        
        -----------
        Parameters:
        -----------

        topic:  (string) The MQTT topic the firmwareSimulator is to subscribe to.
        
        """
        print("Trying to subscribe to {}".format(topic))
        subscribe_future = self.client.subscribe(subscribe_packet=mqtt5.SubscribePacket(
            subscriptions=[mqtt5.Subscription(
                topic_filter=topic,
                qos=mqtt5.QoS.AT_LEAST_ONCE,
            )]
        ))
        print("subscribe_future: ", subscribe_future.__dict__)
        try:
            suback = subscribe_future.result(timeout=30)
            print("Subscribed to {}, with {}".format(topic, suback.reason_codes))
        except:
            print("subscribe future failed: ", subscribe_future.__dict__)

    def unsubscribe(self, topic:str)->None:
        """A method that allows the HabitTracker to unsubscribe from an MQTT5 topic.
        
        -----------
        Parameters:
        -----------

        topic:  (string) The MQTT topic the firmwareSimulator is to unsubscribe from.
        
        """
        unsubscribe_future = self.client.unsubscribe(unsubscribe_packet=mqtt5.UnsubackPacket(
            topic_filters=[topic]))
        unsuback = unsubscribe_future.result(timeout=100)
        print("Unsubscribed from {}, with {}".format(topic, unsuback.reason_codes))
    
    def start_connection(self)->None:
        self.client.start()
    
    def stop_connection(self)->None:
        self.client.stop()

    #############################################################
    #                     MQTT related methods                  #
    #                             Stop                          #
    #############################################################  
        
    

    #############################################################
    #                Dodecahedron interaction methods           #
    #                             Start                         #
    ############################################################# 


    def request_update(self) -> None:
        """Method that requests an update from the AWS by publishing the current state (see dodecahedron.json) to the AWS specific update
        MQTT topic.
        """
        print("Requesting update START")
        with open(config.PATH_TO_DODECAHEDRON, "r") as dodecahedron_json_file:
            dodecahedron_state = dodecahedron_json_file.read()
            
        reported_state = {"reported": json.loads(dodecahedron_state)}
        message = {"state":reported_state}
        print("message: ", message)
        message = json.dumps(message)
        self.client.publish(mqtt5.PublishPacket(
                    topic = config.AWS_THING_SHADOW_MQTT_UPDATE,
                    payload = message,
                    qos = mqtt5.QoS.AT_LEAST_ONCE
                ))
        print("Requesting update END")

    def update_sides(self,payload:dict)->None:
        """Method that updates the sides of the dodecahedron according to the data in the payload.

        Args:
            payload (dict): The payload received by the FirmwareSimulator when it receives a message from the MQTT topic responsible for providing updates to the simulator.
        """

        state:dict = payload["state"]
        sides_to_update:list = list(state.keys())

        # Updating sides
        for side in sides_to_update:
            print("Updating side: {}".format(side))          
            try:
                habit_id:str = state[side].get("id")
                self._dodecahedron[side]["id"] = habit_id
            except:
                print("habit_id could not be assigned")
            try:
                habit_type:str = state[side].get("type")
                self._dodecahedron[side]["type"] = habit_type
            except:
                print("habit_id could not be assigned.")
            # Updating the doedecahedron JSON file
            with open(config.PATH_TO_DODECAHEDRON, "w") as dodecahedron_json_data_file:
                dodecahedron_json_data_file.write(json.dumps(self._dodecahedron))
            
            print("Side {} updated".format(side))



    
    def get_habit_type(self,side:str)->str:
        """Method that returns the type of habit associated with that side.
        If the input does not match any side of the dodecahedron, the function throws an error.
        
        -----------
        Parameters:
        -----------
        
        side: (string) The side of the dodecahedron from which we want to get the habit type associated with that side.
        
        """
        if side in list(self._dodecahedron.keys()):
            return self._dodecahedron.get(side).get("type")
        else:
            raise Exception("ERROR: The provided input does not correspond to any side of the device / dodecahedron")
    
    def get_habit_id(self,side:str)->str:
        """Method that gets the id of the habit associated with the provided side
        
        -----------
        Parameters:
        -----------
        
        side: (string) The side of the dodecahedron from which we want to get the habit id of the habit associated with that side.
        
        """
        if side in list(self._dodecahedron.keys()):
            return self._dodecahedron.get(side).get("id")
        else:
            raise Exception("ERROR: The provided input does not correspond to any side of the device / dodecahedron")
    
    def execute_habit(self, habit_type:str)->tuple[int,int,int]:
        """Function that takes in one input, the habit type, for instance count, and performs the corresponding actions and returns the output.
        The output is returned as a tuple.
        It was necessary to call the input variable for habitType, because type is a python keyword."""
        match habit_type:
            case "COUNT":
                counted = 1
                return (counted,)                                 # Returns an increment value of 1 as a tuple
            case "TIME":
                now = datetime.now()
                start_timestamp:int = int(round(datetime.timestamp(now - timedelta(hours=0, minutes=5))))  # Start before stop: Subtracks 5 min from current time
                stop_timestamp:int = int(round(datetime.timestamp(now)))
                data:int = None # Change when there is actual data to be sent (additionally to the timestamps)
                return (data, start_timestamp, stop_timestamp)  # Returns the bot timestamps as values in a tuple, data is the first element in the tuple (for consistency with the "count" case)
            case _:                                      
                raise Exception("ERROR: This habit type does not exist")   # Throws an error if the provided habit type does not exist


    def interaction_listener(self, message_format:str, mqtt_topic:str)->None:
        key_buffer = [] # Stores the user input

        print("Press ESCAPE to terminate program or Enter a side to interact with: ")

        while keyboard.is_pressed('esc') == False:
            if len(key_buffer) >= 2 or keyboard.is_pressed('enter'):
                side:str = ""
                for value in key_buffer:
                    side:str = side + value
                print("side: ", side) # Providing the user with some feedback, specifically showing the selected habit tracker side
                key_buffer.clear()    # Clearing the buffer to make way for new entries

            #------Preparing data to be sent to AWS IoT core------
                print("side: ", side)
                habit_id:str = self.get_habit_id(side=side)    
                habit_type:str = self.get_habit_type(side=side)
                habit_data:int = self.execute_habit(habit_type=habit_type) # Execute action associated with habit / execute habit and store the return value as data to be sent to AWS IoT core MQTT broker

            #-------------------MQTT-------------------
                self.publish_message(format=message_format,mqtt_topic=mqtt_topic,habit_id=habit_id,data=habit_data, habit_type=habit_type)
                time.sleep(1)
                print("Press ESCAPE to terminate program or Enter a side to interact with: ")

    
            happening = keyboard.read_event()   # Listening to user input 
            if happening.event_type == "down" and re.search("[0-9]", happening.name): # Only accepts user input that corresponds to numbers 7 digits between 0 and 9.
                key_buffer.append(happening.name)
                print("keyBuffer: ", key_buffer)     
        
        self.stop_connection()
        self.future_stopped.result(timeout=100)
        print("Escape was pressed, program is terminated!")


    #############################################################
    #                Dodecahedron interaction methods           #
    #                             Stop                          #
    ############################################################# 