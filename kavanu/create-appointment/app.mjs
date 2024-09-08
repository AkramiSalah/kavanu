import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { dayjs } from 'dayjs';

const client = new DynamoDBClient({
    endpoint: 'http://host.docker.internal:8000',
    region: 'eu-north-1',
    accessKeyId: 'fake',
    secretAccessKey: 'fake',
});


export const createAppointment = async (event) => {
    const {
      phone_number,
      appointment_time_and_date,
      amount_of_clients,
      remarks
    }= JSON.parse(event.body);
    
    appointment_timestamp = dayjs(appointment_time_and_date);
    
    const appointment = {
      phone_number: {S: phone_number},
      appointment_timestamp: {S : appointment_timestamp.unix()},
      amount_of_clients: {N : amount_of_clients},
      remarks: {S: remarks}
    }

    

    const params = {
      TableName: "Barber",
      Item: appointment
    }

    try{
      await client.send(new PutItemCommand(params));
      return{
        statusCode:200,
        body: JSON.stringify({message: "Appointment has been created successfully"})
      }
    }catch(err){
      console.error(err);
      return{
        statusCode:500,
        body: JSON.stringify({ error: "Failed to create an appointment"})
      }
    }
  };
  