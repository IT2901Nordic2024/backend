# Backend README

## habit-storage

This stack uses API Gateway to make Lambda interract with DynamoDB in a way that lets it GET saved data. This may be used for getting data for a specific user, or all users. Format for HTTP request below

**Getting all data from all users**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habitEvents


- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID

**Getting data from a specific user**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/habitEvents/{id}

- {id} is the id of the user you want to get the data from
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is HabitStorageHTTP. Ask you local Backend expert if you dont fin the ID


## configure-shadow-api

This is an API for configuring the shadow of a users device. Format for HTTP request below
**Updating device shadow**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/updateshadow/{deviceId}/{updatedSide}/{relatedHabitId}


- {deviceId} is ID of device you want to update
- {updatedSide} is the device side you want to add a new habit to
- {relatedActivityId} is the ID of the new habit you want to track
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID

**Getting device shadow**

https://XXXXXXXXXX.execute-api.eu-north-1.amazonaws.com/getshadow/{deviceId}

- {deviceId} is ID of device you want to update
- The "{}" brackets should not be included in the url, just write someDeviceId/5/456
- "XXXXXXXXXX" is the API ID, which can be found in table for APIs in the API Gateway console. The API name is ConfigureShadow. Ask you local Backend expert if you dont fin the ID
