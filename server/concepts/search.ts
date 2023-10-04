import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SearchDoc extends BaseDoc {
    recommend: Set<ObjectId>;
    title: String;
    result: ObjectId | null;
}

export default class SearchConcept {
    public readonly search = new DocCollection<SearchDoc>("search");

    async newSearch(user: ObjectId, book: ObjectId) {
        return new Error("Not Implemented Yet");
    }

    async recommend(user: ObjectId, list: Set<ObjectId>) {
        return new Error("Not Implemented Yet");
    }
    // add in more working functions later
}