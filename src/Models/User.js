import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

const userSchema = new mongoose.Schema({
    password: String,
    nick: {
      type:String,
      unique:true
    },
    plays: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Results'
      }
    ],
    wins: {
      type: Number,
      default: 0
    },
    playsCount: {
      type: Number,
      default: 0
    }
});

userSchema.methods.generateHash = pass => bcrypt.hashSync(pass, bcrypt.genSaltSync(8), null);

userSchema.methods.validPassword = function(pass, done) {
    bcrypt.compare(pass, this.password, (err, is) => {
        done(null,is)
    });
};
export default mongoose.model('User', userSchema);
