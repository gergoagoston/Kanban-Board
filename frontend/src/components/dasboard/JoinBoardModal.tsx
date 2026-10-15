import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { joinBoard } from '../../api/board.api';
import { BoardInDto } from '../../dto/board.dto';
import '../../style/Board.css';
import { axiosErrorHandler } from '../../utils/axiosErrorHandler';
import { useToast } from '../../contexts/toasterContext/useToaster';
import { useAuth } from '../../contexts/authContext/useAuth';

interface JoinBoardModalProps {
  show: boolean;
  handleClose: () => void;
  setBoards: React.Dispatch<React.SetStateAction<BoardInDto[]>>;
}

const JoinBoardModal: React.FC<JoinBoardModalProps> = ({ show, handleClose, setBoards }) => {
  const { showToast } = useToast();
  const [boardIdToJoin, setBoardIdToJoin] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleModalClose = () => {
    handleClose();
    setBoardIdToJoin('');
    setError('');
  };

  const handleJoinBoard = async () => {
    try {
      const data = await joinBoard(boardIdToJoin, user!._id);
      handleClose();
      setBoards((prevBoards) => prevBoards.concat(data));
      showToast('Board joined successfully', 'success');
      setBoardIdToJoin('');
    } catch (error) {
      setError(axiosErrorHandler(error));
      setBoardIdToJoin('');
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose} dialogClassName="custom-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>Join Board</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBoardId">
            <Form.Label>Board ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter board ID"
              value={boardIdToJoin}
              className="bg-transparent"
              onChange={(e) => setBoardIdToJoin(e.target.value)}
            />
          </Form.Group>
          {error && <div className="text-danger">{error}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="success" disabled={boardIdToJoin.trim() === ''} onClick={handleJoinBoard}>
          Join Board
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default JoinBoardModal;
