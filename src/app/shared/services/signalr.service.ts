// import { Injectable } from '@angular/core';
// import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

// @Injectable({
//   providedIn: 'root'
// })
// export class SignalrService {

//   private messageHandlers: Array<(user: string, message: string) => void> = [];

//   public hubConnection!: HubConnection;
//   public isConnected: boolean = false;

//   constructor() {
//     this.createConnection();
//     this.startConnection();
//   }

//   private createConnection() {
//     this.hubConnection = new HubConnectionBuilder()
//       .withUrl('http://localhost:5275/chatHub')
//       .withAutomaticReconnect()
//       .build();

//     this.hubConnection.onclose(() => {
//       this.isConnected = false;
//     });

//     this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
//       this.handleMessage(user, message);
//     });
//   }

//   private startConnection() {
//     this.hubConnection
//       .start()
//       .then(() => {
//         this.isConnected = true;
//         console.log('Connection started');
//       })
//       .catch(err => console.log('Error while starting connection: ' + err));
//   }

//   // public sendMessage(patientName: string, message: string) {
//   //   if (this.isConnected) {
//   //     this.hubConnection.invoke('SendMessageToDoctor', patientName, message)
//   //       .catch(err => console.error('Error sending message: ' + err));
//   //   }
//   // }


//   public sendMessage(patientName: string, message: string) {
//     if (this.isConnected) {
//         this.hubConnection.invoke('SendMessageToDoctor', patientName, message)
//             .catch(err => console.error('Error sending message: ' + err));
//     }
// }

// public sendDoctorReply(doctorName: string, reply: string, patientConnectionId: string) {
//   if (this.isConnected) {
//       this.hubConnection.invoke('SendMessageToPatient', doctorName, reply, patientConnectionId)
//           .catch(err => console.error('Error sending doctor reply: ' + err));
//   }
// }


// //   public sendDoctorReply(doctorName: string, message: string, patientId: string) {
// //     if (this.isConnected) {
// //         this.hubConnection.invoke('SendMessageToPatient', doctorName, message, patientId)
// //             .catch(err => console.error('Error sending doctor reply: ' + err));
// //     }
// // }
//   private handleMessage(user: string, message: string) {
//     this.messageHandlers.forEach(handler => handler(user, message));
//   }

//   public addMessageListener(handler: (user: string, message: string) => void) {
//     this.messageHandlers.push(handler);
//   }
// }












import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private messageHandlers: Array<(user: string, message: string) => void> = [];

  public hubConnection!: HubConnection;
  public isConnected: boolean = false;

  constructor() {
    this.createConnection();
    this.startConnection();
  }

  private createConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5275/chatHub')
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onclose(() => {
      this.isConnected = false;
    });

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.handleMessage(user, message);
    });
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => {
        this.isConnected = true;
        console.log('Connection started');
      })
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public sendMessage(patientName: string, message: string) {
    if (this.isConnected) {
      this.hubConnection.invoke('SendMessageToDoctor', patientName, message)
        .catch(err => console.error('Error sending message: ' + err));
    }
  }

  public sendDoctorReply(doctorName: string, reply: string, patientConnectionId: string) {
    if (this.isConnected) {
      this.hubConnection.invoke('SendMessageToPatient', doctorName, reply, patientConnectionId)
        .catch(err => console.error('Error sending doctor reply: ' + err));
    }
  }

  private handleMessage(user: string, message: string) {
    this.messageHandlers.forEach(handler => handler(user, message));
  }

  public addMessageListener(handler: (user: string, message: string) => void) {
    this.messageHandlers.push(handler);
  }
}
