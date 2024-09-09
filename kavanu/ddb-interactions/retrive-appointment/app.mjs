import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});

export const retriveAppointment = async (event) => {
    const {
      phone_number,
      timestamp
    }= JSON.parse(event.body);

    const params = {
        TableName: "Barber",
        Key:{
            phone_number: {S: phone_number},
            appointment_timestamp: {S: timestamp }
        }
    }

    try{
        const data = await client.send(new GetItemCommand(params));
        console.log('result : ' + JSON.stringify(data));
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };
    }catch (error){
        console.error("Error : ", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not retrieve appointment" })
        };
    }
};

