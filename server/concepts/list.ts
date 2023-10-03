import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface ListDoc extends BaseDoc {
    name: String;
    books: Set<ObjectId>;
    admin: ObjectId;
}

export default class ListConcept {
    public readonly list = new DocCollection<ListDoc>("book");

    async newList(name: String, admin: ObjectId) {
        const _id = await this.list.createOne( {name, admin} );
        return { msg: "New List created!", list: await this.list.readOne({ _id })};
    }
    // add in more working functions later
}