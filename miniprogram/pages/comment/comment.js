// miniprogram/pages/comment/comment.js
const db = wx.cloud.database(); // 初始化数据库
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    content: '', // 评价的内容
    score: 5, // 评价的分数
    images: [], // 上传的图片
    fileIds: [],
    movieId: -1,
    addDate: '' // 评价时间
  },

  onContentChange: function(event) {
    let objDate = new Date();
    let nowDate = objDate.toLocaleString();
    this.setData({
      content: event.detail,
      addDate: nowDate
    })
  },

  onScoreChange: function(event) {
    this.setData({
      score: event.detail
    })
  },

  afterRead: function (event) {
    const { file } = event.detail;
    for (var i=0; i<file.length; i++){
      this.data.images.push({ url: file[i].path, name: file[i].path })
    }
    this.setData({ images: this.data.images });
  },

  deleteImg: function (event) {
    this.data.images.splice(event.detail.index, 1)
    this.setData({ images: this.data.images})
  },

  submit: function() {
    wx.showLoading({
      title: '评价中',
    })
    if (this.data.content == '') {
      wx.showToast({
        icon: 'none',
        title: '请输入评价',
      })
      return false;
    }
    //上传图片到云存储
    let promiseArr = [];
    for (let i = 0; i < this.data.images.length; i++) {
      promiseArr.push(new Promise((reslove, reject) => {
        let item = this.data.images[i];
        let itemName = item.name
        let suffix = /\.\w+$/.exec(itemName); // 正则表达式，返回文件扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item.name, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            });
            reslove();
          },
          fail: console.error
        })
      }))
    }

    Promise.all(promiseArr).then(res => {
      // 插入数据
      db.collection('comment').add({
        data: {
          content: this.data.content,
          score: this.data.score,
          movieid: this.data.movieId,
          fileIds: this.data.fileIds,
          addDate: this.data.addDate
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评价成功',
        })
        this.setData({
          content: '',
          images: []
        })
      }).catch(err => {
        wx.hideLoading();
        wx.showToast({
          title: '评价失败',
        })
        this.setData({
          content: '',
          images: []
        })
      })
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      movieId: options.movieid
    });
    wx.showLoading({
      title: '玩命加载中',
    });
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      //console.log(res);
      this.setData({
        detail: JSON.parse(res.result)
      });
      wx.hideLoading();
    }).catch(err => {
      console.error(err);
      wx.hideLoading();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})