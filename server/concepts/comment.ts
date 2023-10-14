import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface CommentDoc extends BaseDoc {
    author: ObjectId;
    body: string;
    parent: ObjectId | null;
    group: ObjectId;
}

export default class CommentConcept {
    public readonly comments = new DocCollection<CommentDoc>("comments");

    // Helper function that checks if comment string is not empty
    private async canCreate(com: string) {
        if (!com) {
            throw new BadValuesError("Name must be nonempty!");
        }
    }

    async create(author: ObjectId, body: string, group: ObjectId) {
        await this.canCreate(body);
        const parent = null;
        const _id = await this.comments.createOne({ author, body, parent, group });
        return { msg: "Comment successfully created!", comment: await this.comments.readOne({ _id })};
    }

    private async commentExists(_id: ObjectId) {
        const comment = await this.comments.readOne({ _id });
        if (!comment) {
            throw new NotFoundError(`Comment ${_id} does not exist`);
        }
        return comment
    }

    private async getAllChildren(_id: ObjectId) {
        await this.commentExists(_id);
        const queue = [_id];
        const sol = [];
        while (queue.length > 0) {
            let popped = queue.pop();
            const allComments = await this.comments.readMany( {parent: {$eq: popped }});
            for (let i = 0; i < allComments.length; i ++ ) {
                queue.push(allComments[i]._id);
                sol.push(allComments[i]._id);
            }
        }
        return sol;
    }

    private async isAuthor(_id: ObjectId, user: ObjectId) {
        await this.commentExists(_id);
        const comment = await this.commentExists(_id);
        if (comment.author.equals(user)) {
            return true;
        }
        throw new CommentAuthorError(user, _id);
    }
    async removeComment(_id: ObjectId, user: ObjectId) {
        await this.commentExists(_id);
        await this.isAuthor(_id, user);
        const allChildren = await this.getAllChildren(_id);
        for (let i = 0; i < allChildren.length; i ++) {
            this.comments.deleteOne(allChildren[i]);
        }
        return { msg: "Comment successfully deleted!" };
    }

    async reply(author: ObjectId, body: string, parent: ObjectId, group: ObjectId) {
        await this.canCreate(body);
        await this.commentExists(parent);
        const _id = await this.comments.createOne({ author, body, parent, group});
        return { msg: "Comment successfully replied to!", comment: await this.comments.readOne({ _id })};
    }

    async getComments(group: ObjectId) {
        return await this.comments.readMany({ groups: { $eq: group }});
    }
}

export class CommentAuthorError extends NotAllowedError {
    constructor(
      public readonly author: ObjectId,
      public readonly _id: ObjectId,) {
      super("{0} is not the author of comment {1}!", author, _id);
    }
}
