import { createError } from '../error.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import Video from '../models/Video.js'

export const update = async (req, res, next) => {
  // VERIFY USER_ID FROM TOKEN
  if (req.params.id === req.user.id) {
    try {
      // HARSH PASSWORD BEFORE SENDING INTO DB
      const salt = bcrypt.genSaltSync(10)
      const hash = bcrypt.hashSync(req.body.password, salt)
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: { ...req.body, password: hash },
        },

        { new: true }
      )

      res.status(200).json(updatedUser)
    } catch (err) {
      next(err)
    }
  } else {
    return next(createError(403, 'You can update only your account!'))
  }
}

// http://localhost:8080/api/users/62ee5e5f34cd65350ef7cf10
export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      await User.findByIdAndDelete(req.params.id)
      res.status(200).json('User has been deleted.')
    } catch (err) {
      next(err)
    }
  } else {
    return next(createError(403, 'You can delete only your account!'))
  }
}

// http://localhost:8080/api/users/find/62e93b93d663e6a2115842fa
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    res.status(200).json(user)
  } catch (err) {
    next(err)
  }
}

// INC NUMBER OF USERS
// http://localhost:8080/api/users/sub/62ee42dd08d37ac0223b89f2
export const subscribe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { subscribedUsers: req.params.id },
    })
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 },
    })
    res.status(200).json('Subscription successfull.')
  } catch (err) {
    next(err)
  }
}

// DEC NUMBER OF USERS
// http://localhost:8080/api/users/unsub/62ee42dd08d37ac0223b89f2
export const unsubscribe = async (req, res, next) => {
  try {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { subscribedUsers: req.params.id },
      })
      await User.findByIdAndUpdate(req.params.id, {
        $inc: { subscribers: -1 },
      })
      res.status(200).json('Unsubscription successfull.')
    } catch (err) {
      next(err)
    }
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/users/like/62f11e4605bf05cd2dff903e
export const like = async (req, res, next) => {
  const id = req.user.id
  const videoId = req.params.videoId
  try {
    await Video.findByIdAndUpdate(videoId, {
      // addToSet add an id into an array once but push add more than once
      $addToSet: { likes: id },
      $pull: { dislikes: id },
    })
    res.status(200).json('The video has been liked.')
  } catch (err) {
    next(err)
  }
}

// // http://localhost:8080/api/users/dislike/62f11e4605bf05cd2dff903e
export const dislike = async (req, res, next) => {
  const id = req.user.id
  const videoId = req.params.videoId
  try {
    await Video.findByIdAndUpdate(videoId, {
      $addToSet: { dislikes: id },
      $pull: { likes: id },
    })
    res.status(200).json('The video has been disliked.')
  } catch (err) {
    next(err)
  }
}
