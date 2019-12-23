# nodejs-chat-server
1.服务器架构
	n * loginserver + chatserver + webserver
	loginserver 负责登录验证，消息转发，维护客户端链接
	chatserver 负责主要的聊天逻辑
	webserver 负责一些http请求，获取一些数据等

客户端git:https://github.com/tency/chat-client.git
客户端体验地址：http://www.tap2joy.com/chat/