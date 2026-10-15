import { plainToInstance } from 'class-transformer';
import { TaskVoteOutDto, VoteInDto } from '../dto/vote.dto';
import { UserOutDto } from '../dto/user.dto';

export class VoteMapper {
    static modelToDto(vote: any): VoteInDto {
        return plainToInstance(VoteInDto, {
            userId:vote.userId,
            taskId:vote.taskId,
            boardId:vote.userId,
            vote:vote.vote,
        });
    }

    static modelToVoteDto(task: any, user: UserOutDto | null): TaskVoteOutDto {
        return plainToInstance(TaskVoteOutDto, {

            _id: task._id,
            title: task.title ?? "",
            content: task.content ?? "",
            date: task.date ?? new Date(),
            status: task.status ?? 0,
            priority: task.priority ?? 0,
            assignedUser: user ?? null,
            boardId: task.boardId,
            estimation: task.estimation,
            hasEstimation:task.hasEstimation,
            canVote: true
        });
    }

    static modelsToVoteDtos(tasks: any[], users: UserOutDto[]): TaskVoteOutDto[] {
        return tasks.map((task, index) => VoteMapper.modelToVoteDto(task, users[index]));
    }

}

export default VoteMapper;
