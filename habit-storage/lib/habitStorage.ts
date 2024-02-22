import * as cdk from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
import { Construct } from "constructs"

/**
 * This file contains the table for storing diffrent habits, and the 
 * related APIs for GET, PUT, POST and DELETE
 */

export class HabitStorage extends Construct {

    public readonly table: dynamodb.Table
    public readonly handler: lambda.Function

    constructor(scope: Construct, id: string){
        super(scope, id)

        const habitTable = new dynamodb.Table(this, "habitTable", {
            tableName: "habitTable",
            partitionKey: {name: "userId", type: dynamodb.AttributeType.STRING},
            sortKey: {name: "habitName", type: dynamodb.AttributeType.STRING}
        })

        this.table = habitTable

        this.handler= new lambda.Function(this, "postHandler", {
            runtime: lambda.Runtime.NODEJS_20_X,
            handler: "getHabits.handler",
            code: lambda.Code.fromAsset("lambda"),
            functionName: "getHabits",
            
            environment: {
                // DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
                HABIT_TABLE_NAME: habitTable.tableName
            }
        })

        habitTable.grantReadWriteData(this.handler);
    }
}