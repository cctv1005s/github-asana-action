import { promisify } from 'util';
import Asana from 'asana';

import './type.d';

export class AsanaClient {
  private readonly storiesApi: Asana.StoriesApi;
  private readonly tasksApi: Asana.TasksApi;
  private readonly attachmentsApi: Asana.AttachmentsApi;
  private readonly sectionsApi: Asana.SectionsApi;

  constructor(asanaPAT: string) {
    const defaultClient = Asana.ApiClient.instance;
    const oauth2 = defaultClient.authentications['oauth2'];
    oauth2.accessToken = asanaPAT;

    this.storiesApi = new Asana.StoriesApi();
    this.tasksApi = new Asana.TasksApi();
    this.attachmentsApi = new Asana.AttachmentsApi();
    this.sectionsApi = new Asana.SectionsApi();
  }

  /**
   * Add a comment to a task
   * @param taskId
   * @param commentId
   * @param text
   * @param isPinned
   */
  async addComment(
    taskId: string,
    commentId: string,
    text: string,
    isPinned: boolean,
  ) {
    const data = {
      text,
      is_pinned: isPinned,
    };

    const body = new Asana.TaskGidStoriesBody.constructFromObject({ data });
    const opts = {};

    return await promisify(this.storiesApi.createStoryForTask).bind(
      this.storiesApi,
    )(body, taskId, opts);
  }

  /**
   * Find a comment
   * @param taskId
   * @param commentId
   */
  async findComment(taskId: string, commentId: string) {
    const opts = {
      limit: 200,
    };

    const comments = await promisify(this.storiesApi.createStoryForTask).bind(
      this.storiesApi,
    )(taskId, opts);
    return comments.find((c) => c.gid === commentId);
  }

  /**
   * Update a comment
   * @param taskId
   */
  async completeTask(taskId: string) {
    let apiInstance = new Asana.TasksApi();
    let body = new Asana.TasksTaskGidBody.constructFromObject({
      data: {
        is_completed: true,
      },
    });

    let opts = {};

    return promisify(apiInstance.updateTask).bind(apiInstance)(
      taskId,
      body,
      opts,
    );
  }

  /**
   * Remove a comment
   * @param commentId
   */
  async removeComment(commentId: string) {
    return promisify(this.storiesApi.deleteStory).bind(this.storiesApi)(
      commentId,
    );
  }

  /**
   * Get a task
   * @param taskId
   * @param fields
   */
  async getTask(taskId: string, fields: string[]) {
    const opts = {
      opt_fields: fields,
    };

    return promisify(this.tasksApi.getTask).bind(this.tasksApi)(taskId, opts);
  }

  /**
   * Move a task to a section
   * @param taskId
   * @param targets
   */
  async moveSection(
    taskId: string,
    targets: Array<{ project: string; section: string }>,
  ) {
    // get projects of a task
    const task = await this.getTask(taskId, ['projects', 'projects.name']);

    targets.map(async (t) => {
      // get project id of the target project
      const project = task.data.projects.find((p) => p.name === t.project);

      if (!project) {
        return;
      }

      const sections = await promisify(
        this.sectionsApi.getSectionsForProject,
      ).bind(this.sectionsApi)(project.gid, {
        opt_fields: ['name'],
      });

      const targetSection = sections.data.find((s) => s.name === t.section);

      if (!targetSection) {
        return;
      }

      // move task to section
      let opts = {
        body: new Asana.SectionGidAddTaskBody.constructFromObject({
          data: {
            task: taskId,
          },
        }),
      };

      await promisify(this.sectionsApi.addTaskForSection).bind(
        this.sectionsApi,
      )(targetSection.gid, opts);
    });
  }

  /**
   * Add an attachment to a task
   * @param taskId
   * @param prName
   * @param prUrl
   */
  async addAttachments(taskId: string, prName: string, prUrl: string) {
    const apiInstance = new Asana.AttachmentsApi();
    const opts = {
      resource_subtype: 'external',
      parent: taskId,
      url: prUrl,
      name: prName,
      connect_to_app: false,
    };

    return new Promise((resolve, reject) => {
      apiInstance.createAttachmentForObject(opts, (error, data) => {
        if (error) return reject(error);
        return reject(data);
      });
    });
  }
}
