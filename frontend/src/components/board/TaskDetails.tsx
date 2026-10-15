import { Modal, Card, Container, Dropdown, Stack, Button } from 'react-bootstrap';
import { TaskInDto } from '../../dto/task.dto';
import { PRIORITY_COLOR_LABELS } from '../../constants/TaskContants';
import '../../style/Task.css';
// import { formatDate } from "../../utils/FormatDate";
import { useState } from 'react';
import { deleteTask, updateTask } from '../../api/task.api';
import { STATUS_LABELS, TASK_STATUSES } from '../../constants/TaskContants';
import { getPriorityClass } from '../../utils/PriorityClass';

interface TaskDetailsProps {
  task: TaskInDto;
}

function TaskDetails({ task }: TaskDetailsProps) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    const taskId = target.id;
    await deleteTask(taskId);
  };

  const handlePriorityChange = async (task: TaskInDto, priority: number) => {
    task.priority = priority;
    await updateTask(task);
  };

  const handleStatusChange = async (task: TaskInDto, status: number) => {
    task.status = status;
    await updateTask(task);
  };

  return (
    <>
      <Card
        key={task._id}
        id={task._id}
        onClick={handleShow}
        className={` bg-transparent custom-task ${getPriorityClass(task?.priority)}
				}`}
      >
        <Card.Title>{task.title}</Card.Title>

        <Card.Footer className="text-muted p-1">
          <Stack direction="horizontal">
            <div>Story Point: {task.estimation}</div>
            {task.assignedUser?.username && <div className="ms-auto">Assigned to: {task.assignedUser?.username}</div>}
          </Stack>
        </Card.Footer>
      </Card>

      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{task.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <Container fluid className="m-1">
              <div className="voted-users p-2 mb-4">{task.content}</div>
              <Stack gap={1}>
                <Dropdown className="w-100">
                  <Dropdown.Toggle variant="success" className="w-100" size="sm">
                    Priority
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-light w-100">
                    {Object.keys(PRIORITY_COLOR_LABELS).map((priority) => {
                      const priorityValue = Number(priority);
                      const isCurrentPriority = priorityValue === task.priority;
                      return (
                        <Dropdown.Item
                          key={priority}
                          disabled={isCurrentPriority}
                          onClick={() => {
                            if (!isCurrentPriority) {
                              handlePriorityChange(task, priorityValue);
                            }
                          }}
                          className="bg-light justify-content-center"
                        >
                          {PRIORITY_COLOR_LABELS[priorityValue]}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>

                <Container className="p-0">
                  {task.status === TASK_STATUSES.IN_PROGRESS && (
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        onClick={() => handleStatusChange(task, TASK_STATUSES.TODO)}
                        variant="secondary"
                        size="sm"
                        className="flex-grow-1"
                      >
                        {STATUS_LABELS[2]}
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(task, TASK_STATUSES.DONE)}
                        variant="secondary"
                        size="sm"
                        className="flex-grow-1"
                      >
                        {STATUS_LABELS[4]}
                      </Button>
                    </Stack>
                  )}
                </Container>
                {(task.status === TASK_STATUSES.TODO || task.status === TASK_STATUSES.DONE) && (
                  <Button
                    onClick={() => handleStatusChange(task, TASK_STATUSES.IN_PROGRESS)}
                    variant="secondary"
                    size="sm"
                  >
                    {STATUS_LABELS[3]}
                  </Button>
                )}
                <Button id={task._id} variant="danger" onClick={handleDelete} size="sm">
                  Delete
                </Button>
              </Stack>
            </Container>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default TaskDetails;
