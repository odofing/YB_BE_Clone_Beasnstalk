import User from '../models/User.js'
import Video from '../models/Video.js'
import { createError } from '../error.js'

// http://localhost:8080/api/videos
export const addVideo = async (req, res, next) => {
  const newVideo = new Video({ userId: req.user.id, ...req.body })
  try {
    const savedVideo = await newVideo.save()
    res.status(200).json(savedVideo)
  } catch (err) {
    next(err)
  }
}

export const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) return next(createError(404, 'Video not found!'))
    if (req.user.id === video.userId) {
      const updatedVideo = await Video.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      )
      res.status(200).json(updatedVideo)
    } else {
      return next(createError(403, 'You can update only your video!'))
    }
  } catch (err) {
    next(err)
  }
}

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    if (!video) return next(createError(404, 'Video not found!'))
    if (req.user.id === video.userId) {
      await Video.findByIdAndDelete(req.params.id)
      res.status(200).json('The video has been deleted.')
    } else {
      return next(createError(403, 'You can delete only your video!'))
    }
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/videos/find/62f11e4605bf05cd2dff903e
export const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id)
    res.status(200).json(video)
  } catch (err) {
    next(err)
  }
}

export const addView = async (req, res, next) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 },
    })
    res.status(200).json('The view has been increased.')
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/videos/random
export const random = async (req, res, next) => {
  try {
    const videos = await Video.aggregate([{ $sample: { size: 40 } }])
    res.status(200).json(videos)
  } catch (err) {
    next(err)
  }
}

export const trend = async (req, res, next) => {
  try {
    const videos = await Video.find().sort({ views: -1 }) // -1 will return most viewed, 1 for less viewed
    res.status(200).json(videos)
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/videos/sub
export const sub = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    const subscribedChannels = user.subscribedUsers

    // fetch all videos created by subscribed users
    const list = await Promise.all(
      subscribedChannels.map(async (channelId) => {
        return await Video.find({ userId: channelId })
      })
    )

    res.status(200).json(
      // list.flat() // removed nested array and pull all into one mighty array!

      // list.flat().sort((a, b) => b.createdAt - a.createdAt)  // sort for the latest video

      list.flat().sort((a, b) => a.createdAt - b.createdAt) // sort for the oldest video
    )
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/videos/tags?tags=oil
export const getByTag = async (req, res, next) => {
  const tags = req.query.tags.split(',')
  console.log(tags)
  try {
    const videos = await Video.find({ tags: { $in: tags } }).limit(20)
    res.status(200).json(videos)
  } catch (err) {
    next(err)
  }
}

// http://localhost:8080/api/videos/search?q=2
export const search = async (req, res, next) => {
  const query = req.query.q
  try {
    const videos = await Video.find({
      title: { $regex: query, $options: 'i' },
    }).limit(40)
    res.status(200).json(videos)
  } catch (err) {
    next(err)
  }
}
