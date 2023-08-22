import * as core from '@actions/core';
import * as github from '@actions/github';
import { AsanaClient } from './asana-client';

async function action() {
  const ASANA_PAT = core.getInput('asana-pat', { required: true });
  const ACTION = core.getInput('action', { required: true });
  const TRIGGER_PHRASE = core.getInput('trigger-phrase') || '';
  const PULL_REQUEST = github.context.payload.pull_request;
  const REGEX_STRING = `${TRIGGER_PHRASE}(?:\\s*)https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`;
  const REGEX = new RegExp(REGEX_STRING, 'g');

  const client = await new AsanaClient(ASANA_PAT);

  if (!PULL_REQUEST?.body) {
    return;
  }

  const foundAsanaTasks: string[] = [];
  let parseAsanaURL;
  while ((parseAsanaURL = REGEX.exec(PULL_REQUEST.body)) !== null) {
    const taskId = parseAsanaURL.groups?.task;
    if (!taskId) {
      core.error(
        `Invalid Asana task URL after the trigger phrase ${TRIGGER_PHRASE}`,
      );
      continue;
    }
    foundAsanaTasks.push(taskId);
  }

  console.info(
    `found ${foundAsanaTasks.length} taskIds:`,
    foundAsanaTasks.join(','),
  );
  console.info('calling', ACTION);

  switch (ACTION) {
    case 'assert-link': {
      const githubToken = core.getInput('github-token', { required: true });
      const linkRequired =
        core.getInput('link-required', { required: true }) === 'true';
      const octokit = new github.GitHub(githubToken);
      const statusState =
        !linkRequired || foundAsanaTasks.length > 0 ? 'success' : 'error';
      core.info(
        `setting ${statusState} for ${github.context.payload.pull_request?.head.sha}`,
      );

      // @ts-ignore
      await octokit.repos.createStatus({
        ...github.context.repo,
        context: 'asana-link-presence',
        state: statusState,
        description: 'asana link not found',
        sha: github.context.payload.pull_request?.head.sha,
      });
      break;
    }
    case 'add-comment': {
      const commentId = core.getInput('comment-id');
      const htmlText = core.getInput('text', { required: true });
      const isPinned = core.getInput('is-pinned') === 'true';
      const comments = [];
      for (const taskId of foundAsanaTasks) {
        if (commentId) {
          const comment = await client.findComment(taskId, commentId);
          if (comment) {
            console.info('found existing comment', comment.gid);
            continue;
          }
        }
        const comment = await client.addComment(
          taskId,
          commentId,
          htmlText,
          isPinned,
        );
        comments.push(comment);
      }
      return comments;
    }
    case 'remove-comment': {
      const commentId = core.getInput('comment-id', { required: true });
      const removedCommentIds: string[] = [];
      for (const taskId of foundAsanaTasks) {
        const comment = await client.findComment(taskId, commentId);
        if (comment) {
          console.info('removing comment', comment.gid);
          try {
            await client.removeComment(comment.gid);
          } catch (error) {
            console.error('rejecting promise', error);
          }
          removedCommentIds.push(comment.gid);
        }
      }
      return removedCommentIds;
    }
    case 'complete-task': {
      const isComplete = core.getInput('is-complete') === 'true';
      const taskIds: string[] = [];
      for (const taskId of foundAsanaTasks) {
        console.info(
          'marking task',
          taskId,
          isComplete ? 'complete' : 'incomplete',
        );
        try {
          await client.completeTask(taskId);
        } catch (error) {
          console.error('rejecting promise', error);
        }
        taskIds.push(taskId);
      }
      return taskIds;
    }
    case 'move-section': {
      const targetJSON = core.getInput('targets', { required: true });
      const targets: Array<any> = JSON.parse(targetJSON);
      const movedTasks: string[] = [];
      for (const taskId of foundAsanaTasks) {
        await client.moveSection(taskId, targets);
        movedTasks.push(taskId);
      }
      return movedTasks;
    }
    case 'attach-pr': {
      if (!PULL_REQUEST.html_url) {
        core.error('Pull request url not found');

        return;
      }

      for (const taskId of foundAsanaTasks) {
        await client.addAttachments(
          taskId,
          PULL_REQUEST.title,
          PULL_REQUEST.html_url,
        );
      }

      return;
    }
    default:
      core.setFailed(`unexpected action ${ACTION}`);
  }
}

export default action;
