import { Modal, Card, Stack, Button, Form, Container } from 'react-bootstrap';
import '../../style/PlanningPoker.css';
import { useState } from 'react';
import { deleteTask, updateTask } from '../../api/task.api';
import { getPriorityClass } from '../../utils/PriorityClass';
import { useAuth } from '../../contexts/authContext/useAuth';
import { TaskOutDto } from '../../dto/task.dto';
import { STORY_POINTS, TASK_STATUSES } from '../../constants/TaskContants';
import { UserInDto } from '../../dto/user.dto';
import { formatDate } from '../../utils/FormatDate';
import useVoteSocket from '../../hooks/useVoteSocket';

interface TaskDetailsProps {
  showOwnerActions: boolean;
  task: TaskOutDto;
  users: UserInDto[];
}

function VotedPokerTaskDetails({ showOwnerActions, task, users }: TaskDetailsProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedVote, setSelectedVote] = useState<number | null>(null);
  const { getVotedUsersWithEstimation, votedUsers } = useVoteSocket();
  const { user } = useAuth();

  const handleShow = () => {
    setShow(true);
    getVotedUsersWithEstimation(task._id);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    const taskId = target.id;
    await deleteTask(taskId);
    setShow(false);
  };

  const handleAdd = async (estimation: number, assignedId: string) => {
    if (user && selectedVote !== null) {
      task.status = TASK_STATUSES.TODO;
      task.estimation = estimation;
      task.assignedId = assignedId;
      const data = await updateTask(task);
      console.log('Added to main board the task: ', data);
    }
  };

  const handleRevote = async () => {
    task.status = TASK_STATUSES.NOT_VOTED;
    await updateTask(task);
  };

  return (
    <>
      <Card
        key={task._id}
        id={task._id}
        onClick={handleShow}
        className={` bg-transparent custom-task ${getPriorityClass(task?.priority)} `}
      >
        <Card.Title>
          <div className="custom-title">{task.title}</div>
        </Card.Title>

        <Card.Footer className="text-muted p-1">
          <Stack direction="horizontal">
            <div className="ms-auto">{formatDate(task.date)}</div>
          </Stack>
        </Card.Footer>
      </Card>

      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        dialogClassName="custom-modal"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{task.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="voted-users p-2">{task.content}</div>
          <br />
          <Container className="voted-users p-2 mb-2">
            <h5>Voted Users:</h5>
            {votedUsers.userNames.map((username: string, index: number) => (
                <Stack direction="horizontal" className='border-bottom border-secondary' key={index}>
                <div>{username}</div>
                <div className="ms-auto ">{votedUsers.estimations?.[index]}</div>
              </Stack>
            ))}
          </Container>
          {showOwnerActions && (
            <>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <Form.Group controlId="formUserSelect">
                  <Form.Control
                    as="select"
                    value={selectedUser || ''}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="custom-input "
                  >
                    <option value="" disabled className="custom-input">
                      Select a user
                    </option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id} className="custom-input">
                        {user.username}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Stack direction="horizontal" gap={2}>
                  {STORY_POINTS.map((point) => (
                    <Button
                      key={point}
                      variant={selectedVote === point ? 'dark' : 'outline-secondary'}
                      onClick={() => setSelectedVote(point)}
                      size="sm"
                      className="vote-button"
                    >
                      {point}
                    </Button>
                  ))}
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Button id={task._id} variant="warning" className="flex-grow-1" onClick={handleRevote} size="sm">
                    Vote Again
                  </Button>
                  {selectedUser && selectedVote && (
                    <Button
                      id={task._id}
                      variant="success"
                      className="flex-grow-1"
                      onClick={() => handleAdd(selectedVote!, selectedUser!)}
                      size="sm"
                    >
                      Add to the board
                    </Button>
                  )}
                  <Button id={task._id} variant="danger" className="flex-grow-1" onClick={handleDelete} size="sm">
                    Delete
                  </Button>
                </Stack>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default VotedPokerTaskDetails;
