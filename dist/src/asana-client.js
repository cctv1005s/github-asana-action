"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsanaClient = void 0;
const util_1 = require("util");
const asana_1 = __importDefault(require("asana"));
require("./type.d");
class AsanaClient {
    constructor(asanaPAT) {
        const defaultClient = asana_1.default.ApiClient.instance;
        const oauth2 = defaultClient.authentications['oauth2'];
        oauth2.accessToken = asanaPAT;
        this.storiesApi = new asana_1.default.StoriesApi();
        this.tasksApi = new asana_1.default.TasksApi();
        this.attachmentsApi = new asana_1.default.AttachmentsApi();
        this.sectionsApi = new asana_1.default.SectionsApi();
    }
    /**
     * Add a comment to a task
     * @param taskId
     * @param commentId
     * @param text
     * @param isPinned
     */
    addComment(taskId, commentId, text, isPinned) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                text,
                is_pinned: isPinned,
            };
            const body = new asana_1.default.TaskGidStoriesBody.constructFromObject({ data });
            const opts = {};
            return yield (0, util_1.promisify)(this.storiesApi.createStoryForTask).bind(this.storiesApi)(body, taskId, opts);
        });
    }
    /**
     * Find a comment
     * @param taskId
     * @param commentId
     */
    findComment(taskId, commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = {
                limit: 200,
            };
            const comments = yield (0, util_1.promisify)(this.storiesApi.createStoryForTask).bind(this.storiesApi)(taskId, opts);
            return comments.find((c) => c.gid === commentId);
        });
    }
    /**
     * Update a comment
     * @param taskId
     */
    completeTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            let apiInstance = new asana_1.default.TasksApi();
            let body = new asana_1.default.TasksTaskGidBody.constructFromObject({
                data: {
                    is_completed: true,
                },
            });
            let opts = {};
            return (0, util_1.promisify)(apiInstance.updateTask).bind(apiInstance)(taskId, body, opts);
        });
    }
    /**
     * Remove a comment
     * @param commentId
     */
    removeComment(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, util_1.promisify)(this.storiesApi.deleteStory).bind(this.storiesApi)(commentId);
        });
    }
    /**
     * Get a task
     * @param taskId
     * @param fields
     */
    getTask(taskId, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = {
                opt_fields: fields,
            };
            return (0, util_1.promisify)(this.tasksApi.getTask).bind(this.tasksApi)(taskId, opts);
        });
    }
    /**
     * Move a task to a section
     * @param taskId
     * @param targets
     */
    moveSection(taskId, targets) {
        return __awaiter(this, void 0, void 0, function* () {
            // get projects of a task
            const task = yield this.getTask(taskId, ['projects', 'projects.name']);
            targets.map((t) => __awaiter(this, void 0, void 0, function* () {
                // get project id of the target project
                const project = task.data.projects.find((p) => p.name === t.project);
                if (!project) {
                    return;
                }
                const sections = yield (0, util_1.promisify)(this.sectionsApi.getSectionsForProject).bind(this.sectionsApi)(project.gid, {
                    opt_fields: ['name'],
                });
                const targetSection = sections.data.find((s) => s.name === t.section);
                if (!targetSection) {
                    return;
                }
                // move task to section
                let opts = {
                    body: new asana_1.default.SectionGidAddTaskBody.constructFromObject({
                        data: {
                            task: taskId,
                        },
                    }),
                };
                yield (0, util_1.promisify)(this.sectionsApi.addTaskForSection).bind(this.sectionsApi)(targetSection.gid, opts);
            }));
        });
    }
    /**
     * Add an attachment to a task
     * @param taskId
     * @param prName
     * @param prUrl
     */
    addAttachments(taskId, prName, prUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiInstance = new asana_1.default.AttachmentsApi();
            const opts = {
                resource_subtype: 'external',
                parent: taskId,
                url: prUrl,
                name: prName,
                connect_to_app: false,
            };
            return new Promise((resolve, reject) => {
                apiInstance.createAttachmentForObject(opts, (error, data) => {
                    if (error)
                        return reject(error);
                    return reject(data);
                });
            });
        });
    }
}
exports.AsanaClient = AsanaClient;
