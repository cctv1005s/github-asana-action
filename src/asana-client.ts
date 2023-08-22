import * as Asana from 'asana';
import './type';

export class AsanaClient {
    constructor(asanaPAT: string) {
        const defaultClient = Asana.ApiClient.instance;
        const oauth2 = defaultClient.authentications['oauth2'];
        oauth2.accessToken = asanaPAT;
    }

    /**
     * Add a comment to a task
     * @param taskId
     * @param commentId
     * @param text
     * @param isPinned
     */
    async addComment(taskId: string, commentId: string,  text: string,  isPinned: boolean) {
        const data = {
            text,
            is_pinned: isPinned
        }

        const apiInstance = new Asana.StoriesApi();
        const body = new Asana.TaskGidStoriesBody.constructFromObject({data});
        const opts = {
            'opt_fields': ["assignee","assignee.name","created_at","created_by","created_by.name","custom_field","custom_field.date_value","custom_field.date_value.date","custom_field.date_value.date_time","custom_field.display_value","custom_field.enabled","custom_field.enum_options","custom_field.enum_options.color","custom_field.enum_options.enabled","custom_field.enum_options.name","custom_field.enum_value","custom_field.enum_value.color","custom_field.enum_value.enabled","custom_field.enum_value.name","custom_field.is_formula_field","custom_field.multi_enum_values","custom_field.multi_enum_values.color","custom_field.multi_enum_values.enabled","custom_field.multi_enum_values.name","custom_field.name","custom_field.number_value","custom_field.resource_subtype","custom_field.text_value","custom_field.type","dependency","dependency.created_by","dependency.name","dependency.resource_subtype","duplicate_of","duplicate_of.created_by","duplicate_of.name","duplicate_of.resource_subtype","duplicated_from","duplicated_from.created_by","duplicated_from.name","duplicated_from.resource_subtype","follower","follower.name","hearted","hearts","hearts.user","hearts.user.name","html_text","is_editable","is_edited","is_pinned","liked","likes","likes.user","likes.user.name","new_approval_status","new_date_value","new_dates","new_dates.due_at","new_dates.due_on","new_dates.start_on","new_enum_value","new_enum_value.color","new_enum_value.enabled","new_enum_value.name","new_multi_enum_values","new_multi_enum_values.color","new_multi_enum_values.enabled","new_multi_enum_values.name","new_name","new_number_value","new_people_value","new_people_value.name","new_resource_subtype","new_section","new_section.name","new_text_value","num_hearts","num_likes","old_approval_status","old_date_value","old_dates","old_dates.due_at","old_dates.due_on","old_dates.start_on","old_enum_value","old_enum_value.color","old_enum_value.enabled","old_enum_value.name","old_multi_enum_values","old_multi_enum_values.color","old_multi_enum_values.enabled","old_multi_enum_values.name","old_name","old_number_value","old_people_value","old_people_value.name","old_resource_subtype","old_section","old_section.name","old_text_value","previews","previews.fallback","previews.footer","previews.header","previews.header_link","previews.html_text","previews.text","previews.title","previews.title_link","project","project.name","resource_subtype","source","sticker_name","story","story.created_at","story.created_by","story.created_by.name","story.resource_subtype","story.text","tag","tag.name","target","target.created_by","target.name","target.resource_subtype","task","task.created_by","task.name","task.resource_subtype","text","type"] // [String] | This endpoint returns a compact resource, which excludes some properties by default. To include those optional properties, set this query parameter to a comma-separated list of the properties you wish to include.
        };

        return new Promise((resolve, reject) => {
            apiInstance.createStoryForTask(body, taskId, opts, (error, data) => {
                if (error) return reject(error);
                return reject(data);
            });
        })
    }

    /**
     * Find a comment
     * @param taskId
     * @param commentId
     */
    async findComment(taskId: string, commentId: string) {
        const apiInstance = new Asana.StoriesApi();
        const opts = {
            'limit': 200
        };

        const comments = await (new Promise((resolve, reject) => {
            apiInstance.getStoriesForTask(taskId, opts, (error, data) => {
                if (error) return reject(error);
                return reject(data);
            });
        }));

        return comments.find(c => c.gid === commentId);
    }

    /**
     * Update a comment
     * @param taskId
     */
    async completeTask(taskId: string) {
        let apiInstance = new Asana.TasksApi();
        let body = new Asana.TasksTaskGidBody.constructFromObject({
            data: {
                is_completed: true
            }
        });
        let opts = {};

        return new Promise((resolve, reject) => {
            apiInstance.updateTask(taskId, body, opts, (error, data) => {
                if (error) return reject(error);
                return reject(data);
            });
        });
    }

    /**
     * Remove a comment
     * @param commentId
     */
    async removeComment(commentId: string) {
        const apiInstance = new Asana.StoriesApi();

        return new Promise((resolve, reject) => {
            apiInstance.deleteStory(commentId, (error, data) => {
                if (error) return reject(error);
                return reject(data);
            });
        });
    }

    /**
     * Move a task to a section
     * @param taskId
     * @param targets
     */
    async moveSection(taskId: string, targets: Array<any>) {

    }

    /**
     * Add an attachment to a task
     * @param taskId
     * @param prName
     * @param prUrl
     */
    async addAttachments(taskId: string, prName: string, prUrl: string ) {
        const apiInstance = new Asana.AttachmentsApi();
        const opts = {
            'resource_subtype': "external",
            'parent': taskId,
            'url': prUrl,
            'name': prName,
            'connect_to_app': false,
        };

        return new Promise((resolve, reject) => {
            apiInstance.createAttachmentForObject(opts, (error, data) => {
                if (error) return reject(error);
                return reject(data);
            });
        });
    }
}