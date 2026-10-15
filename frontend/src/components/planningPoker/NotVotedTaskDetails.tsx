import { Modal, Card, Stack, Button, Container } from 'react-bootstrap';
import '../../style/PlanningPoker.css';
import { deleteTask, updateTask } from '../../api/task.api';
import { useState } from 'react';
import { getPriorityClass } from '../../utils/PriorityClass';
import { VoteDto } from '../../dto/vote.dto';
import { useAuth } from '../../contexts/authContext/useAuth';
import { TaskInDto } from '../../dto/task.dto';
import { STORY_POINTS, TASK_STATUSES } from '../../constants/TaskContants';
import { formatDate } from '../../utils/FormatDate';
import useVoteSocket from '../../hooks/useVoteSocket';
interface TaskDetailsProps {
  showOwnerActions: boolean;
  task: TaskInDto;
  boardId: string;
  voteTask: (vote: VoteDto) => void;
}

function NotVotedPokerTaskDetails({ showOwnerActions, task, boardId, voteTask }: TaskDetailsProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const { getVotedUsers, votedUsers } = useVoteSocket();
  const [hasVoted, setHasVoted] = useState(false);
  const { user } = useAuth();
  const [selectedVote, setSelectedVote] = useState<number | null>(null);

  const handleShow = () => {
    setShow(true);

    if (showOwnerActions) {
      getVotedUsers(task._id);
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    const taskId = target.id;
    await deleteTask(taskId);
  };

  const handleVote = () => {
    console.log('handleVote ~~ ', task._id);
    if (user && selectedVote !== null) {
      voteTask({
        userId: user._id,
        taskId: task._id,
        boardId: boardId,
        vote: selectedVote,
      });
      setHasVoted(true);
    }
  };

  const moveToVoted = async () => {
    if (showOwnerActions) {
      task.status = TASK_STATUSES.VOTED;
      const data = await updateTask(task);
      console.log('Moved to Voted list: ', data);
    }
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
          <Stack direction="horizontal" gap={3}>
            <div className="custom-title">{task.title}</div>

            {(!task.canVote || hasVoted) && <div className="loading-animation ms-auto">✅</div>}
          </Stack>
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
          <div className='voted-users p-2'>{task.content}</div>
          <br />
          <div>
            {showOwnerActions && votedUsers.userNames.length > 0 && (
                <Container className="voted-users p-2 mb-2">
                <h5>Voted Users:</h5>
                  <Stack direction="horizontal" gap={3} className="flex-wrap">
                  {votedUsers.userNames.map((username: string, index: number) => (
                    <div key={index} className="voted-user">
                    <div>{username}</div>
                    <div className="ms-auto">{votedUsers.estimations?.[index]}</div>
                    </div>
                  ))}
                  </Stack>
                </Container>
            )}
            <Stack gap={1}>
              {task.canVote !== false && !hasVoted ? (
                <div className="d-flex flex-wrap gap-2 justify-content-center">
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
                  <Button
                    id={task._id}
                    variant="success"
                    size="sm"
                    className="vote-button flex-grow-1"
                    onClick={handleVote}
                    disabled={selectedVote === null}
                  >
                    Vote
                  </Button>
                </div>
              ) : (
                <p>You have already voted.</p>
              )}
              {showOwnerActions && (
                <Stack direction="horizontal" gap={2} className="justify-content-center p-2">
                  <Button id={task._id} variant="primary" onClick={moveToVoted} size="sm">
                    Move to the voted tasks
                  </Button>
                  <Button id={task._id} variant="danger" onClick={handleDelete} size="sm">
                    Delete
                  </Button>
                </Stack>
              )}
            </Stack>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default NotVotedPokerTaskDetails;
