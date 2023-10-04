import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError } from "./errors";

export interface CommentDoc extends BaseDoc {
    author: ObjectId;
    body: string;
    parent: ObjectId | null;
    group: ObjectId;
}

export default class CommentConcept {
    public readonly comments = new DocCollection<CommentDoc>("comments");

    async create(author: ObjectId, body: string, group: ObjectId) {
        const _id = await this.comments.createOne({ author, body, group});
        return { msg: "Comment successfully created!", comment: await this.comments.readOne({ _id })};
    }

    async remove(_id: ObjectId) {
        await this.comments.deleteOne({ _id });
        return { msg: "Comment deleted!"};
    }

    async reply(author: ObjectId, body: string, parent: ObjectId, group: ObjectId) {
        const _id = await this.comments.createOne({ author, body, parent, group});
        return { msg: "Comment successfully replied to!", comment: await this.comments.readOne({ _id })};
    }
}

export class CommentAuthorError extends NotAllowedError {
    constructor(
      public readonly author: ObjectId,
      public readonly _id: ObjectId,) {
      super("{0} is not the author of comment {1}!", author, _id);
    }
  }