import { DynamoDBClient, DeleteItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import  dayjs  from 'dayjs';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const updateClientAmount = async (event) =>{
    const {phone_number, timestamp,client_amount, remarks} = JSON.parse(event.body);
    if (client_amount < 1){
        return{
            statusCode: 200,
            body: {
                message: "invalid amount"
            }
        }
    }

    const params = {
        TableName: "Barber",
        Key: {
            phone_number: { S: phone_number },
            appointment_timestamp: { S: timestamp }
        },
        UpdateExpression: "set phone_number = :pn, timestamp = :ts ,amount_of_clients = :ac, remarks = :r",
        ExpressionAttributeValues: {
            ":pn": { S: phone_number },
            ":ts": { S: dayjs(timestamp).unix() },
            ":ac": { N: client_amount.toString() },
            ":r": { S: remarks }
        },
        ReturnValues: "UPDATED_NEW"  // Return only the updated attributes
    };


    try {
        const response = await client.send(new UpdateItemCommand(params));
        console.log('Item was successfully updated: ', response);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Item has been updated",
                updatedAttributes: response.Attributes
            })
        };
    } catch (error) {
        console.error('Error: ', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Failed to update appointment"
            })
        };
    }
};