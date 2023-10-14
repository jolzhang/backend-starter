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

    // TODO
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

//     // Helper function that checks if group exists, throws Error if not
//     private async groupExists(_id: ObjectId) {
//         const group = await this.groups.readOne({ _id });
//         if (!group) {
//             throw new NotFoundError(`Group ${_id} does not exist!`);
//         }
//         return group;
//     }

//     // Helper function that checks if user is in the group, throws Error if not
//     private async checkInGroup(_id: ObjectId, user: ObjectId) {
//         await this.groupExists(_id);
//         const group = await this.groups.readOne({ _id });
//         if (group) {
//             return group.members.some((temp) => temp.equals(user));
//         }
//         throw new NotFoundError("User not in group")
//     }
    
//     async joinGroup(_id: ObjectId, user: ObjectId) {
//         await this.groupExists(_id);
//         const g = await this.groupExists(_id);
//         const inGroup = await this.checkInGroup(_id, user);
//         if (inGroup) {
//             return { msg: "User is already in group!", id: g};
//         }
//         else if (g) {
//             g.members.push(user);
//             await this.group.updateOne({ _id }, g);
//             return { msg: "Successfully added user to group!", id: g };
//         }
//         throw new Error("Could not successfully add user to group!");
//     }

//     // Helper function that checks if user is admin of group
//     private async isAdmin(_id: ObjectId, user: ObjectId) {
//         await this.groupExists(_id);
//         const group = await this.groupExists(_id);
//         console.log(group.admin);
//         if (group.admin.equals(user)) {
//             return true;
//         }
//         return false;
//     }

//     async removeSelf(_id: ObjectId, user: ObjectId) {
//         await this.groupExists(_id);
//         const g = await this.groupExists(_id);
//         const inGroup = await this.checkInGroup(_id, user);
//         if (inGroup && g) {
//             g.members = g.members.filter((u) => u !== user);
//             await this.group.updateOne({_id}, g);
//             return { msg : "Successfully removed user!", id: g };
//         }
//         throw new Error("Could not remove user!");
//     }

//     async removeOtherUser(_id: ObjectId, admin: ObjectId, removed: ObjectId) {
//         await this.groupExists(_id);
//         const g = await this.groupExists(_id);
//         const inGroup = await this.checkInGroup(_id, removed);
//         const isAdmin = await this.isAdmin(_id, admin);
//         const userNotAdmin = !(await this.isAdmin(_id, removed));
//         if (inGroup && isAdmin && userNotAdmin) {
//             g.members = g.members.filter((u) => !(u.equals(removed)));
//             await this.group.updateOne({_id}, g);
//             return { msg: "Successfully removed user!", id: g}
//         }
//         throw new Error("Could not remove user!");
//     }  

//     async removeGroup(_id: ObjectId, user: ObjectId) {
//         await this.groupExists(_id);
//         const group = await this.groupExists(_id);
//         const isAdmin = await this.isAdmin(_id, user);
//         if (group && isAdmin) {
//             this.group.deleteOne({ _id });
//             return { msg: "Successfuly deleted group!"};
//         }
//         throw new Error("Could not delete group!");
//     }

//     async changeAdmin(_id: ObjectId, admin: ObjectId, newUser: ObjectId) {
//         await this.groupExists(_id);
//         const g = await this.groupExists(_id);
//         const isAdmin = await this.isAdmin(_id, admin);
//         const inGroup = await this.checkInGroup(_id, newUser);
//         if (g && isAdmin && inGroup) {
//             g.admin = newUser;
//             this.group.updateOne({ _id }, g);
//             return { msg: "Successfully changed admin!", id: g};
//         }
//         throw new Error("Could not change admin for group!");
//     }

//     async changeName(_id: ObjectId, admin: ObjectId, newName: string) {
//         await this.groupExists(_id);
//         const g = await this.groupExists(_id);
//         const isAdmin = await this.isAdmin(_id, admin);
//         await this.canCreate(newName);
//         if (g && isAdmin) {
//             g.groupname = newName;
//             this.group.updateOne({ _id }, g);
//             return { msg: "Successfully changed group name!", id: g};
//         }
//         throw new Error("Could not change name for group");
//     }

//     async addComment(_id: ObjectId, comment: ObjectId) {
//         await this.groupExists(_id);
//         const g = await this.group.readOne({ _id });
//         if (g) {
//             g.comments.push(comment);
//             await this.group.updateOne({ _id }, g);
//             return { msg: "Successfully added a comment", id: g};
//         }
//     }

//     async getAllGroups() {
//         return await this.group.readMany({});
//     }

//     async getUserGroups(user: ObjectId) {
//         return await this.group.readMany({ members: { $elemMatch: { $eq: user } }});
//     }

//     async getUserAdminGroups(user: ObjectId) {
//         const userGroups = await this.getUserGroups(user);
//         const final = [];
//         for (let i = 0; i < userGroups.length; i ++ ) {
//             if (userGroups[i].admin.equals(user)) {
//                 final.push(userGroups[i])
//             }
//         }
//         return final;
//     }
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