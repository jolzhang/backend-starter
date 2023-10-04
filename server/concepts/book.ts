import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";

export interface BookDoc extends BaseDoc {
    title: String;
    author: ObjectId;
    groups: Set<ObjectId>;
    location: Set<String>;
    review: Number;
}

export default class BookConcept {
    public readonly book = new DocCollection<BookDoc>("book");

    async newBook(title: String, author: ObjectId) {
        const _id = await this.book.createOne( {title, author} );
        return { msg: "New Book created!", book: await this.book.readOne({ _id })};
    }

    async addGroup(title: String, g: ObjectId) {
        return new Error("Not Implemented Yet");
    }

    async removeGroup(title: String, g: ObjectId) {
        return new Error("Not Implemented Yet");
    }
    // add in more working functions later
}