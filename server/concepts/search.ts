import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface SearchDoc extends BaseDoc {
    recommend: Set<ObjectId>;
    title: String;
    result: ObjectId | null;
}

export default class SearchConcept {
    public readonly search = new DocCollection<SearchDoc>("search");

    // add in more working functions later
}