const { AuthentificationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if(context.user) {
                const userData = await User.findOne({_id: context.user._id}).select('-__v -password');

                return userData;
            }

            throw new AuthentificationError('You must be logged in');
        },
    },

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthentificationError('Credentials are incorrect');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
          },
          addThought: async (parent, { thoughtText }, context) => {
            if (context.user) {
              const thought = await Thought.create({
                thoughtText,
                thoughtAuthor: context.user.username,
              });
      
              await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { thoughts: thought._id } }
              );
      
              return thought;
            }
            throw new AuthenticationError('You need to be logged in!');
          },
          addComment: async (parent, { thoughtId, commentText }, context) => {
            if (context.user) {
              return Thought.findOneAndUpdate(
                { _id: thoughtId },
                {
                  $addToSet: {
                    comments: { commentText, commentAuthor: context.user.username },
                  },
                },
                {
                  new: true,
                  runValidators: true,
                }
              );
            }
            throw new AuthenticationError('You need to be logged in!');
          },
          removeThought: async (parent, { thoughtId }, context) => {
            if (context.user) {
              const thought = await Thought.findOneAndDelete({
                _id: thoughtId,
                thoughtAuthor: context.user.username,
              });
      
              await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { thoughts: thought._id } }
              );
      
              return thought;
            }
            throw new AuthenticationError('You need to be logged in!');
          },
          removeComment: async (parent, { thoughtId, commentId }, context) => {
            if (context.user) {
              return Thought.findOneAndUpdate(
                { _id: thoughtId },
                {
                  $pull: {
                    comments: {
                      _id: commentId,
                      commentAuthor: context.user.username,
                    },
                  },
                },
                { new: true }
              );
            }
            throw new AuthenticationError('You need to be logged in!');
          },
        },
      };
      
      module.exports = resolvers;      