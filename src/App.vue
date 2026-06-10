<script>
export default {
  onLaunch: function () {
    console.log('App Launch');
    uni.showShareMenu({
      withShareTicket: false,
      menus: ['shareAppMessage']
    });
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  },
  onShareAppMessage: function () {
    return {
      title: 'ScorePocket 台球记分助手',
      path: '/pages/index/index'
    };
  }
};
</script>

<style></style>
