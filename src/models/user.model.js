import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username:{
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true

        },
        email:{
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            index : true

        },
        fullName:{
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar:{
            type : String,
            required : true
            
        },
        coverImage:{
            type : String

        },
        watchHistory : [
            {
                type : Schema.Types.ObjectId,
                ref : "Videos"
            }
        ],
        password : {
            type : String,
            required : [true,"Password is required"]
        },
        refreshToken :{
            type : String

        }
    },
    {
        timestamps : true
    }
)

//arrow func k andar this ka reference nahi hota
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.method.generateAcessTokens = function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACESS_TOKEN_EXPIRY
        }
    )
}

userSchema.method.generateRefreshTokens = function(){
    return jwt.sign(
        {
            _id : this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema) 