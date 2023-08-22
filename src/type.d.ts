import { Callback, DataWrapper } from 'asana';

declare module 'asana' {
  type DataWrapper<T> = {
    data: T;
  };
  type ErrorResponse = {
    message: string;
    errors?: any;
  };
  type Callback<T = unknown, R = void> = (
    error: ErrorResponse | null,
    data?: T,
    response?: any,
  ) => R;

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
      callback: Callback,
    ): void;

    getStoriesForTask(
      taskId: string,
      opts: { limit: number },
      callback: Callback,
    ): void;

    deleteStory(
      commentId: string,
      callback: (error: any, data: any) => void,
    ): void;
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
      callback: Callback,
    ): void;
  }

  interface constructFromObjectOptions {
    data: {
      text: string;
      is_pinned: boolean;
    };
  }

  export class TaskGidStoriesBody {
    data: {
      text: string;
      is_pinned: boolean;
    };
    constructor(data: { text: string; is_pinned: boolean });
    static constructFromObject(
      options: constructFromObjectOptions,
    ): TaskGidStoriesBody;
  }

  type Task = {
    gid: string;
    projects: Array<{
      gid: string;
      name?: string;
    }>;
  };

  export class TasksApi {
    updateTask(
      taskGid: string,
      body: TasksTaskGidBody,
      opts: { opt_fields: string[] },
      callback: Callback,
    ): void;
    getTask(
      taskGid: string,
      opts: { opt_fields: string[] },
      callback: Callback<DataWrapper<Task>>,
    ): void;
  }

  export class TasksTaskGidBody {
    data: {
      is_completed: boolean;
      [key: string]: unknown;
    };
    constructor(data: TasksTaskGidBody['data']);
    static constructFromObject(options: {
      data: TasksTaskGidBody['data'];
    }): TasksTaskGidBody;
  }

  type Section = {
    gid: string;
    name: string;
  };

  type GetSectionsForProjectCallback = (
    error: ErrorResponse | null,
    data?: DataWrapper<Section[]>,
    response?: any,
  ) => void;

  type SectionGidAddTaskBodyData = {
    task: string;
    insert_before?: string;
    insert_after?: string;
  };

  class SectionGidAddTaskBody {
    constructor(data: SectionGidAddTaskBodyData);
    static constructFromObject(
      data: DataWrapper<SectionGidAddTaskBodyData>,
    ): SectionGidAddTaskBody;
  }

  export class SectionsApi {
    getSectionsForProject(
      projectGid: string,
      opts: { limit: number; offset: string; opt_fields: string[] },
      callback: GetSectionsForProjectCallback,
    ): void;
    addTaskForSection(
      sectionGid: string,
      opts: { body: SectionGidAddTaskBody },
      callback: Callback,
    ): void;
  }
}
