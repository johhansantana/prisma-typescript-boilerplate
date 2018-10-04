import { prisma } from "./generated/prisma";
import { GraphQLServer } from "graphql-yoga";
import { Context } from "./utils";

const resolvers = {
  Query: {
    publishedPosts(root, args, context: Context) {
      return context.prisma.posts({ where: { published: true } });
    },
    post(root, args: { postId: string }, context: Context) {
      return context.prisma.post({ id: args.postId });
    },
    postByUser(root, args: { userId: string }, context: Context) {
      return context.prisma.user({ id: args.userId }).posts();
    }
  },
  Mutation: {
    createUser(root, args: { name: string }, context: Context) {
      return context.prisma.createUser({ name: args.name });
    },
    createDraft(
      root,
      args: { title: string; userId: string },
      context: Context
    ) {
      return context.prisma.createPost({
        title: args.title,
        author: { connect: { id: args.userId } }
      });
    },
    publish(root, args: { postId: string }, context: Context) {
      return context.prisma.updatePost({
        where: { id: args.postId },
        data: { published: true }
      });
    }
  },
  User: {
    posts(root, args, context: Context) {
      return context.prisma.user({ id: root.id }).posts();
    }
  },
  Post: {
    author(root, args, context: Context) {
      return context.prisma.post({ id: root.id }).author();
    }
  }
};

const server = new GraphQLServer({
  typeDefs: "src/schema.graphql",
  resolvers,
  context: params => ({
    ...params,
    prisma
  })
});
server.start(() => console.log("Server is running on http://localhost:4000"));
