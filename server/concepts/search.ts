import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SearchDoc extends BaseDoc {
    recommend: Set<ObjectId>;
    title: String;
    result: ObjectId | null;
}

export default class SearchConcept {
    public readonly search = new DocCollection<SearchDoc>("search");

    async newSearch(book: ObjectId, library: Array<ObjectId>) {
        for (let i = 0; i < library.length; i ++) {
            if (library[i].equals(book)) {
                return { msg: "Successfully found book", id: library[i]};
            }
        }
    }

    async recommend(user: ObjectId, list: Set<ObjectId>) {
        return new Error("Not Implemented Yet");
    }
    // add in more working functions later
}