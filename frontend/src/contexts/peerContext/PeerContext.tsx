import { createContext } from 'react';
import { FileDto, MessageDto } from '../../dto/message.dto';

interface PeerContextType {
  peerId: string | null;
  sendMessage: (toPeerId: string, message: string) => void;
  sendFile: (toPeerId: string,  file: File) => void;
  latestMessage: MessageDto;
  latestFile: FileDto;
  setLatestFile: React.Dispatch<React.SetStateAction<FileDto>>;
}

export const PeerContext = createContext<PeerContextType | null>(null);
