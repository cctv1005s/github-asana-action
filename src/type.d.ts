declare module 'asana' {
    export class ApiClient {
        authentications: {
            oauth2: {
                accessToken: string;
            };
        };
        static instance: ApiClient;
    }

    export class StoriesApi {
        createStoryForTask(
            body: TaskGidStoriesBody,
            taskId: string,
            opts: { opt_fields: string[] },
            callback: (error: any, data: any) => void
        ): void;

        getStoriesForTask(
            taskId: string,
            opts: { limit: number },
            callback: (error: any, data: any) => void
        ): void;

        deleteStory(commentId: string, callback: (error: any, data: any) => void): void;
    }

    export class AttachmentsApi {
        createAttachmentForObject(
            opts: {
                resource_subtype: string;
                parent: string;
                url: string;
                name: string;
                connect_to_app: boolean;
            },
            callback: (error: any, data: any) => void
        ): void;
    }

    interface constructFromObjectOptions {
        data: {
            text: string;
            is_pinned: boolean;
        }
    }

    export class TaskGidStoriesBody {
        data: {
            text: string;
            is_pinned: boolean;
        };

        constructor(data: { text: string; is_pinned: boolean });
        static constructFromObject(options: constructFromObjectOptions): TaskGidStoriesBody;
    }

    export class TasksApi {
        updateTask(
            taskGid: string,
            body: TasksTaskGidBody,
            opts: { opt_fields: string[] },
            callback: (error: any, data: any, response: any) => void
        ): void;
    }

    export class TasksTaskGidBody {
        data: {
            is_completed: boolean;
            [key: string]: unknown;
        };

        constructor(data: TasksTaskGidBody['data']);
        static constructFromObject(options: { data: TasksTaskGidBody['data'] }): TasksTaskGidBody;
    }
}