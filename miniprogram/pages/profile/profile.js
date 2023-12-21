const db = wx.cloud.database(); // 初始化数据库
import Dialog from 'vant-weapp/dialog/dialog';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    commentArr: [],
    movieidArr: [],
    movieInfo: {},
    imgSrc: '',
    hasComment: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
  },

  onGotUserInfo: function(event) {
    wx.showLoading({
      title: '加载中',
    })
    console.log(event);
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      console.log(res);
      this.setData({
        detail: res.result
      });
      // 查询评论列表
      db.collection('comment').where({
        _openid: this.data.detail.openid
      }).orderBy('addDate', 'desc').get({
        success: res => {
          // res.data 是包含以上定义的两条记录的数组
          console.log(res.data)
          this.setData({
            commentArr: res.data
          })
          // 获取所有的电影ID
          for (var i = 0; i < res.data.length; i++) {
            this.data.movieidArr.push(res.data[i].movieid);
          }
          this.setData({
            movieidArr: this.data.movieidArr
          })
          // 查询电影名称
          // let mvids = new Set(this.data.movieidArr);
          // 去重
          let mvids = this.unique(this.data.movieidArr);
          for (let i = 0, len = mvids.length; i < len; i++) {
            wx.cloud.callFunction({
              name: 'getDetail',
              data: {
                movieid: mvids[i]
              }
            }).then(res => {
              // console.log(JSON.parse(res.result));
              // console.log(mvids[i]);
              let mid = mvids[i];
              this.data.movieInfo[mid] = JSON.parse(res.result)
              this.setData({
                movieInfo: this.data.movieInfo
              });
              console.log(this.data.movieInfo);
            }).catch(err => {
              console.error(err);
            });
          }
          wx.hideLoading();
        }
      })
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
    });
  },

  unique: function (arr){
    var n = [];
    for(var i=0; i<arr.length; i++){
      if(n.indexOf(arr[i]) == -1) n.push(arr[i]);
    }
    return n;
  },

  imgView: function (e) {
    this.setData({
      imgSrc: e.currentTarget.dataset.src
    })
  },

  imgBox: function (e) {

    wx.previewImage({
      current: this.data.imgSrc,
      urls: e.currentTarget.dataset.list
    })
  },

  delComment: function (e) {
    Dialog.confirm({
      title: '删除',
      message: '真的要删除这条评价吗？o(TヘTo)',
    }).then(() => {
      // on confirm
      let _id = e.currentTarget.dataset.itemid;
      let fileIds = e.currentTarget.dataset.fileids;
      db.collection('comment').doc(_id).remove({
        success: res => {
          console.log(res.data)
          // 删除对应云存储中的图片
          wx.cloud.deleteFile({
            fileList: fileIds,
            success: res => {
              this.onGotUserInfo()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              console.log(res.fileList)
            },
            fail: console.error
          })
        }
      })
    }).catch(() => {
      // on cancel
      wx.showToast({
        title: '吓死宝宝了(⊙ˍ⊙)',
        icon: 'none'
      })
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
    this.onGotUserInfo();
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
    // wx.startPullDownRefresh();
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