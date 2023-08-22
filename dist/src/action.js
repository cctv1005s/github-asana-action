"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const asana_client_1 = require("./asana-client");
function action() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const ASANA_PAT = core.getInput('asana-pat', { required: true });
        const ACTION = core.getInput('action', { required: true });
        const TRIGGER_PHRASE = core.getInput('trigger-phrase') || '';
        const PULL_REQUEST = github.context.payload.pull_request;
        const REGEX_STRING = `${TRIGGER_PHRASE}(?:\\s*)https:\\/\\/app.asana.com\\/(\\d+)\\/(?<project>\\d+)\\/(?<task>\\d+)`;
        const REGEX = new RegExp(REGEX_STRING, 'g');
        const client = yield new asana_client_1.AsanaClient(ASANA_PAT);
        if (!(PULL_REQUEST === null || PULL_REQUEST === void 0 ? void 0 : PULL_REQUEST.body)) {
            return;
        }
        const foundAsanaTasks = [];
        let parseAsanaURL;
        while ((parseAsanaURL = REGEX.exec(PULL_REQUEST.body)) !== null) {
            const taskId = (_a = parseAsanaURL.groups) === null || _a === void 0 ? void 0 : _a.task;
            if (!taskId) {
                core.error(`Invalid Asana task URL after the trigger phrase ${TRIGGER_PHRASE}`);
                continue;
            }
            foundAsanaTasks.push(taskId);
        }
        console.info(`found ${foundAsanaTasks.length} taskIds:`, foundAsanaTasks.join(','));
        console.info('calling', ACTION);
        switch (ACTION) {
            case 'assert-link': {
                const githubToken = core.getInput('github-token', { required: true });
                const linkRequired = core.getInput('link-required', { required: true }) === 'true';
                const octokit = new github.GitHub(githubToken);
                const statusState = !linkRequired || foundAsanaTasks.length > 0 ? 'success' : 'error';
                core.info(`setting ${statusState} for ${github.context.payload.pull_request.head.sha}`);
                // @ts-ignore
                octokit.repos.createStatus(Object.assign(Object.assign({}, github.context.repo), { context: 'asana-link-presence', state: statusState, description: 'asana link not found', sha: github.context.payload.pull_request.head.sha }));
                break;
            }
            case 'add-comment': {
                const commentId = core.getInput('comment-id');
                const htmlText = core.getInput('text', { required: true });
                const isPinned = core.getInput('is-pinned') === 'true';
                const comments = [];
                for (const taskId of foundAsanaTasks) {
                    if (commentId) {
                        const comment = yield client.findComment(taskId, commentId);
                        if (comment) {
                            console.info('found existing comment', comment.gid);
                            continue;
                        }
                    }
                    const comment = yield client.addComment(taskId, commentId, htmlText, isPinned);
                    comments.push(comment);
                }
                return comments;
            }
            case 'remove-comment': {
                const commentId = core.getInput('comment-id', { required: true });
                const removedCommentIds = [];
                for (const taskId of foundAsanaTasks) {
                    const comment = yield client.findComment(taskId, commentId);
                    if (comment) {
                        console.info('removing comment', comment.gid);
                        try {
                            yield client.removeComment(comment.gid);
                        }
                        catch (error) {
                            console.error('rejecting promise', error);
                        }
                        removedCommentIds.push(comment.gid);
                    }
                }
                return removedCommentIds;
            }
            case 'complete-task': {
                const isComplete = core.getInput('is-complete') === 'true';
                const taskIds = [];
                for (const taskId of foundAsanaTasks) {
                    console.info('marking task', taskId, isComplete ? 'complete' : 'incomplete');
                    try {
                        yield client.completeTask(taskId);
                    }
                    catch (error) {
                        console.error('rejecting promise', error);
                    }
                    taskIds.push(taskId);
                }
                return taskIds;
            }
            case 'move-section': {
                const targetJSON = core.getInput('targets', { required: true });
                const targets = JSON.parse(targetJSON);
                const movedTasks = [];
                for (const taskId of foundAsanaTasks) {
                    yield client.moveSection(taskId, targets);
                    movedTasks.push(taskId);
                }
                return movedTasks;
            }
            case 'attach-pr': {
                if (!PULL_REQUEST.html_url) {
                    throw Error('Pull request url not found');
                }
                for (const taskId of foundAsanaTasks) {
                    yield client.addAttachments(taskId, PULL_REQUEST.title, PULL_REQUEST.html_url);
                }
                break;
            }
            default:
                core.setFailed(`unexpected action ${ACTION}`);
        }
    });
}
exports.default = action;
