import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
    admin: ObjectId;
    name: String;
    members: Set<ObjectId>;
}

export default class GroupConcept {
    public readonly group = new DocCollection<GroupDoc>("groups");

    async newGroup(admin: ObjectId, name: String, members: Set<ObjectId>) {
        const _id = await this.group.createOne( {admin, name, members });
        return { msg: "New Group created!", group: await this.group.readOne({ _id })};
    }

    async joinGroup(_id: ObjectId, user: ObjectId) {
        const group = await this.group.readOne({ _id });
        if (!group) {
            throw new NotFoundError(`Group ${_id} does not exist`);
        }
        else {
            group.members.add(user);
        }
        return { msg: "Group joined!"};
    }

    async removeUser(_id: ObjectId, user: ObjectId, admin: ObjectId) {
        const group = await this.group.readOne({ _id });
        if (!group) {
            throw new NotFoundError(`Group ${_id} does not exist`);
        }
        else if (group.admin !== admin) {
            throw new Error(`Cannot change group`);
        }
        else {
            group.members.delete(user);
        }
        return { msg: "Removed User"};
    }

    async removeGroup(_id: ObjectId, admin: ObjectId) {
        const group = await this.group.readOne({ _id });
        if (!group) {
            throw new NotFoundError(`Group ${_id} does not exist`);
        }
        else if (group.admin !== admin) {
            throw new Error(`Cannot change group`);
        }
        else {
            this.group.deleteOne({ _id });
        }
        return { msg: "Deleted Group"};
    }

    async changeAdmin(_id: ObjectId, admin: ObjectId, newUser: ObjectId) {
        const group = await this.group.readOne({ _id });
        if (!group) {
            throw new NotFoundError(`Group ${_id} does not exist`);
        }
        else if (group.admin !== admin) {
            throw new Error(`Cannot change group`);
        }
        else {
            group.admin = newUser;
        }
        return { msg: "Admin Changed"};
    }
}