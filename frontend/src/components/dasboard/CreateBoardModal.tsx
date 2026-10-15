import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { createBoard } from '../../api/board.api';
import { BoardInDto, BoardOutDto } from '../../dto/board.dto';
import '../../style/Board.css';
import { axiosErrorHandler } from '../../utils/axiosErrorHandler';
import { useToast } from '../../contexts/toasterContext/useToaster';
import { useAuth } from '../../contexts/authContext/useAuth';

interface CreateBoardModalProps {
  show: boolean;
  handleClose: () => void;
  setBoards: React.Dispatch<React.SetStateAction<BoardInDto[]>>;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ show, handleClose, setBoards }) => {
  const [newBoardName, setNewBoardName] = useState('');
  const { user } = useAuth();
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleModalClose = () => {
    handleClose();
    setNewBoardName('');
    setError('');
  };

  const handleCreateBoard = async () => {
    const board: BoardOutDto = { name: newBoardName, owner: user!._id };

    try {
      const data = (await createBoard(board)) as BoardInDto;
      data.owner = { _id: user!._id, username: user!.username };
      setBoards((prevBoards) => prevBoards.concat(data));
      handleClose();
      setNewBoardName('');
      showToast('Board created successfully', 'success');
    } catch (error) {
      setError(axiosErrorHandler(error));
      console.log(error);
    }
  };

  return (
    <Modal show={show} onHide={handleModalClose} dialogClassName="custom-modal" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Board</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="formBoardName">
            <Form.Label>Board Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter board name"
              value={newBoardName}
              className="bg-transparent"
              onChange={(e) => setNewBoardName(e.target.value)}
            />
          </Form.Group>
          {error && <div className="text-danger">{error}</div>}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="success" disabled={newBoardName.trim()===""} onClick={handleCreateBoard}>
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateBoardModal;
