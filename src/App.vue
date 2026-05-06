<script>
import { getUserInfo, isLoggedIn } from '@/utils/auth'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.checkLoginStatus()
		},
		onShow: function() {
			console.log('App Show')
			this.checkLoginStatus()
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			checkLoginStatus() {
				const user = getUserInfo()
				if (isLoggedIn()) {
					console.log('已登录用户:', user.nickname)
				} else {
					console.log('游客模式')
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
