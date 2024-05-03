"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitStorageStack = void 0;
const cdk = require("aws-cdk-lib");
const apigwv2 = require("aws-cdk-lib/aws-apigatewayv2");
const habitStorage_1 = require("./habitStorage");
const aws_apigatewayv2_integrations_1 = require("aws-cdk-lib/aws-apigatewayv2-integrations");
class HabitStorageStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        //Creating HabitStorage construct
        const habitStorage = new habitStorage_1.HabitStorage(this, 'HabitStorage');
        //Creating API, and configures CORS to allow GET methods
        const httpApi = new apigwv2.HttpApi(this, 'HabitStorageHTTP', {
            corsPreflight: {
                allowMethods: [apigwv2.CorsHttpMethod.ANY],
                allowOrigins: ['*'],
                allowHeaders: ['*'],
                allowCredentials: false,
            },
        });
        //Integration for lambda function
        const createHabitLambdaIntegration = new aws_apigatewayv2_integrations_1.HttpLambdaIntegration('CreateHabitIntegration', habitStorage.createHabitHandler);
        const getHabitsWithSideIntegration = new aws_apigatewayv2_integrations_1.HttpLambdaIntegration('GetHabitsWithSideIntegration', habitStorage.getHabitsWithSideHandler);
        const editHabitIntegration = new aws_apigatewayv2_integrations_1.HttpLambdaIntegration('EditHabitIntegration', habitStorage.editHabitHandler);
        const deleteHabitIntegration = new aws_apigatewayv2_integrations_1.HttpLambdaIntegration('DeleteHabitIntegration', habitStorage.deleteHabitHandler);
        //Adding integration to relevant API routes
        httpApi.addRoutes({
            path: '/habits/{userId}',
            methods: [apigwv2.HttpMethod.GET],
            integration: getHabitsWithSideIntegration,
        });
        httpApi.addRoutes({
            path: '/createHabit/{userId}/{deviceId}/{habitName}/{habitType}/{deviceSide}',
            methods: [apigwv2.HttpMethod.PUT],
            integration: createHabitLambdaIntegration,
        });
        httpApi.addRoutes({
            path: '/editHabit/{userId}/{deviceId}/{habitId}/{habitName}/{deviceSide}',
            methods: [apigwv2.HttpMethod.PUT],
            integration: editHabitIntegration,
        });
        httpApi.addRoutes({
            path: '/deleteHabit/{userId}/{habitId}',
            methods: [apigwv2.HttpMethod.DELETE],
            integration: deleteHabitIntegration,
        });
    }
}
exports.HabitStorageStack = HabitStorageStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFiaXQtc3RvcmFnZS1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhhYml0LXN0b3JhZ2Utc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQWtDO0FBQ2xDLHdEQUF1RDtBQUV2RCxpREFBNkM7QUFDN0MsNkZBQWlGO0FBRWpGLE1BQWEsaUJBQWtCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDOUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFzQjtRQUM5RCxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUN2QixpQ0FBaUM7UUFDakMsTUFBTSxZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQTtRQUUzRCx3REFBd0Q7UUFDeEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUM1RCxhQUFhLEVBQUU7Z0JBQ2IsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUM7Z0JBQzFDLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDbkIsWUFBWSxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUNuQixnQkFBZ0IsRUFBRSxLQUFLO2FBQ3hCO1NBQ0YsQ0FBQyxDQUFBO1FBRUYsaUNBQWlDO1FBQ2pDLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxxREFBcUIsQ0FDNUQsd0JBQXdCLEVBQ3hCLFlBQVksQ0FBQyxrQkFBa0IsQ0FDaEMsQ0FBQTtRQUNELE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxxREFBcUIsQ0FDNUQsOEJBQThCLEVBQzlCLFlBQVksQ0FBQyx3QkFBd0IsQ0FDdEMsQ0FBQTtRQUNELE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxxREFBcUIsQ0FBQyxzQkFBc0IsRUFBRSxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtRQUM3RyxNQUFNLHNCQUFzQixHQUFHLElBQUkscURBQXFCLENBQUMsd0JBQXdCLEVBQUUsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUE7UUFFbkgsMkNBQTJDO1FBQzNDLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEIsSUFBSSxFQUFFLGtCQUFrQjtZQUN4QixPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUNqQyxXQUFXLEVBQUUsNEJBQTRCO1NBQzFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEIsSUFBSSxFQUFFLHVFQUF1RTtZQUM3RSxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUNqQyxXQUFXLEVBQUUsNEJBQTRCO1NBQzFDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEIsSUFBSSxFQUFFLG1FQUFtRTtZQUN6RSxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQztZQUNqQyxXQUFXLEVBQUUsb0JBQW9CO1NBQ2xDLENBQUMsQ0FBQTtRQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEIsSUFBSSxFQUFFLGlDQUFpQztZQUN2QyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztZQUNwQyxXQUFXLEVBQUUsc0JBQXNCO1NBQ3BDLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRjtBQXJERCw4Q0FxREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInXG5pbXBvcnQgKiBhcyBhcGlnd3YyIGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5djInXG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJ1xuaW1wb3J0IHsgSGFiaXRTdG9yYWdlIH0gZnJvbSAnLi9oYWJpdFN0b3JhZ2UnXG5pbXBvcnQgeyBIdHRwTGFtYmRhSW50ZWdyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheXYyLWludGVncmF0aW9ucydcblxuZXhwb3J0IGNsYXNzIEhhYml0U3RvcmFnZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpXG4gICAgLy9DcmVhdGluZyBIYWJpdFN0b3JhZ2UgY29uc3RydWN0XG4gICAgY29uc3QgaGFiaXRTdG9yYWdlID0gbmV3IEhhYml0U3RvcmFnZSh0aGlzLCAnSGFiaXRTdG9yYWdlJylcblxuICAgIC8vQ3JlYXRpbmcgQVBJLCBhbmQgY29uZmlndXJlcyBDT1JTIHRvIGFsbG93IEdFVCBtZXRob2RzXG4gICAgY29uc3QgaHR0cEFwaSA9IG5ldyBhcGlnd3YyLkh0dHBBcGkodGhpcywgJ0hhYml0U3RvcmFnZUhUVFAnLCB7XG4gICAgICBjb3JzUHJlZmxpZ2h0OiB7XG4gICAgICAgIGFsbG93TWV0aG9kczogW2FwaWd3djIuQ29yc0h0dHBNZXRob2QuQU5ZXSxcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbJyonXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbJyonXSxcbiAgICAgICAgYWxsb3dDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICAvL0ludGVncmF0aW9uIGZvciBsYW1iZGEgZnVuY3Rpb25cbiAgICBjb25zdCBjcmVhdGVIYWJpdExhbWJkYUludGVncmF0aW9uID0gbmV3IEh0dHBMYW1iZGFJbnRlZ3JhdGlvbihcbiAgICAgICdDcmVhdGVIYWJpdEludGVncmF0aW9uJyxcbiAgICAgIGhhYml0U3RvcmFnZS5jcmVhdGVIYWJpdEhhbmRsZXIsXG4gICAgKVxuICAgIGNvbnN0IGdldEhhYml0c1dpdGhTaWRlSW50ZWdyYXRpb24gPSBuZXcgSHR0cExhbWJkYUludGVncmF0aW9uKFxuICAgICAgJ0dldEhhYml0c1dpdGhTaWRlSW50ZWdyYXRpb24nLFxuICAgICAgaGFiaXRTdG9yYWdlLmdldEhhYml0c1dpdGhTaWRlSGFuZGxlcixcbiAgICApXG4gICAgY29uc3QgZWRpdEhhYml0SW50ZWdyYXRpb24gPSBuZXcgSHR0cExhbWJkYUludGVncmF0aW9uKCdFZGl0SGFiaXRJbnRlZ3JhdGlvbicsIGhhYml0U3RvcmFnZS5lZGl0SGFiaXRIYW5kbGVyKVxuICAgIGNvbnN0IGRlbGV0ZUhhYml0SW50ZWdyYXRpb24gPSBuZXcgSHR0cExhbWJkYUludGVncmF0aW9uKCdEZWxldGVIYWJpdEludGVncmF0aW9uJywgaGFiaXRTdG9yYWdlLmRlbGV0ZUhhYml0SGFuZGxlcilcblxuICAgIC8vQWRkaW5nIGludGVncmF0aW9uIHRvIHJlbGV2YW50IEFQSSByb3V0ZXNcbiAgICBodHRwQXBpLmFkZFJvdXRlcyh7XG4gICAgICBwYXRoOiAnL2hhYml0cy97dXNlcklkfScsXG4gICAgICBtZXRob2RzOiBbYXBpZ3d2Mi5IdHRwTWV0aG9kLkdFVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogZ2V0SGFiaXRzV2l0aFNpZGVJbnRlZ3JhdGlvbixcbiAgICB9KVxuXG4gICAgaHR0cEFwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogJy9jcmVhdGVIYWJpdC97dXNlcklkfS97ZGV2aWNlSWR9L3toYWJpdE5hbWV9L3toYWJpdFR5cGV9L3tkZXZpY2VTaWRlfScsXG4gICAgICBtZXRob2RzOiBbYXBpZ3d2Mi5IdHRwTWV0aG9kLlBVVF0sXG4gICAgICBpbnRlZ3JhdGlvbjogY3JlYXRlSGFiaXRMYW1iZGFJbnRlZ3JhdGlvbixcbiAgICB9KVxuXG4gICAgaHR0cEFwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogJy9lZGl0SGFiaXQve3VzZXJJZH0ve2RldmljZUlkfS97aGFiaXRJZH0ve2hhYml0TmFtZX0ve2RldmljZVNpZGV9JyxcbiAgICAgIG1ldGhvZHM6IFthcGlnd3YyLkh0dHBNZXRob2QuUFVUXSxcbiAgICAgIGludGVncmF0aW9uOiBlZGl0SGFiaXRJbnRlZ3JhdGlvbixcbiAgICB9KVxuXG4gICAgaHR0cEFwaS5hZGRSb3V0ZXMoe1xuICAgICAgcGF0aDogJy9kZWxldGVIYWJpdC97dXNlcklkfS97aGFiaXRJZH0nLFxuICAgICAgbWV0aG9kczogW2FwaWd3djIuSHR0cE1ldGhvZC5ERUxFVEVdLFxuICAgICAgaW50ZWdyYXRpb246IGRlbGV0ZUhhYml0SW50ZWdyYXRpb24sXG4gICAgfSlcbiAgfVxufVxuIl19