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

    private async checkParent(_id: ObjectId) {
        await this.commentExists(_id);
        const comment = await this.commentExists(_id);
        const parent = comment.parent;
        if (parent instanceof ObjectId) {
            return true;
        }
        return false;
    }

    private async getChild(_id: ObjectId) {
        return await this.comments.readMany({ parent: {$eq: _id } })
    }

    private async getParent(com: CommentDoc) {
        const allComments = await this.comments.readMany({});
        for (let i = 0; i < allComments.length; i ++ ){
            if (allComments[i] === com) {
                return allComments[i]
            }
        }
        throw new Error ("No Parent Found");
    }

    async remove(_id: ObjectId) {
        
        // await this.commentExists(_id);
        // const comment = await this.commentExists(_id);
        // const children = await this.getChild(_id);
        // if (!this.checkParent && children.length == 0) {
        //     await this.comments.deleteOne({ _id });
        // }
        // else if (!this.checkParent && children.length > 0) {
        //     for (let i = 0; i < children.length; i ++ ) {
        //         children[i].parent = null;
        //         await this.comments.updateOne(children[i], children[i]); // TODO CHECK IF CORRECT
        //     }
        //     await this.comments.deleteOne({ _id });
        // }
        // else {
        //     const parent = await this.getParent(comment);
        //     for (let i = 0; i < children.length; i ++) {
        //         await this.comments.updateOne()
        //         const child = children[i];
        //         child.parent = parent;
        //     }
        // }
        // return { msg: "Comment successfully deleted!"};
    }

    async reply(author: ObjectId, body: string, parent: ObjectId, group: ObjectId) {
        await this.canCreate(body);
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