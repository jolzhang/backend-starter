import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError, NotFoundError } from "./errors";

export interface GroupDoc extends BaseDoc {
    groupname: string;
    admin: ObjectId;
    members: Array<ObjectId>;
    comments: Array<ObjectId>;
}

export default class GroupConcept {
    public readonly groups = new DocCollection<GroupDoc>("groups");

    // Helper function that checks if group name given is unique
    private async isNameUnique(groupname: string) { 
        if (await this.groups.readOne({ groupname })) {
            throw new NotAllowedError(`Group with name ${groupname} already exists!`);
        }
    }

    // Helper function that checks if group name give is not empty
    private async canCreate(groupname: string) {
        if (!groupname) {
            throw new BadValuesError("Name must be nonempty!");
        }
        await this.isNameUnique(groupname);
    }

    async newGroup(admin: ObjectId, groupname: string) {
        const members = new Array<ObjectId>(admin);
        await this.canCreate(groupname);
        const _id = await this.groups.createOne( { admin, groupname, members });
        return { msg: "Successfully created a new group!", id: await this.groups.readOne({ _id })};
    }
    
    async getGroupfromName(name: string) {
        const group = await this.groups.readOne({ groupname: name });
        if (group) {
            return group;
        }
        throw new NotFoundError("Group Not Found from Name!");
    }

    // Helper function that checks if User is in group already
    private async checkInGroup(group: GroupDoc, user: ObjectId) {
        return group.members.some((temp) => temp.equals(user));
    }

    async joinGroup(user: ObjectId, name: string) {
        const group = await this.getGroupfromName(name);
        const inGroup = await this.checkInGroup(group, user);
        if (inGroup) {
            return { msg: "User is already in group!", id: group};
        }
        else if (group) {
            group.members.push(user);
            this.groups.updateOne({ _id: group._id}, { ...group, members: group.members })
            return { msg: "Successfully added user to group!", id: group };
        }
        throw new CouldNotAddUserError;
    }

    async removeSelf(user: ObjectId, name: string) {
        const group = await this.getGroupfromName(name);
        const inGroup = await this.checkInGroup(group, user);
        if (inGroup && group) {
            group.members.filter((u) => u !== user);
            await this.groups.updateOne({_id: group._id}, { ...group, members: group.members })
            return { msg: "Successfully removed yourself from group!", id: group };
        }
        throw new CouldNotRemoveUserError;
    }

    private async isAdmin(user: ObjectId, group: GroupDoc) {
        if (group.admin.equals(user)) {
            return true;
        }
        return false;
    }

    async removeOtherUser(user: ObjectId, otherUser: ObjectId, name: string) {
        const group = await this.getGroupfromName(name);
        const userIn = await this.checkInGroup(group, user);
        const otherUserIn = await this.checkInGroup(group, otherUser);
        const isAdmin = await this.isAdmin(user, group);
        if (group && userIn && otherUserIn && isAdmin) {
            group.members.filter((u) => u !== otherUser)
            await this.groups.updateOne({_id: group._id}, { ...group, members: group.members });
            return { msg: "Successfully removed user from group!", id: group };
        }
        throw new CouldNotRemoveUserError;
    }

    async removeGroup(user: ObjectId, name: string) {
        const group = await this.getGroupfromName(name);
        const isAdmin = await this.isAdmin(user, group);
        if (group && isAdmin) {
            await this.groups.deleteOne({_id: group._id});
            return { msg: "Successfully deleted group!" };
        }
        throw new CouldNotDeleteGroup;
    }

    async changeAdmin(user: ObjectId, newuser: ObjectId, name: string) {
        const group = await this.getGroupfromName(name);
        const isAdmin = await this.isAdmin(user, group);
        const inGroup = await this.checkInGroup(group, newuser);
        if (group && isAdmin && inGroup) {
            group.admin = newuser;
            await this.groups.updateOne({_id: group._id}, { admin: group.admin });
            return { msg: "Successfully changed admin of group!", id: group };
        }
        throw new CouldNotChangeAdmin;
    }

    async changeName(user: ObjectId, name: string, newname: string) {
        const group = await this.getGroupfromName(name);
        const isAdmin = await this.isAdmin(user, group);
        if (group && isAdmin) {
            group.groupname = newname;
            await this.groups.updateOne({_id: group._id}, { groupname: group.groupname });
            return { msg: "Successfully changed name of group!", id: group};
        }
        throw new CouldNotChangeName;
    }

    async addComment(name: string, comment: ObjectId) {
        const group = await this.getGroupfromName(name);
        if (group) {
            group.comments.push(comment);
            await this.groups.updateOne({_id: group._id}, { ...group, comments: group.comments });
            return { msg: "Succesfully added comment to group", id: group };
        }
        throw new CouldNotAddComment;
    }

    async getAllGroups() {
        return await this.groups.readMany({});
    }

    async getAllUserGroups(user: ObjectId) {
        return await this.groups.readMany({ members: { $elemMatch: { $eq: user } }});
    }
}

export class CouldNotAddUserError extends NotAllowedError {
    constructor() {
        super("Could not successfully remove user from group!");
    }
}

export class CouldNotRemoveUserError extends NotAllowedError {
    constructor() {
        super("Could not successfully remove user from group!");
    }
}

export class CouldNotDeleteGroup extends NotAllowedError {
    constructor() {
        super("Could not successfully delete group!");
    }
}

export class CouldNotChangeAdmin extends NotAllowedError {
    constructor() {
        super("Could not successfully change admin of group!");
    }
}

export class CouldNotChangeName extends NotAllowedError {
    constructor() {
        super("Could not successfully change groupname!");
    }
}

export class CouldNotAddComment extends NotAllowedError {
    constructor() {
        super("Could not successfully add comment to group!");
    }
}