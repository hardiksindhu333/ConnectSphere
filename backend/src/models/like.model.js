import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
{
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },

    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }
},
{ timestamps: true }
);
// video like unique
likeSchema.index(
  { likedBy: 1, video: 1 },
  { unique: true, partialFilterExpression: { video: { $type: "objectId" } } }
);

// comment like unique
likeSchema.index(
  { likedBy: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $type: "objectId" } } }
);

// tweet like unique
likeSchema.index(
  { likedBy: 1, tweet: 1 },
  { unique: true, partialFilterExpression: { tweet: { $type: "objectId" } } }
);

export const Like = mongoose.model("Like", likeSchema);