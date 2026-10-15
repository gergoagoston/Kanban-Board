import { useEffect, useRef, useState } from 'react';
import '../../style/Chat.css'; // Import the CSS file
import { Button, Form, Stack } from 'react-bootstrap';
import { usePeer } from '../../contexts/peerContext/usePeer';
import usePeerSocket from '../../hooks/usePeerSocekt';
import { FileDto, MessageDto, PeerPayload } from '../../dto/message.dto';
import { useAuth } from '../../contexts/authContext/useAuth';
import { createMessage, getMessagesBetweenUsers } from '../../api/message.api';
import { Download } from 'lucide-react';

interface ChatUIProps {
  activeUserId: string;
}

export default function ChatUI(props: ChatUIProps) {
  const [data, setData] = useState<MessageDto[]>([]);
  const [fileDownloaded, setFileDownloaded] = useState(true); // Track if the file was downloaded
  const { user } = useAuth();
  const [input, setInput] = useState<string>('');
  const { activeUserId } = props;
  // const { sendMessage } = usePeer();
  const { peerId } = usePeerSocket();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { sendMessage, sendFile, latestMessage, latestFile, setLatestFile } = usePeer();

  useEffect(() => {
    const fetchData = async () => {
      if (user?._id && activeUserId) {
        console.log('ab');
        const dataFromDb = await getMessagesBetweenUsers(user._id, activeUserId);
        setData(dataFromDb);
      }
    };
    fetchData();
  }, [activeUserId, user?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data]);

  useEffect(() => {
    if (latestMessage) {
      if (latestMessage.receiverId == user?._id) {
        setData((prevData) => [...prevData, latestMessage]);
      }
    }
  }, [latestMessage, user?._id]);

  const handleSend = async () => {
    if (input.trim()) {
      const payload: PeerPayload = {
        type: 'message',
        senderId: user?._id,
        receiverId: activeUserId,
        content: input.trim(),
        timestamp: new Date().toISOString(),
      };
      try {
        await createMessage(payload);
      } catch (error) {
        console.log(error);
      }
      setData([...data, payload]);
      if (peerId) {
        console.log('send message', peerId);
        sendMessage(peerId, input.trim());
      }
      setInput('');
    }
  };

  useEffect(() => {
    if (latestFile && Object.keys(latestFile).length > 0) {
      console.log('Latest file set: ', latestFile);
      setFileDownloaded(false);
    } else {
      setFileDownloaded(true);
    }
  }, [latestFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      console.log('Sending file: ', event.target.files[0]);
      sendFile(peerId, event.target.files[0]);
      setLatestFile({} as FileDto);
    }
  };

  const handleDownload = () => {
    setFileDownloaded(true); // Hide download button after clicking
  };

  return (
    <Stack direction="vertical" className="chat-container">
      {!activeUserId ? (
        <div className="center">
          <h1>Select a user and start a new chat</h1>
        </div>
      ) : (
        <>
          <div className="messages">
            {data.map((message, index) => (
              <div key={index} className={`message-bubble ${message.senderId === user?._id ? 'sent' : 'received'}`}>
                {message.content}
              </div>
            ))}
            {latestFile && !fileDownloaded && (
              <a
                href={latestFile.fileURL}
                download={latestFile.fileName}
                className="flex items-center gap-2 text-blue-500"
                onClick={handleDownload}
              >
                <Download className="h-5 w-5" />
                Download {latestFile.fileName}
              </a>
            )}
            <div ref={messagesEndRef} />
          </div>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Stack direction="horizontal" gap={3}>
              {/* Upload button  */}
              <Form.Group>
                <Form.Control type="file" onChange={handleFileChange} style={{ display: 'none' }} id="fileUpload" />
                <Button variant="primary" onClick={() => document.getElementById('fileUpload')?.click()}>
                  Upload
                </Button>
              </Form.Group>

              {/* Input field, parent Form */}
              <Form.Control
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                className="flex-grow-1"
              />
              <Button type="submit" variant="primary">
                Send
              </Button>
            </Stack>
          </Form>
        </>
      )}
    </Stack>
  );
}
