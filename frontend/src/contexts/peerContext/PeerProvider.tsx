import Peer, { DataConnection } from 'peerjs';
import { useEffect, useRef, useState } from 'react';
import { useToast } from '../toasterContext/useToaster';
import { useAuth } from '../authContext/useAuth';
import { FileDto, MessageDto, PeerPayload } from '../../dto/message.dto';
import { PeerContext } from './PeerContext';

export const PeerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string | null>(null);
  // const [messages, setMessages] = useState<MessageDto[]>([]);
  const [latestMessage, setLatestMessage] = useState<MessageDto>({} as MessageDto);
  const [latestFile, setLatestFile] = useState<FileDto>({} as FileDto); // NEW state for received files

  const { user } = useAuth();

  const { showToast } = useToast();
  const showToastRef = useRef(showToast);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    const newPeer = new Peer(); // Use userId as the peerId
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      console.log(`PeerJS connected with ID: ${id}`);
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      conn.on('data', (data) => {
        const payload = data as PeerPayload;
        if (payload?.type === 'message') {
          console.log('Received message:', payload.content);
          const message = payload as MessageDto;
          message.receiverId = user?._id;
          setLatestMessage(message);
          showToastRef.current('Message', 'info', message.content);
        } else if (payload.type === 'file') {
          console.log('Received file:', payload.fileName);
          const fileBlob = new Blob([payload.fileData]);
          const fileUrl = URL.createObjectURL(fileBlob);
          setLatestFile({
            senderId: payload.senderId,
            receiverId: user?._id,
            fileName: payload.fileName,
            fileURL: fileUrl,
          } as FileDto);
          showToastRef.current('File Received', 'success', `${payload.fileName}`);
        }
      });
    });

    return () => {
      newPeer.destroy();
    };
  }, [setLatestMessage, user?._id]);

  const sendMessage = (toPeerId: string, message: string) => {
    if (!peer) return;
    const conn: DataConnection = peer.connect(toPeerId);

    conn.on('open', () => {
      console.log('Connected to peer:', toPeerId);
      const payload = {
        type: 'message',
        senderId: user?._id,
        content: message,
        timestamp: new Date().toISOString(),
        receiverId: '',
      } as PeerPayload;
      conn.send(payload);
      // setMessages((prev) => [...prev, payload]);
    });

    conn.on('error', (err) => {
      console.error('PeerJS connection error:', err);
    });
  };

  const sendFile = (toPeerId: string, file: File) => {
    if (!peer) return;
    const conn: DataConnection = peer.connect(toPeerId);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      conn.on('open', () => {
        const payload = {
          type: 'file',
          senderId: user?._id,
          fileName: file.name,
          fileData: reader.result,
        } as PeerPayload;
        conn.send(payload);
      });
    };

    conn.on('error', (err) => {
      console.error('PeerJS connection error:', err);
    });
  };

  return (
    <PeerContext.Provider value={{ peerId, sendMessage, sendFile, latestMessage, latestFile, setLatestFile }}>
      {children}
    </PeerContext.Provider>
  );
};
