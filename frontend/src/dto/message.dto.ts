export class MessageDto
{
    senderId?: string;
    receiverId?: string;
    content!: string;
    timestamp!: string;
}


export class FileDto
{
    senderId?: string;
    receiverId?: string;
    fileName!: string;
    fileURL!: string;
}


// Type for text messages
export type MessagePayload = {
    type: 'message';
    senderId?: string;
    receiverId?: string;
    content: string;
    timestamp: string;
  };
  
  // Type for file transfer
  export type FilePayload = {
    type: 'file';
    senderId?: string;
    receiverId?: string;
    fileName: string;
    fileData: ArrayBuffer;
  };
  
  // Combined type for PeerJS data payloads
  export type PeerPayload = MessagePayload | FilePayload;
  