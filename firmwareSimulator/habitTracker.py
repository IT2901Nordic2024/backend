import keyboard
from datetime import datetime


class habitTracker:
    """Class that represents the dodecahedron habit tracker"""
    def __init__(self):
        # The representation of the dodecahedron and its sides in this simulator
        self.dodecahedron = { 
        0:{
            "id": "",
            "type":"",
            "name":""
        },
        1:{
            "id": "",
            "type":"",
            "name":""
        },
        2:{
            "id": "",
            "type":"",
            "name":""
        },
        3:{
            "id": "",
            "type":"",
            "name":""
        },
        4:{
            "id": "",
            "type":"",
            "name":""
        },
        5:{
            "id": "",
            "type":"",
            "name":""
        },
        6:{
            "id": "",
            "type":"",
            "name":""
        }
        ,
        7:{
            "id": "",
            "type":"",
            "name":""
        },
        8:{
            "id": "",
            "type":"",
            "name":""
        }
        ,
        9:{
            "id": "",
            "type":"",
            "name":""
        },
        10:{
            "id": "",
            "type":"",
            "name":""
        },
        11:{
            "id": "",
            "type":"",
            "name":""
        }
    }

    
    def onKeyPressed(self, event):
        """Function that does something based on the key pressed"""
        try:
            print(event.name)
            return int(event.name)  # If a number is key is pressed return that number
        except:
            print("Invalid input! Input must be a number.")   # Otherwise show the user that the wrong input was provided
    
    def getType(self,side):
        """Function that takes an integer as inputt that represents a side of the dodecahedron habit tracker and 
        returns the type of habit associated with that side. If the input does not match any side of the dodecahedron, the 
        function throws an error."""
        if side in list(self.dodecahedron.keys()):
            return self.dodecahedron.get(side).get("type")
        else:
            raise Exception("The provided input does not correspond to any side of the device / dodecahedron")
    
    def interactionListener(self):
        """Function that listens to the keys being pressed on the keyboard"""
        keyboard.on_press(self.onKeyPressed)
        keyboard.wait('esc') # stops logging when Escape is pressed


    def habitRunner(habitType):
       """Function that takes in one input, the habit type, for instance count, and performs the corresponding actions and returns the output.
       It was necessary to call the input variable for habitType, because type is a python keyword."""
       match habitType:
            case "count":
                return 1                                 # Returns an increment value of 1
            case "timer":
                return int(round(datetime.timestamp()))  # Returns the current timestamp as integer
            case _:                                      
                raise Exception("This habit type does not exist")   # Throws an error if the provided habit type does not exist
           
    def sendHabitEvent():
        """Function that handles the sending of data from the device to AWS IoT"""
        pass