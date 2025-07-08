"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const updateTask_service_1 = require("../../../src/services/tasks/updateTask.service");
const Task_1 = __importDefault(require("../../../src/models/Task"));
const Board_1 = __importDefault(require("../../../src/models/Board"));
// We mock the entire Mongoose models to isolate our service from the database
jest.mock('../../../src/models/Task');
jest.mock('../../../src/models/Board');
// Cast the mocked model to the right type so TypeScript is happy
const mockedTask = Task_1.default;
const mockedBoard = Board_1.default;
describe('Update Task Service', () => {
    it('should call findByIdAndUpdate with correct params and return the updated task', async () => {
        // Arrange: Set up our test data and what the mocks should return
        const taskId = '6688b6b12a8199218b4848d7';
        const updateData = { title: 'Updated Title' };
        const mockUpdatedTask = {
            ...updateData,
            _id: taskId,
            description: 'An existing description',
        };
        const mockBoard = { _id: 'board123' };
        // When findByIdAndUpdate is called, pretend it returns our mock task
        mockedTask.findByIdAndUpdate.mockResolvedValue(mockUpdatedTask);
        // When Board.findOne is called inside the service, return our mock board
        mockedBoard.findOne.mockResolvedValue(mockBoard);
        // Act: Call the service function we are testing
        const result = await (0, updateTask_service_1.updateTaskService)(taskId, updateData);
        // Assert: Check if the function behaved as expected
        expect(Task_1.default.findByIdAndUpdate).toHaveBeenCalledWith(taskId, updateData, { new: true });
        expect(result?.updatedTask).toEqual(mockUpdatedTask);
        expect(result?.boardId).toEqual('board123');
    });
    it('should return null if the task is not found', async () => {
        // Arrange: This time, we make the mock return null
        const taskId = 'nonexistent_id';
        const updateData = { title: 'This should not work' };
        mockedTask.findByIdAndUpdate.mockResolvedValue(null);
        // Act
        const result = await (0, updateTask_service_1.updateTaskService)(taskId, updateData);
        // Assert
        expect(result).toBeNull();
    });
});
