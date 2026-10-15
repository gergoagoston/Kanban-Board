import { TaskOutDto } from '../dto/task.dto';
import { plainToInstance } from 'class-transformer';
import User from '../model/user.model';
import UserMapper from './user.mapper';
import redisClient from '../connection/redisClient';


export class TaskMapper {
     /**
     * Retrieves a user from the cache using the provided userId. If the user is not found in the cache,
     * it fetches the user from the database, caches the result, and returns the user data.
     * 
     * @param userId - The ID of the user to retrieve.
     * @returns The user data as a JSON object if found, otherwise null.
     */
    static async getUserFromCache(userId: string) {
        const cachedUser = await redisClient.get(`user:${userId}`);
        if (cachedUser) {
            return JSON.parse(cachedUser); // Return cached user if exists
        }

        // If not cached, fetch from DB
        const user = await User.findById(userId).exec();
        if (user) {
            const userDto = UserMapper.modelToDto(user);
            await redisClient.set(`user:${userId}`, JSON.stringify(userDto), { EX: 3600 }); // Set expiration to 1 hour
            return userDto;
        }
        return null;
    }

     /**
     * Maps a task model to a TaskOutDto. If the task has an assigned user, it retrieves the user data
     * from the cache or database.
     * 
     * @param task - The task model to map.
     * @returns A promise that resolves to a TaskOutDto.
     */
    static async modelToDto(task: any): Promise<TaskOutDto> {
        const assignedUser = task.assignedId ? await this.getUserFromCache(task.assignedId) : null;

        return plainToInstance(TaskOutDto, {
            _id: task._id,
            title: task.title ?? "",
            content: task.content ?? "",
            date: task.date ?? new Date(),
            status: task.status ?? 0,
            priority: task.priority ?? 0,
            assignedUser: assignedUser ?? null,
            boardId: task.boardId,
            estimation: task.estimation,
            hasEstimation: task.hasEstimation
        });
    }

     /**
     * Maps an array of task models to an array of TaskOutDtos.
     * 
     * @param tasks - The array of task models to map.
     * @returns A promise that resolves to an array of TaskOutDtos.
     */
    static async modelsToDtos(tasks: any[]): Promise<TaskOutDto[]> {
        return Promise.all(tasks.map(task => TaskMapper.modelToDto(task)));
    }
}

export default TaskMapper;
