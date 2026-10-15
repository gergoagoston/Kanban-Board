import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import addTask from '../../assets/addTask.png';
import { TaskCreateDto } from '../../dto/task.dto';
import { insertTask } from '../../api/task.api';
import '../../style/AddTask.css';
import { PRIORITY_COLOR_LABELS } from '../../constants/TaskContants';
import { getPriorityClass } from '../../utils/PriorityClass';
import { Stack } from 'react-bootstrap';
import { useToast } from '../../contexts/toasterContext/useToaster';

interface AddTaskProps {
  boardId: string;
}

function AddTask({ boardId }: AddTaskProps) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('0'); // Default priority is "Low"
  const { showToast } = useToast();

  const handleClose = () => {
    setTitle('');
    setContent('');
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleSave = async () => {
    const newTask: TaskCreateDto = {
      title,
      content,
      priority: parseInt(priority), // Convert to integer
      boardId,
    };
    await insertTask(newTask);
    setTitle('');
    setContent('');
    setPriority('0');
    showToast('Task created successfully', 'success');
    handleClose();
  };

  return (
    <>
      <div className="ms-auto">
        <Button variant="secondary" className="custom-button" onClick={handleShow}>
          <img alt="Add task" src={addTask} className="kep"></img>
        </Button>
      </div>

      <Modal show={show} onHide={handleClose} dialogClassName="custom-modal" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTaskTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                className="transparent"
                placeholder="Enter task title"
                maxLength={30}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTaskContent">
              <Form.Label>Content</Form.Label>
              <Form.Control
                className="transparent"
                as="textarea"
                rows={3}
                placeholder="Enter task details"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTaskPriority">
              <Form.Label>Priority</Form.Label>
              <Stack direction="horizontal" className="justify-content-center gap-5">
                {Object.entries(PRIORITY_COLOR_LABELS).map(([index, label]) => (
                  <Button
                    key={index}
                    variant={priority === index ? 'dark' : 'outline-secondary'}
                    onClick={() => setPriority(index)}
                    id={getPriorityClass(parseInt(index))}
                    className={`w-25`}
                    disabled={priority === index}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="success" disabled={title.trim() === ''} onClick={handleSave}>
            Save Task
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AddTask;
