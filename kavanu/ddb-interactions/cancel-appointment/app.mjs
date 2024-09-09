import { DynamoDBClient, DeleteItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const cancelAppointment = async (event) => {
    const{phone_number, timestamp} = JSON.parse(event.body);
    console.log(phone_number, timestamp);
    const params = {
        TableName: "Barber",
        Key: {
            phone_number: { S: phone_number},
            appointment_timestamp: { S: timestamp}
        }
    };
    
    try{
        const response = await client.send( new DeleteItemCommand(params));
        console.log( 'Item was seccessfully delted: ', response);
        return{
            statusCode: 200,
            body: {
                message: "item has been deleted"
            }
        }
    }catch(error){
        console.error('error: ', error);
        return{
            statusCode:500,
            body: JSON.stringify({ error: "Failed to delete appointment"})
        }
    }

}