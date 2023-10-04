import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Comment, Friend, Group, Post, User, WebSession } from "./app";
import { PostDoc, PostOptions } from "./concepts/post";
import { UserDoc } from "./concepts/user";
import { WebSessionDoc } from "./concepts/websession";
import Responses from "./responses";

class Routes {
  @Router.get("/session")
  async getSessionUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await User.getUsers();
  }

  @Router.get("/users/:username")
  async getUser(username: string) {
    return await User.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: WebSessionDoc, username: string, password: string) {
    WebSession.isLoggedOut(session);
    return await User.create(username, password);
  }

  @Router.patch("/users")
  async updateUser(session: WebSessionDoc, update: Partial<UserDoc>) {
    const user = WebSession.getUser(session);
    return await User.update(user, update);
  }

  @Router.delete("/users")
  async deleteUser(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    WebSession.end(session);
    return await User.delete(user);
  }

  @Router.post("/login")
  async logIn(session: WebSessionDoc, username: string, password: string) {
    const u = await User.authenticate(username, password);
    WebSession.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: WebSessionDoc) {
    WebSession.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await User.getUserByUsername(author))._id;
      posts = await Post.getByAuthor(id);
    } else {
      posts = await Post.getPosts({});
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: WebSessionDoc, content: string, options?: PostOptions) {
    const user = WebSession.getUser(session);
    const created = await Post.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:_id")
  async updatePost(session: WebSessionDoc, _id: ObjectId, update: Partial<PostDoc>) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return await Post.update(_id, update);
  }

  @Router.delete("/posts/:_id")
  async deletePost(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    await Post.isAuthor(user, _id);
    return Post.delete(_id);
  }

  @Router.get("/friends")
  async getFriends(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await User.idsToUsernames(await Friend.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: WebSessionDoc, friend: string) {
    const user = WebSession.getUser(session);
    const friendId = (await User.getUserByUsername(friend))._id;
    return await Friend.removeFriend(user, friendId);
  }

  @Router.get("/friend/requests")
  async getRequests(session: WebSessionDoc) {
    const user = WebSession.getUser(session);
    return await Responses.friendRequests(await Friend.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.sendRequest(user, toId);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: WebSessionDoc, to: string) {
    const user = WebSession.getUser(session);
    const toId = (await User.getUserByUsername(to))._id;
    return await Friend.removeRequest(user, toId);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.acceptRequest(fromId, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: WebSessionDoc, from: string) {
    const user = WebSession.getUser(session);
    const fromId = (await User.getUserByUsername(from))._id;
    return await Friend.rejectRequest(fromId, user);
  }

  // Group Concept
  @Router.post("/group")
  async newGroup(session: WebSessionDoc, name: string, members: Set<ObjectId>) {
    const user = WebSession.getUser(session);
    return await Group.newGroup(user, name, members);
  }

  @Router.patch("/group/:_id")
  async updateGroup(session: WebSessionDoc, _id: ObjectId, u: ObjectId) {
    const user = WebSession.getUser(session);
    return await Group.joinGroup(_id, user);
  }

  @Router.patch("/group/:_id")
  async removeUser(session: WebSessionDoc, _id: ObjectId, admin: ObjectId) {
    const user = WebSession.getUser(session);
    return await Group.removeUser(_id, user, admin);
  }

  @Router.delete("/group/:_id")
  async deleteGroup(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Group.removeGroup(_id, user);
  }

  @Router.patch("/group/:_id")
  async updateAdmin(session: WebSessionDoc, _id: ObjectId, newUser: ObjectId) {
    const user = WebSession.getUser(session);
    return await Group.changeAdmin(_id, user, newUser);
  }

  // Comment Concept
  @Router.post("/comment")
  async createComment(session: WebSessionDoc, body: string, group: ObjectId) {
    const user = WebSession.getUser(session);
    return await Comment.create(user, body, group);
  }

  @Router.delete("/comment/:_id")
  async deleteComment(session: WebSessionDoc, _id: ObjectId) {
    const user = WebSession.getUser(session);
    return await Comment.remove(_id);
  }

  @Router.post("/comment")
  async replyComment(session: WebSessionDoc, body: string, parent: ObjectId, group: ObjectId) {
    const user = WebSession.getUser(session);
    return await Comment.reply(user, body, parent, group);
  }

  // Search Concept
  @Router.post("/search")
  async createSearch(session: WebSessionDoc, book: ObjectId) {
    return new Error("Not Implemented Yet");
  }

  @Router.patch("/search")
  async recommend(session: WebSessionDoc, list: Set<ObjectId>) {
    return new Error("Not Implemented Yet");
  }

  // List Concept
  @Router.post("/list")
  async createList(session: WebSessionDoc, name: String) {
    return new Error("Not Implemented Yet");
  }

  @Router.patch("/list")
  async addList(session: WebSessionDoc, name: String, b: ObjectId) {
    return new Error("Not Implemented Yet");
  }

  @Router.delete("/list")
  async removeList(session: WebSessionDoc, b: ObjectId) {
    return new Error("Not Implemented Yet");
  }

  // Book Concept
  @Router.post("/book")
  async newBook(session: WebSessionDoc, title: String, author: ObjectId) {
    return new Error("Not Implemented Yet");
  }

  @Router.patch("/book")
  async addGroup(session: WebSessionDoc, title: String, g: ObjectId) {
    return new Error("Not Implemented Yet");
  }

  @Router.patch("/book")
  async removeGroup(session: WebSessionDoc, g: ObjectId) {
    return new Error("Not Implemented Yet");
  }
}

export default getExpressRouter(new Routes());
